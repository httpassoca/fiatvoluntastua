import * as dotenv from 'dotenv';
dotenv.config();

export const telegramBotToken = `${process.env.TELEGRAM_BOT_TOKEN}`;
export const openAIToken = process.env.OPEN_AI_TOKEN;