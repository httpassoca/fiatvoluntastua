import * as dotenv from 'dotenv'

dotenv.config()

export const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || ''
export const openaiApiKey = process.env.OPENAI_API_KEY || ''
export const geminiApiKey = process.env.GEMINI_API_KEY || ''

// openai | gemini
export const aiProvider = (process.env.AI_PROVIDER || process.env.LLM_PROVIDER || 'openai').toLowerCase()
