import { Bot } from "grammy";
import { telegramBotToken } from "./config";
import { addReplies } from "./modules/replies";
import { addSchedulers } from "./modules/schedulers";

const bot = new Bot(telegramBotToken);

addReplies(bot)
addSchedulers(bot);

//Start the Bot
bot.start()
