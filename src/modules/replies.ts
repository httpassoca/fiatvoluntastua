import { Bot } from "grammy";
import data from '../data.json';
import media from '../mediaData.json';
import { gptAnswer } from "../services/gptAnswer";

let firstMessageFrom = true;

export const addReplies = (bot: Bot) => {
  bot.on("message:text", async (ctx) => {
    const replyMessage = { reply_to_message_id: ctx.message.message_id };

    const randomNumber = Math.floor(Math.random() * 100);

    // Check if the random number is within the 10% range (0 to 9)
    if (randomNumber < 5) {
      // Execute the callback function if the condition is met
      await ctx.reply('vc eh retardado');
    }
    if (ctx.from.username === 'temgnomosnaminhacasa079' && firstMessageFrom) {
      firstMessageFrom = false;
      await ctx.reply('smt');
    }


    if (ctx.message.text.includes('gpt ')) {
      const answer = await gptAnswer(ctx.message.text.replace('gpt ', ''), ctx.from.id.toString(), ctx.from.username);
      if (answer.length > 4000) {
        let half = answer.slice(0, answer.length / 2);
        await ctx.api.sendMessage(ctx.chat.id, half, { reply_to_message_id: ctx.message.message_id, parse_mode: 'Markdown' });
        half = answer.slice(answer.length / 2, answer.length);
        await ctx.api.sendMessage(ctx.chat.id, half, { reply_to_message_id: ctx.message.message_id, parse_mode: 'Markdown' });
      } else {
        await ctx.api.sendMessage(ctx.chat.id, answer, { reply_to_message_id: ctx.message.message_id, parse_mode: 'Markdown' });
      }
    }

    if (/\bdeus\b/.test(ctx.message.text)) {
      const img = 'https://i.imgur.com/nfZV54N.jpg';
      await ctx.replyWithPhoto(img, replyMessage)
    }
    if (/\bsmt\b/.test(ctx.message.text)) {
      await ctx.reply('😂😂😂😂 smt 😂😂😂😂')
    }

    if (ctx.message.text.includes('myid')) {
      await ctx.reply(ctx.from.id.toString(), replyMessage);
    }

    if (ctx.message.text.includes('asuka')) {
      bot.api.sendPhoto(data.PUCUNAID, media.asukaLink);
    }

    if (ctx.message.text.includes('chatdata')) {
      const chatData = await ctx.api.getChat(ctx.chat.id);
      await ctx.reply(JSON.stringify(chatData), replyMessage);
    }
  });
}