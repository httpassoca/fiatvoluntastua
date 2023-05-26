import { Bot } from "grammy";
import { Configuration, OpenAIApi } from "openai";
import fetch from 'node-fetch';

//Create a new bot
const bot = new Bot(`${process.env['telegramBotKey']}`);


const configuration = new Configuration({
  apiKey: process.env['openAIKey'],
});
const openai = new OpenAIApi(configuration);

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  //Print to console

  if (ctx.from.username === 'alvixxo') {
    await ctx.reply('de cima é viado');
  }
  if (ctx.message.text && !ctx.message.text.includes('kkkk') && !ctx.message.text.includes('KKKK')) {
    console.log(ctx.message.text)
    const gpt = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: ctx.message.text }],
    });
    console.log(gpt.data.choices[0]);
    await ctx.reply(gpt.data.choices[0].message?.content || ``, { reply_to_message_id: ctx.message.message_id });
  }

});

//Start the Bot
bot.start();
