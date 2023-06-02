import { Bot } from "grammy";

var cron = require('node-cron');

const PUCUNAID = -1001150475405;

export const schedulers = (bot: Bot) => {
  // Saturday 4pm
  cron.schedule('0 16 * * 6', () => {
    console.log('Sent roleta scheduled');
    bot.api.sendMessage(PUCUNAID, 'Tem roleta amanhã 22h')
  });
}