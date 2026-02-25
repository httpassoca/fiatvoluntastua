import { describe, expect, it } from 'vitest'
import { toGeminiChat } from './geminiChat'

describe('toGeminiChat', () => {
  it('splits systemInstruction, history, and userMessage', () => {
    const { systemInstruction, history, userMessage } = toGeminiChat([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'yo' },
      { role: 'user', content: 'question' },
    ])

    expect(systemInstruction).toBe('sys')
    expect(userMessage).toBe('question')
    expect(history).toEqual([
      { role: 'user', parts: [{ text: 'hi' }] },
      { role: 'model', parts: [{ text: 'yo' }] },
    ])
  })
})
