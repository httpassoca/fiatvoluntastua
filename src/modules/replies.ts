import { Bot } from "grammy";
import { gptAnswer } from "../services/gptAnswer";
import { gptAnswerImage } from "../services/gptAnswerImage";

let alvaroViado = true;

export const addReplies = (bot: Bot) => {
  bot.on("message:text", async (ctx) => {
    const replyMessage = { reply_to_message_id: ctx.message.message_id };
    if (ctx.from.username === 'alvixxo' && alvaroViado) {
      alvaroViado = false;
      await ctx.reply('de cima é viado KKKKKKKKKKKKKK');
    }

    if (ctx.message.text.includes('gpt ')) {
      const answer = await gptAnswer(ctx.message.text, ctx.message.forward_sender_name);
      await ctx.reply(answer, replyMessage);
    }

    if (ctx.message.text.includes('gptimg')) {
      const imgUrl = await gptAnswerImage(ctx.message.text);
      await ctx.replyWithPhoto(imgUrl, replyMessage);
    }

    if (/\bdeus\b/.test(ctx.message.text)) {
      const img = 'https://i.imgur.com/nfZV54N.jpg';
      await ctx.replyWithPhoto(img, replyMessage)
    }

    if (ctx.message.text.includes('myid')) {
      await ctx.reply(ctx.from.id.toString(), replyMessage);
    }
  });
}