import * as fs from 'fs/promises';
import { OpenAI } from 'openai';
import * as path from 'path';

// Initialize OpenAI (assuming you have your API key in environment variables)
const openai = new OpenAI();

// Define the path to the chat history JSON file
const CHAT_HISTORY_FILE = path.join(__dirname, 'data', 'chat_history.json');

// Interface for a single message
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  username?: string; // Optional username
}

// Interface for user chat history
interface UserChatHistory {
  [userId: string]: Message[];
}

async function loadChatHistory(): Promise<UserChatHistory> {
  try {
    const data = await fs.readFile(CHAT_HISTORY_FILE, 'utf-8');
    return JSON.parse(data) as UserChatHistory;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return an empty object
      return {};
    }
    console.error('Error loading chat history:', error);
    return {};
  }
}

async function saveChatHistory(history: UserChatHistory): Promise<void> {
  try {
    await fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

export async function gptAnswer(question: string, userId: string, username?: string): Promise<string> {
  try {
    let chatHistory = await loadChatHistory();

    // Ensure the user has an entry in the history
    if (!chatHistory[userId]) {
      chatHistory[userId] = [];
    }

    // Add the current user question to the history with username
    chatHistory[userId].push({ role: 'user', content: question, timestamp: Date.now(), username });
    await saveChatHistory(chatHistory);

    // Prepare messages for OpenAI, including system message and user's chat history
    const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...chatHistory[userId].map(msg => ({ role: msg.role, content: msg.content })),
    ];

    const data = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    let answer: string | null = data.choices[0].message?.content;
    if (!answer || !data) {
      return 'gpt foi de base kkkkkk';
    }

    // Add the assistant's reply to the chat history
    chatHistory[userId].push({ role: 'assistant', content: answer, timestamp: Date.now() });
    await saveChatHistory(chatHistory);

    if (
      answer.includes('modelo de linguagem') ||
      answer.includes('inteligência artificial') ||
      answer.includes('Como uma IA') ||
      answer.includes('Como IA')
    ) {
      const dotIndex = answer.indexOf('.');
      if (dotIndex !== -1 && dotIndex < answer.length - 1) {
        answer = answer.slice(dotIndex + 2);
      }
    }

    return answer;
  } catch (error) {
    console.error('GPT error:', error);
    return String(error);
  }
}

// Function to delete messages older than one week and log deleted counts with usernames
export async function deleteOldMessages(): Promise<string> {
  const chatHistory = await loadChatHistory();
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000; // Calculate timestamp for two weeks ago
  const deletedCounts: { [userId: string]: { username?: string; count: number } } = {};
  const logs: string[] = [];

  for (const userId in chatHistory) {
    const initialMessageCount = chatHistory[userId].length;
    const remainingMessages = chatHistory[userId].filter(msg => msg.timestamp >= twoWeeksAgo);
    const deletedCount = initialMessageCount - remainingMessages.length;

    if (deletedCount > 0) {
      // Try to get the username from one of the deleted messages (if any existed)
      const firstDeletedMessage = chatHistory[userId].find(msg => msg.timestamp < twoWeeksAgo);
      const username = firstDeletedMessage?.username;

      deletedCounts[userId] = { username, count: deletedCount };
    }
    chatHistory[userId] = remainingMessages; // Update the chat history for the user
  }

  await saveChatHistory(chatHistory);

  if (Object.keys(deletedCounts).length > 0) {
    logs.push('*Chat history cleanup (older than one week):*');
    for (const userId in deletedCounts) {
      const userInfo = deletedCounts[userId].username ? `(*${deletedCounts[userId].username}*)` : '(username not available)';
      logs.push(`  User *${userId}* ${userInfo}: Deleted *${deletedCounts[userId].count}* messages.`);
    }
  } else {
    logs.push('*Chat history cleanup (older than one week):* No old messages to delete.');
  }
  return logs.join('\n');
}