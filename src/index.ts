import { Bot } from "grammy";
import { telegramBotToken } from "./config";
import { PASSOCAID, PUCUNAID } from "./data";
import { gptAnswer, gptImg } from "./providers/openai";
import { addWord, clearData, readData } from "./providers/wordCounter";
import { schedulers } from "./schedulers";
import { countOccurrences } from "./utils";

const bot = new Bot(telegramBotToken);
let alvaroViado = true;

bot.api.setMyCommands([
  { command: "cleardata", description: "Just Passoca knows" },
  { command: "senddata", description: "Just Passoca knows" },
]);

bot.command("cleardata", (ctx) => {
  const replyMessage = { reply_to_message_id: ctx.message?.message_id };
  if (ctx.from?.username === 'udontknowmeson') {
    clearData();
    const imgUrl = "https://media.tenor.com/_HboCW9bxI4AAAAC/jjba-jojo.gif";
    ctx.replyWithVideo(imgUrl, replyMessage);
  } else {
    ctx.reply('morre brother', replyMessage);
  }
});

bot.command("senddata", (ctx) => {
  if (ctx.from?.username === 'udontknowmeson') {
    ctx.api.sendMessage(PASSOCAID, readData());
  } else {
    ctx.reply('morre brother');
  }
});

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


  if (/\bdeus\b/.test(ctx.message.text)) {
    const img = 'https://i.imgur.com/nfZV54N.jpg';
    await ctx.replyWithPhoto(img, replyMessage)
  }
  if (ctx.message.text.includes('myid')) {
    await ctx.reply(ctx.from.id.toString(), replyMessage);
  }

  if (ctx.message.text.includes('negro')) {
    const count = countOccurrences(ctx.message.text, 'negro');
    console.log(count)
    addWord(ctx.message.chat.id, 'negro', count, ctx.from.username || 'x');
  }

  if (ctx.message.text.includes('gordo')) {
    const count = countOccurrences(ctx.message.text, 'gordo');
    console.log(count)
    addWord(ctx.message.chat.id, 'gordo', count, ctx.from.username || 'x');
    await ctx.api.sendMessage(PASSOCAID, readData());
  }

  if (ctx.message.text.includes('mulher')) {
    const count = countOccurrences(ctx.message.text, 'mulher');
    console.log(count)
    addWord(ctx.message.chat.id, 'mulher', count, ctx.from.username || 'x');
    await ctx.api.sendMessage(PASSOCAID, readData());
  }

  if (ctx.message.text.includes('preto')) {
    const count = countOccurrences(ctx.message.text, 'preto');
    console.log(count)
    addWord(ctx.message.chat.id, 'preto', count, ctx.from.username || 'x');
    await ctx.api.sendMessage(PASSOCAID, readData());
  }
});

schedulers(bot);

//Start the Bot
bot.start()
