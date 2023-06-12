import { Bot } from "grammy";
import { readData } from "./providers/wordCounter";
var cron = require('node-cron');

const PUCUNAID = -1001150475405;

const videoSextaLink = 'https://tbnaluslgxzikblascgb.supabase.co/storage/v1/object/sign/passoca/videos/sextafeirameiodia.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwYXNzb2NhL3ZpZGVvcy9zZXh0YWZlaXJhbWVpb2RpYS5tcDQiLCJpYXQiOjE2ODU3NDYxMzksImV4cCI6MTcxNzI4MjEzOX0.M80dt3M6XUW0CUnkT_v6cwqo6LcrxVoUEbpHrV9DoJc&t=2023-06-02T22%3A49%3A00.644Z'

export const schedulers = (bot: Bot) => {
  // Saturday 4pm
  cron.schedule('0 15 * * 6', () => {
    console.log('Sent roleta scheduled');
    bot.api.sendMessage(PUCUNAID, 'Tem roleta amanhã 22h')
  });

  // Friday 12am
  cron.schedule('0 11 * * 5', () => {
    console.log('Sent friday fast scheduled');
    bot.api.sendVideo(PUCUNAID, videoSextaLink)
  });
}