import { describe, expect, it } from 'vitest'
import * as os from 'node:os'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { createGptService, processAnswer } from './gptAnswer'
import type { ChatCompletionMessageParam } from 'openai/resources'

class MockOpenAI {
  public lastMessages: ChatCompletionMessageParam[] | null = null
  constructor(private reply: string | null) {}
  async getChatCompletion(messages: ChatCompletionMessageParam[]) {
    this.lastMessages = messages
    return this.reply
  }
}

describe('processAnswer', () => {
  it('strips AI disclaimers after first sentence', () => {
    const s = 'Como uma IA. aqui vai a resposta legal.'
    expect(processAnswer(s)).toBe('aqui vai a resposta legal.')
  })

  it('returns as-is when no disclaimer', () => {
    expect(processAnswer('hello')).toBe('hello')
  })
})

describe('gptAnswer service', () => {
  it('writes user + assistant messages to history', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'fvt-'))
    const history = path.join(dir, 'chat_history.json')

    const mock = new MockOpenAI('ok')
    const svc = createGptService({ historyFilePath: history, openai: mock, systemMessage: 'sys' })

    const out = await svc.gptAnswer('q', 'u1', 'bob')
    expect(out).toBe('ok')

    const raw = JSON.parse(await fs.readFile(history, 'utf-8'))
    expect(raw.u1).toHaveLength(2)
    expect(raw.u1[0].role).toBe('user')
    expect(raw.u1[1].role).toBe('assistant')

    expect(mock.lastMessages?.[0]).toEqual({ role: 'system', content: 'sys' })
  })
})
