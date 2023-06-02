import { Bot } from "grammy";
import { telegramBotToken } from "./config";
import { gptAnswer } from "./providers/openai";

const bot = new Bot(telegramBotToken);

let alvaroViado = true;

bot.on("message", async (ctx) => {
  if (ctx.from.username === 'Nagattin') {
    await ctx.reply('kkkkkkkkkkk bicha');
  }

  if (ctx.from.username === 'alvixxo' && alvaroViado) {
    alvaroViado = false;
    await ctx.reply('de cima é viado KKKKKKKKKKKKKK');
  }

  if (ctx.message.text && ctx.message.text.includes('gpt')) {
    const answer = await gptAnswer(ctx.message.text);
    await ctx.reply(answer, { reply_to_message_id: ctx.message.message_id });
  }
});

//Start the Bot
bot.start();
