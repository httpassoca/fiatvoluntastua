import { media } from '../data/mediaData'
import telegramIds from '../data/telegramIds.json'
import { gptAnswer } from '@/services/gptAnswer'
import { createLogger } from '@/services/logger'
import { Bot, Context } from 'grammy'

const log = createLogger({ name: 'replies' })

// Configuration
const RETARDED_REPLY_CHANCE = 1 // 1% chance to reply with "vc eh retardado"
const GPT_COMMAND_PREFIX = 'gpt '
const MAX_MESSAGE_LENGTH = 3500
const DEUS_IMAGE_URL = 'https://i.imgur.com/nfZV54N.jpg'
const SMT_REPLY = '😂😂😂😂 smt 😂😂😂😂'

// State Management
let firstMessageFromGnomos = true

// Helper Functions
function splitText(text: string, maxLen: number) {
  const out: string[] = []
  let s = String(text || '')
  while (s.length > maxLen) {
    let cut = maxLen
    // Prefer splitting on a newline/space to keep chunks readable.
    const nl = s.lastIndexOf('\n', maxLen)
    const sp = s.lastIndexOf(' ', maxLen)
    cut = Math.max(nl, sp, 1)
    out.push(s.slice(0, cut).trim())
    s = s.slice(cut).trim()
  }
  if (s) out.push(s)
  return out
}

async function safeSendMessage(ctx: Context, text: string) {
  if (!ctx.chat || !ctx.message) {
    log.warn('safeSendMessage: ctx.chat or ctx.message is undefined')
    return
  }

  // IMPORTANT: do NOT set parse_mode here.
  // Markdown/HTML can break when the model outputs unmatched entities or we split mid-entity.
  try {
    await ctx.api.sendMessage(ctx.chat.id, text, {
      reply_to_message_id: ctx.message.message_id,
      // parse_mode intentionally omitted
    })
  } catch (error: any) {
    // Don't crash the update handler.
    log.error('sendMessage failed', { error: String(error?.message || error) })
    try {
      await ctx.reply('Failed to send message.', { reply_to_message_id: ctx.message.message_id })
    } catch {
      // ignore
    }
  }
}

const sendSplitMessage = async (ctx: Context, message: string) => {
  const chunks = splitText(message, MAX_MESSAGE_LENGTH)
  for (const chunk of chunks) {
    await safeSendMessage(ctx, chunk)
  }
}

const handleGptCommand = async (ctx: Context) => {
  if (ctx.chat && ctx.message) {
    const question = ctx.message.text?.replace(GPT_COMMAND_PREFIX, '') || ''
    const answer = await gptAnswer(question, ctx.from?.id?.toString() || '', ctx.from?.username)

    if (answer.length > MAX_MESSAGE_LENGTH) {
      await sendSplitMessage(ctx, answer)
    } else {
      await safeSendMessage(ctx, answer)
    }
  } else {
    log.warn("handleGptCommand: ctx.chat or ctx.message is undefined")
    await ctx.reply("Error: Could not process GPT command.")
  }
}

const handleChatDataCommand = async (ctx: Context) => {
  if (ctx.chat && ctx.message) {
    try {
      const chatData = await ctx.api.getChat(ctx.chat.id)
      await ctx.reply(JSON.stringify(chatData), { reply_to_message_id: ctx.message.message_id })
    } catch (error) {
      log.error('Error fetching chat data', { error: String(error) })
      await ctx.reply('Failed to fetch chat data.')
    }
  } else {
    log.warn("handleChatDataCommand: ctx.chat or ctx.message is undefined")
    await ctx.reply("Error: Could not fetch chat data.")
  }
}

const handleClearChatDataCommand = async (ctx: Context) => {
  // This feature was removed (no auto/prune history anymore).
  await ctx.reply('This command is disabled now. (History is no longer auto-pruned.)', { reply_to_message_id: ctx.message?.message_id })
}

const handleDeusTrigger = async (ctx: Context) => {
  await ctx.replyWithPhoto(DEUS_IMAGE_URL, { reply_to_message_id: ctx.message?.message_id })
}

const handleSmtTrigger = async (ctx: Context) => {
  await ctx.reply(SMT_REPLY, { reply_to_message_id: ctx.message?.message_id })
}

const handleMyIdCommand = async (ctx: Context) => {
  await ctx.reply(ctx.from?.id?.toString() || '', { reply_to_message_id: ctx.message?.message_id })
}

const handleAsukaCommand = async (ctx: Context) => {
  await ctx.api.sendPhoto(telegramIds.COETUS, media.asukaLink)
}

const handleRandomRetardedReply = async (ctx: Context) => {
  if (Math.floor(Math.random() * 100) < RETARDED_REPLY_CHANCE) {
    await ctx.reply('vc eh retardado <3', { reply_to_message_id: ctx.message?.message_id })
  }
}

const handleFirstMessageFromGnomos = async (ctx: Context) => {
  if (ctx.from?.username === 'temgnomosnaminhacasa079' && firstMessageFromGnomos) {
    firstMessageFromGnomos = false
    await ctx.reply('smt', { reply_to_message_id: ctx.message?.message_id })
  }
}

// Main Function
export const addReplies = (bot: Bot) => {
  bot.on('message:text', async (ctx) => {
    await handleRandomRetardedReply(ctx)
    await handleFirstMessageFromGnomos(ctx)

    if (ctx.message?.text?.includes(GPT_COMMAND_PREFIX)) await handleGptCommand(ctx)

    if (/\bdeus\b/.test(ctx.message?.text || '')) await handleDeusTrigger(ctx)

    if (/\bsmt\b/.test(ctx.message?.text || '')) await handleSmtTrigger(ctx)

    if (ctx.message?.text?.includes('myid')) await handleMyIdCommand(ctx)

    if (ctx.message?.text?.includes('asuka')) await handleAsukaCommand(ctx)

    if (ctx.message?.text?.includes('saturday')) await handleAsukaCommand(ctx)

    if (ctx.message?.text?.includes('cleargptmessages')) await handleClearChatDataCommand(ctx)

    if (ctx.message?.text?.includes('chatdata')) await handleChatDataCommand(ctx)

  })
}