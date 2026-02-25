import * as path from 'node:path'
import type { ChatCompletionMessageParam } from 'openai/resources'
import { ChatHistoryManager, type Message, type UserChatHistory } from './chatHistory'
import type { ChatCompletionService } from './openaiChat'
import { OpenAIChatService } from './openaiChat'
import { GeminiChatService } from './geminiChat'
import { aiProvider } from '@/config'

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'
export const DEFAULT_SYSTEM_MESSAGE = 'You are a helpful assistant.'
export const DEFAULT_DELETION_THRESHOLD_WEEKS = 2

function defaultHistoryPath() {
  // dist/services/gptAnswer.js -> dist/services/chat_history.json
  return path.join(__dirname, 'chat_history.json')
}

export function processAnswer(answer: string): string {
  const aiIndicators = ['modelo de linguagem', 'inteligência artificial', 'Como uma IA', 'Como IA']
  for (const indicator of aiIndicators) {
    if (answer.includes(indicator)) {
      const dotIndex = answer.indexOf('.')
      if (dotIndex !== -1 && dotIndex < answer.length - 1) {
        return answer.slice(dotIndex + 2)
      }
    }
  }
  return answer
}

export function createGptService(opts: {
  historyFilePath?: string
  openai?: ChatCompletionService
  model?: string
  systemMessage?: string
  deletionThresholdWeeks?: number
} = {}) {
  const historyFilePath = opts.historyFilePath ?? defaultHistoryPath()
  const chatHistoryManager = new ChatHistoryManager(historyFilePath)

  const provider = (opts.openai ??
    (aiProvider === 'gemini' ? new GeminiChatService() : new OpenAIChatService())) as ChatCompletionService

  const model = opts.model ?? DEFAULT_OPENAI_MODEL
  const systemMessage = opts.systemMessage ?? DEFAULT_SYSTEM_MESSAGE
  const deletionThresholdWeeks = opts.deletionThresholdWeeks ?? DEFAULT_DELETION_THRESHOLD_WEEKS

  async function gptAnswer(question: string, userId: string, username?: string): Promise<string> {
    try {
      const chatHistory = await chatHistoryManager.load()
      if (!chatHistory[userId]) chatHistory[userId] = []

      const userMessage: Message = { role: 'user', content: question, timestamp: Date.now(), username }
      chatHistory[userId].push(userMessage)
      await chatHistoryManager.save(chatHistory)

      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemMessage },
        ...chatHistory[userId].map((msg) => ({ role: msg.role, content: msg.content })),
      ]

      const answer = await provider.getChatCompletion(messages)
      if (!answer) return 'gpt foi de base kkkkkk'

      const assistantMessage: Message = { role: 'assistant', content: answer, timestamp: Date.now() }
      chatHistory[userId].push(assistantMessage)
      await chatHistoryManager.save(chatHistory)

      return processAnswer(answer)
    } catch (error) {
      console.error('GPT error:', error)
      return String(error)
    }
  }

  async function deleteOldMessages(): Promise<string> {
    const chatHistory: UserChatHistory = await chatHistoryManager.load()
    const deletionThreshold = Date.now() - deletionThresholdWeeks * 7 * 24 * 60 * 60 * 1000
    const deletedCounts: Record<string, { username?: string; count: number }> = {}
    const logs: string[] = []

    for (const userId in chatHistory) {
      const initialMessageCount = chatHistory[userId].length
      const remainingMessages = chatHistory[userId].filter((msg) => msg.timestamp >= deletionThreshold)
      const deletedCount = initialMessageCount - remainingMessages.length

      if (deletedCount > 0) {
        const firstDeletedMessage = chatHistory[userId].find((msg) => msg.timestamp < deletionThreshold)
        const username = firstDeletedMessage?.username
        deletedCounts[userId] = { username, count: deletedCount }
      }
      chatHistory[userId] = remainingMessages
    }

    await chatHistoryManager.save(chatHistory)

    if (Object.keys(deletedCounts).length > 0) {
      logs.push('*Chat history cleanup (older than two weeks):*')
      for (const userId in deletedCounts) {
        const userInfo = deletedCounts[userId].username ? `(*${deletedCounts[userId].username}*)` : '(username not available)'
        logs.push(`  User *${userId}* ${userInfo}: Deleted *${deletedCounts[userId].count}* messages.`)
      }
    } else {
      logs.push('*Chat history cleanup (older than two weeks):* No old messages to delete.')
    }

    return logs.join('\n')
  }

  return { gptAnswer, deleteOldMessages }
}

// Backwards-compatible exports used by the bot (lazy init to avoid env dependency at import time)
let _defaultSvc: ReturnType<typeof createGptService> | null = null
function defaultSvc() {
  if (!_defaultSvc) _defaultSvc = createGptService()
  return _defaultSvc
}

export const gptAnswer = (...args: Parameters<ReturnType<typeof createGptService>['gptAnswer']>) => defaultSvc().gptAnswer(...args)
export const deleteOldMessages = (...args: Parameters<ReturnType<typeof createGptService>['deleteOldMessages']>) =>
  defaultSvc().deleteOldMessages(...args)
