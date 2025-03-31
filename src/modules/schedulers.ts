import { Bot } from "grammy";
import * as data from "../data.json";
import * as media from "../mediaData.json";
import { getRandomSalmo } from "../services/getRandomSalmos";
import { deleteOldMessages } from "../services/gptAnswer";
var cron = require("node-cron");

export const addSchedulers = (bot: Bot) => {
  // Monday 2pm
  cron.schedule("0 14 * * 1", () => {
    console.log("Sent felipe scheduled");
    bot.api.sendPhoto(data.PUCUNAID, media.mondaySharkaoLink);
  });

  // Friday 12am
  cron.schedule("0 11 * * 5", () => {
    console.log("Sent friday fast scheduled");
    bot.api.sendVideo(data.PUCUNAID, media.videoSextaLink);
  });

  // Saturday 4pm
  cron.schedule("0 15 * * 5", () => {
    console.log("Sent roleta scheduled");
    bot.api.sendMessage(data.PUCUNAID, "Tem roleta amanhã 22h/18h");
  });

  // Saturday 8pm
  cron.schedule("0 20 * * 6", () => {
    console.log("Sent Asuka scheduled");
    bot.api.sendPhoto(data.PUCUNAID, media.asukaLink);
  });

  // Everyday 12am
  cron.schedule("0 12 * * *", () => {
    console.log("Sent Salmos scheduled");
    bot.api.sendMessage(data.PUCUNAID, getRandomSalmo());
  });

  // Schedule the deletion of old messages to run 2 weekly (e.g., every Monday at 3 AM)
  cron.schedule('0 0 1,15 * *', async () => {
    console.log('Running weekly chat history cleanup...');
    bot.api.sendMessage(data.PUCUNAID, 'apagando o histórico de msg dos viadinhos');
    const message = await deleteOldMessages();
    bot.api.sendMessage(data.PUCUNAID, message);
  });
};
