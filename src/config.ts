import * as dotenv from 'dotenv';
dotenv.config();

export const telegramBotToken = `${process.env.TELEGRAM_BOT_TOKEN}`;
export const openaiApiKey = process.env.OPENAI_API_KEY;