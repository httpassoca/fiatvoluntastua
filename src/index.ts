import { Bot } from "grammy";
import { telegramBotToken } from "./config";
import { gptAnswer, gptImg } from "./providers/openai";
import { clearData, readData, saveData } from "./providers/wordCounter";
import { schedulers } from "./schedulers";

const bot = new Bot(telegramBotToken);
let alvaroViado = true;

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
    const imgUrl = await gptImg(ctx.message.text);
    await ctx.replyWithPhoto(imgUrl, replyMessage);
  }
  if (ctx.message.text.includes('banco')) {
    saveData(ctx.message.text.replace('banco', ''))
    await ctx.reply(readData(), replyMessage);
  }

  if (/\bdeus\b/.test(ctx.message.text)) {
    const img = 'https://i.imgur.com/nfZV54N.jpg';
    await ctx.replyWithPhoto(img, replyMessage)
  }
});

bot.command("clearData", (ctx) => {

  const replyMessage = { reply_to_message_id: ctx.message?.message_id };
  if (ctx.from?.username === 'udontknowmeson') {
    ctx.reply(`passoca`, replyMessage);
    clearData();
    const imgUrl = "https://media.tenor.com/_HboCW9bxI4AAAAC/jjba-jojo.gif";
    ctx.replyWithPhoto(imgUrl, replyMessage);
  }
});

schedulers(bot);

//Start the Bot
bot.start();
