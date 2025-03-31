import media from '@/data/mediaData.json';
import telegramIds from '@/data/telegramIds.json';
import { gptAnswer } from '@/services/gptAnswer';
import { Bot, Context } from 'grammy';

// Configuration
const RETARDED_REPLY_CHANCE = 3; // 3% chance to reply with "vc eh retardado"
const GPT_COMMAND_PREFIX = 'gpt ';
const MAX_MESSAGE_LENGTH = 4000;
const DEUS_IMAGE_URL = 'https://i.imgur.com/nfZV54N.jpg';
const SMT_REPLY = '😂😂😂😂 smt 😂😂😂😂';

// State Management
let firstMessageFromGnomos = true;

// Helper Functions
const sendSplitMessage = async (ctx: Context, message: string) => {
  if (ctx.chat && ctx.message) { // Check if ctx.chat and ctx.message exist
    const halfLength = Math.floor(message.length / 2);
    const firstHalf = message.slice(0, halfLength);
    const secondHalf = message.slice(halfLength);

    await ctx.api.sendMessage(ctx.chat.id, firstHalf, {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: 'Markdown',
    });
    await ctx.api.sendMessage(ctx.chat.id, secondHalf, {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: 'Markdown',
    });
  } else {
    console.error("ctx.chat or ctx.message is undefined in sendSplitMessage");
    await ctx.reply("Error: Could not send split message.");
  }
};

const handleGptCommand = async (ctx: Context) => {
  if (ctx.chat && ctx.message) {
    const question = ctx.message.text?.replace(GPT_COMMAND_PREFIX, '') || '';
    const answer = await gptAnswer(question, ctx.from?.id?.toString() || '', ctx.from?.username);

    if (answer.length > MAX_MESSAGE_LENGTH) {
      await sendSplitMessage(ctx, answer);
    } else {
      await ctx.api.sendMessage(ctx.chat.id, answer, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: 'Markdown',
      });
    }
  } else {
    console.error("ctx.chat or ctx.message is undefined in handleGptCommand");
    await ctx.reply("Error: Could not process GPT command.");
  }
};

const handleChatDataCommand = async (ctx: Context) => {
  if (ctx.chat && ctx.message) {
    try {
      const chatData = await ctx.api.getChat(ctx.chat.id);
      await ctx.reply(JSON.stringify(chatData), { reply_to_message_id: ctx.message.message_id });
    } catch (error) {
      console.error('Error fetching chat data:', error);
      await ctx.reply('Failed to fetch chat data.');
    }
  } else {
    console.error("ctx.chat or ctx.message is undefined in handleChatDataCommand");
    await ctx.reply("Error: Could not fetch chat data.");
  }
};

const handleDeusTrigger = async (ctx: Context) => {
  await ctx.replyWithPhoto(DEUS_IMAGE_URL, { reply_to_message_id: ctx.message?.message_id });
};

const handleSmtTrigger = async (ctx: Context) => {
  await ctx.reply(SMT_REPLY, { reply_to_message_id: ctx.message?.message_id });
};

const handleMyIdCommand = async (ctx: Context) => {
  await ctx.reply(ctx.from?.id?.toString() || '', { reply_to_message_id: ctx.message?.message_id });
};

const handleAsukaCommand = async (ctx: Context) => {
  await ctx.api.sendPhoto(telegramIds.PUCUNA, media.asukaLink);
};

const handleRandomRetardedReply = async (ctx: Context) => {
  if (Math.floor(Math.random() * 100) < RETARDED_REPLY_CHANCE) {
    await ctx.reply('vc eh retardado <3', { reply_to_message_id: ctx.message?.message_id });
  }
};

const handleFirstMessageFromGnomos = async (ctx: Context) => {
  if (ctx.from?.username === 'temgnomosnaminhacasa079' && firstMessageFromGnomos) {
    firstMessageFromGnomos = false;
    await ctx.reply('smt', { reply_to_message_id: ctx.message?.message_id });
  }
};

// Main Function
export const addReplies = (bot: Bot) => {
  bot.on('message:text', async (ctx) => {
    await handleRandomRetardedReply(ctx);
    await handleFirstMessageFromGnomos(ctx);

    if (ctx.message?.text?.includes(GPT_COMMAND_PREFIX)) await handleGptCommand(ctx);

    if (/\bdeus\b/.test(ctx.message?.text || '')) await handleDeusTrigger(ctx);

    if (/\bsmt\b/.test(ctx.message?.text || '')) await handleSmtTrigger(ctx);

    if (ctx.message?.text?.includes('myid')) await handleMyIdCommand(ctx);

    if (ctx.message?.text?.includes('asuka')) await handleAsukaCommand(ctx);

    if (ctx.message?.text?.includes('chatdata')) await handleChatDataCommand(ctx);
  });
};