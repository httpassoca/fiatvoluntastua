import { Bot } from "grammy";
import * as dotenv from 'dotenv';
import { gptAnswer } from "./providers/openai";

dotenv.config();

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);

let alvaroViado = true;
bot.on("message", async (ctx) => {
  if (ctx.from.username === 'alvixxo' && alvaroViado) {
    alvaroViado = false;
    await ctx.reply('de cima é viado KKKKKKKKKKKKKK');
  }
  if (ctx.message.text && !ctx.message.text.includes('kkkk') && !ctx.message.text.includes('KKKK')) {
    const answer = await gptAnswer(ctx.message.text);
    await ctx.reply(answer, { reply_to_message_id: ctx.message.message_id });
  }
});

//Start the Bot
bot.start();
