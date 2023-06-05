import { Bot } from "grammy";
import { telegramBotToken } from "./config";
import { gptAnswer } from "./providers/openai";
import { schedulers } from "./schedulers";

const bot = new Bot(telegramBotToken);
let alvaroViado = true;

bot.on("message:text", async (ctx) => {
  if (ctx.from.username === 'Nagattin') {
    await ctx.reply('kkkkkkkkkkk bicha');
  }

  if (ctx.from.username === 'alvixxo' && alvaroViado) {
    alvaroViado = false;
    await ctx.reply('de cima é viado KKKKKKKKKKKKKK');
  }

  if (ctx.message.text.includes('gpt')) {
    const answer = await gptAnswer(ctx.message.text, ctx.message.forward_sender_name);
    await ctx.reply(answer, { reply_to_message_id: ctx.message.message_id });
  }

  if (ctx.message.text.includes('deus')) {
    const img = 'https://i.imgur.com/nfZV54N.jpg';
    await ctx.replyWithPhoto(img, { reply_to_message_id: ctx.message.message_id })
  }
});

schedulers(bot);

//Start the Bot
bot.start();
