import { Bot } from "grammy";
import * as data from "../data.json";
import { getRandomSalmo } from "../services/getRandomSalmos";
var cron = require("node-cron");

const videoSextaLink =
  "https://tbnaluslgxzikblascgb.supabase.co/storage/v1/object/sign/passoca/videos/sextafeirameiodia.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwYXNzb2NhL3ZpZGVvcy9zZXh0YWZlaXJhbWVpb2RpYS5tcDQiLCJpYXQiOjE2ODU3NDYxMzksImV4cCI6MTcxNzI4MjEzOX0.M80dt3M6XUW0CUnkT_v6cwqo6LcrxVoUEbpHrV9DoJc&t=2023-06-02T22%3A49%3A00.644Z";
const mondaySharkaoLink =
  "https://tbnaluslgxzikblascgb.supabase.co/storage/v1/object/sign/passoca/images/shakao_segunda.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwYXNzb2NhL2ltYWdlcy9zaGFrYW9fc2VndW5kYS5qcGciLCJpYXQiOjE2ODgwNzAxNzEsImV4cCI6MTcxOTYwNjE3MX0.f4WZ_XH0Kutihfcgnd6bgM6s6qPC1Scq7dvdZOOptL8&t=2023-06-29T20%3A22%3A51.343Z";
const videoCristianoLink = "https://tbnaluslgxzikblascgb.supabase.co/storage/v1/object/sign/passoca/videos/cristiano-ronaldo?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwYXNzb2NhL3ZpZGVvcy9jcmlzdGlhbm8tcm9uYWxkbyIsImlhdCI6MTcwNDc1NjI0NSwiZXhwIjoxNzM2MjkyMjQ1fQ.1-xJUt2wKHsl72Ew28MGUl-FNLLZQFPukMKnfKvGGL0&t=2024-01-08T23%3A24%3A05.109Z"

export const addSchedulers = (bot: Bot) => {
  // Monday 2pm
  cron.schedule("0 14 * * 1", () => {
    console.log("Sent felipe scheduled");
    bot.api.sendPhoto(data.PUCUNAID, mondaySharkaoLink);
  });

  // Friday 12am
  cron.schedule("0 11 * * 5", () => {
    console.log("Sent friday fast scheduled");
    bot.api.sendVideo(data.PUCUNAID, videoSextaLink);
  });

  // Saturday 4pm
  cron.schedule("0 15 * * 5", () => {
    console.log("Sent roleta scheduled");
    bot.api.sendMessage(data.PUCUNAID, "Tem roleta amanhã 22h/18h");
  });

  // Everyday 12am
  cron.schedule("0 12 * * *", () => {
    console.log("Sent Salmos scheduled");
    bot.api.sendMessage(data.PUCUNAID, getRandomSalmo());
  });

  // Everyday 9am
  cron.schedule("0 9 * * *", () => {
    console.log("Sent Cristiano scheduled");
    bot.api.sendVideo(data.PUCUNAID, videoCristianoLink);
  });

  // Everyday 6am
  // cron.schedule("0 6 * * *", () => {
  //   bot.api.sendMessage(data.PUCUNAID, 'hora do Angelus, fellas');
  // });
};
