import { Bot } from "grammy";
import { gptAnswer } from "../services/gptAnswer";

let alvaroViado = true;

export const addReplies = (bot: Bot) => {
  bot.on("message:text", async (ctx) => {
    const replyMessage = { reply_to_message_id: ctx.message.message_id };
    if (ctx.from.username === 'alvixxo' && alvaroViado) {
      alvaroViado = false;
      await ctx.reply('de cima é viado KKKKKKKKKKKKKK');
    }

    if (ctx.message.text.includes('gpt ')) {
      const answer = await gptAnswer(ctx.message.text.replace('gpt ', ''));
      if (answer.length > 4000) {
        let half = answer.slice(0, answer.length / 2);
        await ctx.reply(half, replyMessage);
        half = answer.slice(answer.length / 2, answer.length);
        await ctx.reply(half);
      } else {
        await ctx.reply(answer, replyMessage);
      }
    }

    if (/\bdeus\b/.test(ctx.message.text)) {
      const img = 'https://i.imgur.com/nfZV54N.jpg';
      await ctx.replyWithPhoto(img, replyMessage)
    }

    if (ctx.message.text.includes('myid')) {
      await ctx.reply(ctx.from.id.toString(), replyMessage);
    }

    if (ctx.message.text.includes('chatdata')) {
      const chatData = await ctx.api.getChat(ctx.chat.id);
      await ctx.reply(JSON.stringify(chatData), replyMessage);
    }
  });
}