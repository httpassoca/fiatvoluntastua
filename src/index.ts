import { telegramBotToken } from '@/config'; // Assuming you have a config module
import { addReplies } from '@/modules/replies';
import { addSchedulers } from '@/modules/schedulers';
import { Bot } from 'grammy';

let bot: Bot;

try {
  if (!telegramBotToken) {
    throw new Error('Telegram bot token is not defined in config.');
  }
  bot = new Bot(telegramBotToken);
} catch (error) {
  console.error('Bot initialization failed:', error);
  process.exit(1); // Exit with an error code
}

// Register modules
addReplies(bot);
addSchedulers(bot);

bot.start().catch((error) => {
  console.error('Bot startup failed:', error);
});

bot.api.getMe().then((botInfo) => {
  console.log(`Bot started as @${botInfo.username}`);
});

process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  bot.stop();
});

process.on('SIGTERM', () => {
  console.log('Bot shutting down...');
  bot.stop();
});