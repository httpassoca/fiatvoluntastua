import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import type { ChatCompletionService } from './openaiChat'
import { geminiApiKey } from '@/config'

export type GeminiHistoryItem = {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

/**
 * Convert OpenAI-style message list into Gemini chat format.
 *
 * - system messages become `systemInstruction`
 * - all user/assistant messages before the last user message become `history`
 * - the last user message becomes the `userMessage` input
 */
export function toGeminiChat(messages: ChatCompletionMessageParam[]): {
  systemInstruction: string
  history: GeminiHistoryItem[]
  userMessage: string
} {
  const systemInstruction = messages
    .filter((m) => m.role === 'system')
    .map((m) => (typeof m.content === 'string' ? m.content : ''))
    .filter(Boolean)
    .join('\n')

  // Find last user message index
  let lastUserIndex: number | null = null
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === 'user') {
      lastUserIndex = i
      break
    }
  }

  const userMessage =
    lastUserIndex == null
      ? ''
      : typeof messages[lastUserIndex]?.content === 'string'
        ? (messages[lastUserIndex]!.content as string)
        : ''

  const before = lastUserIndex == null ? messages : messages.slice(0, lastUserIndex)
  const history: GeminiHistoryItem[] = before
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      const text = typeof m.content === 'string' ? m.content : ''
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      }
    })

  return { systemInstruction, history, userMessage }
}

export class GeminiChatService implements ChatCompletionService {
  private genai: GoogleGenerativeAI

  constructor(opts: { apiKey?: string } = {}) {
    const apiKey = opts.apiKey ?? geminiApiKey
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing; set it or pass apiKey to GeminiChatService')
    }
    this.genai = new GoogleGenerativeAI(apiKey)
  }

  async getChatCompletion(messages: ChatCompletionMessageParam[]): Promise<string | null> {
    try {
      // Model availability depends on the API key/project; "gemini-2.0-flash" is a safer default on v1beta.
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      const { systemInstruction, history, userMessage } = toGeminiChat(messages)

      const model = this.genai.getGenerativeModel({
        model: modelName,
        // Per docs: systemInstruction is separate from contents/history
        systemInstruction: systemInstruction || undefined,
      })

      const chat = model.startChat({ history })
      const res = await chat.sendMessage(userMessage || '...')

      const text = res.response.text()
      return text || null
    } catch (error) {
      console.error('Gemini error:', error)
      return null
    }
  }
}
