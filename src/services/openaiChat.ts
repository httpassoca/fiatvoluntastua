import { OpenAI } from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import { openaiApiKey } from '@/config'

export interface ChatCompletionService {
  getChatCompletion(messages: ChatCompletionMessageParam[]): Promise<string | null>
}

export class OpenAIChatService implements ChatCompletionService {
  private openai: OpenAI

  constructor(opts: { apiKey?: string } = {}) {
    this.openai = new OpenAI({ apiKey: opts.apiKey ?? openaiApiKey })
  }

  async getChatCompletion(messages: ChatCompletionMessageParam[], model = 'gpt-4o-mini'): Promise<string | null> {
    try {
      const data = await this.openai.chat.completions.create({
        model,
        messages,
      })
      return data.choices[0].message?.content || null
    } catch (error) {
      console.error('OpenAI error:', error)
      return null
    }
  }
}
