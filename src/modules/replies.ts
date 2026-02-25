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
function splitMarkdown(text: string, maxLen: number) {
  // Best-effort splitter that tries not to break fenced code blocks.
  // If we split while inside ``` block, we close + reopen fences between chunks.
  const lines = String(text || '').split('\n')
  const chunks: string[] = []

  let buf: string[] = []
  let bufLen = 0
  let inFence = false

  function flush(forceCloseFence = false) {
    if (!buf.length) return
    let chunk = buf.join('\n').trim()
    if (forceCloseFence && inFence) chunk += '\n```'
    if (chunk) chunks.push(chunk)
    buf = []
    bufLen = 0
  }

  for (const line of lines) {
    const isFence = line.trim().startsWith('```')
    const add = (buf.length ? 1 : 0) + line.length // +1 for newline

    // If adding this line would exceed, flush first.
    if (bufLen + add > maxLen) {
      flush(true)
      // reopen fence if we were inside one
      if (inFence) {
        buf.push('```')
        bufLen = 3
      }
    }

    buf.push(line)
    bufLen += add

    if (isFence) inFence = !inFence
  }

  flush(true)

  // Hard fallback: if any chunk is still too large (single huge line), split by length.
  const hard: string[] = []
  for (const c of chunks) {
    if (c.length <= maxLen) {
      hard.push(c)
      continue
    }
    let s = c
    while (s.length > maxLen) {
      hard.push(s.slice(0, maxLen))
      s = s.slice(maxLen)
    }
    if (s) hard.push(s)
  }
  return hard
}

async function safeSendMessageMarkdown(ctx: Context, text: string) {
  if (!ctx.chat || !ctx.message) {
    log.warn('safeSendMessageMarkdown: ctx.chat or ctx.message is undefined')
    return
  }

  try {
    await ctx.api.sendMessage(ctx.chat.id, text, {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: 'Markdown',
    })
  } catch (error: any) {
    // Fallback to plain text if Telegram rejects entities.
    const msg = String(error?.message || error)
    log.warn('sendMessage (Markdown) failed; retrying without parse_mode', { error: msg })
    try {
      await ctx.api.sendMessage(ctx.chat.id, text, {
        reply_to_message_id: ctx.message.message_id,
        // parse_mode omitted
      })
    } catch (error2: any) {
      log.error('sendMessage fallback failed', { error: String(error2?.message || error2) })
    }
  }
}

const sendSplitMessage = async (ctx: Context, message: string) => {
  const chunks = splitMarkdown(message, MAX_MESSAGE_LENGTH)
  for (const chunk of chunks) {
    await safeSendMessageMarkdown(ctx, chunk)
  }
}

const handleGptCommand = async (ctx: Context) => {
  if (ctx.chat && ctx.message) {
    const question = ctx.message.text?.replace(GPT_COMMAND_PREFIX, '') || ''
    const answer = await gptAnswer(question, ctx.from?.id?.toString() || '', ctx.from?.username)

    if (answer.length > MAX_MESSAGE_LENGTH) {
      await sendSplitMessage(ctx, answer)
    } else {
      await safeSendMessageMarkdown(ctx, answer)
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