import * as fs from 'fs/promises';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import * as path from 'path';

// Configuration (move this to a config file if needed)
const CHAT_HISTORY_FILE = path.join(__dirname, 'chat_history.json');
const OPENAI_MODEL = 'gpt-4o-mini';
const SYSTEM_MESSAGE = 'You are a helpful assistant.';
const DELETION_THRESHOLD_WEEKS = 2; // Weeks for old message deletion

// Interfaces
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  username?: string;
}

interface UserChatHistory {
  [userId: string]: Message[];
}

// Chat History Management
class ChatHistoryManager {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<UserChatHistory> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as UserChatHistory;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {};
      }
      console.error('Error loading chat history:', error);
      return {};
    }
  }

  async save(history: UserChatHistory): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(history, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
}

// OpenAI Interaction
class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async getChatCompletion(messages: ChatCompletionMessageParam[]): Promise<string | null> {
    try {
      const data = await this.openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: messages,
      });
      return data.choices[0].message?.content || null;
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }
}

// Service Logic
const chatHistoryManager = new ChatHistoryManager(CHAT_HISTORY_FILE);
const openAIService = new OpenAIService();

export async function gptAnswer(question: string, userId: string, username?: string): Promise<string> {
  try {
    let chatHistory = await chatHistoryManager.load();

    if (!chatHistory[userId]) {
      chatHistory[userId] = [];
    }

    const userMessage: Message = { role: 'user', content: question, timestamp: Date.now(), username };
    chatHistory[userId].push(userMessage);
    await chatHistoryManager.save(chatHistory);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_MESSAGE },
      ...chatHistory[userId].map(msg => ({ role: msg.role, content: msg.content })),
    ];

    const answer = await openAIService.getChatCompletion(messages);
    if (!answer) {
      return 'gpt foi de base kkkkkk';
    }

    const assistantMessage: Message = { role: 'assistant', content: answer, timestamp: Date.now() };
    chatHistory[userId].push(assistantMessage);
    await chatHistoryManager.save(chatHistory);

    return processAnswer(answer);
  } catch (error) {
    console.error('GPT error:', error);
    return String(error);
  }
}

function processAnswer(answer: string): string {
  const aiIndicators = ['modelo de linguagem', 'inteligência artificial', 'Como uma IA', 'Como IA'];
  for (const indicator of aiIndicators) {
    if (answer.includes(indicator)) {
      const dotIndex = answer.indexOf('.');
      if (dotIndex !== -1 && dotIndex < answer.length - 1) {
        return answer.slice(dotIndex + 2);
      }
    }
  }
  return answer;
}

export async function deleteOldMessages(): Promise<string> {
  const chatHistory = await chatHistoryManager.load();
  const deletionThreshold = Date.now() - DELETION_THRESHOLD_WEEKS * 7 * 24 * 60 * 60 * 1000;
  const deletedCounts: { [userId: string]: { username?: string; count: number } } = {};
  const logs: string[] = [];

  for (const userId in chatHistory) {
    const initialMessageCount = chatHistory[userId].length;
    const remainingMessages = chatHistory[userId].filter(msg => msg.timestamp >= deletionThreshold);
    const deletedCount = initialMessageCount - remainingMessages.length;

    if (deletedCount > 0) {
      const firstDeletedMessage = chatHistory[userId].find(msg => msg.timestamp < deletionThreshold);
      const username = firstDeletedMessage?.username;
      deletedCounts[userId] = { username, count: deletedCount };
    }
    chatHistory[userId] = remainingMessages;
  }

  await chatHistoryManager.save(chatHistory);

  if (Object.keys(deletedCounts).length > 0) {
    logs.push('*Chat history cleanup (older than two weeks):*');
    for (const userId in deletedCounts) {
      const userInfo = deletedCounts[userId].username ? `(*${deletedCounts[userId].username}*)` : '(username not available)';
      logs.push(`  User *${userId}* ${userInfo}: Deleted *${deletedCounts[userId].count}* messages.`);
    }
  } else {
    logs.push('*Chat history cleanup (older than two weeks):* No old messages to delete.');
  }
  return logs.join('\n');
}