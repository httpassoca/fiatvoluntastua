import { describe, expect, it } from 'vitest'
import type { ChatCompletionMessageParam } from 'openai/resources'
import { createGptService } from './gptAnswer'

class MockGemini {
  async getChatCompletion(messages: ChatCompletionMessageParam[]) {
    // prove we got system + user
    const hasSystem = messages.some((m) => m.role === 'system')
    const hasUser = messages.some((m) => m.role === 'user')
    return hasSystem && hasUser ? 'ok-gemini' : 'bad'
  }
}

describe('Gemini-compatible provider contract', () => {
  it('can be used via createGptService(openai: provider)', async () => {
    const svc = createGptService({
      historyFilePath: `/tmp/fvt-gemini-test-${Date.now()}.json`,
      openai: new MockGemini() as any,
      systemMessage: 'sys',
    })

    const out = await svc.gptAnswer('q', 'u1')
    expect(out).toBe('ok-gemini')
  })
})
