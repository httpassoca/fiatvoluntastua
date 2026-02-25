import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import type { ChatCompletionService } from './openaiChat'
import { geminiApiKey } from '@/config'

function toGeminiPrompt(messages: ChatCompletionMessageParam[]) {
  // Gemini's SDK has its own chat format; simplest is to flatten to text.
  // Keep it close to the original roles so behavior is similar.
  return messages
    .map((m) => {
      const role = m.role
      const content = typeof m.content === 'string' ? m.content : ''
      if (!content) return ''
      if (role === 'system') return `SYSTEM: ${content}`
      if (role === 'user') return `USER: ${content}`
      if (role === 'assistant') return `ASSISTANT: ${content}`
      return content
    })
    .filter(Boolean)
    .join('\n')
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
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
      const model = this.genai.getGenerativeModel({ model: modelName })

      const prompt = toGeminiPrompt(messages)
      const res = await model.generateContent(prompt)
      const text = res.response.text()
      return text || null
    } catch (error) {
      console.error('Gemini error:', error)
      return null
    }
  }
}
