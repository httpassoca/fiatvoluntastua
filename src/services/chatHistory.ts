import * as fs from 'node:fs/promises'

export type ChatRole = 'user' | 'assistant' | 'system'

export type Message = {
  role: ChatRole
  content: string
  timestamp: number
  username?: string
}

export type UserChatHistory = Record<string, Message[]>

export class ChatHistoryManager {
  constructor(private filePath: string) {}

  async load(): Promise<UserChatHistory> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      return JSON.parse(data) as UserChatHistory
    } catch (error: any) {
      if (error?.code === 'ENOENT') return {}
      console.error('Error loading chat history:', error)
      return {}
    }
  }

  async save(history: UserChatHistory): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(history, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error saving chat history:', error)
    }
  }
}
