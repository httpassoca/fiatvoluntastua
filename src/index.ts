import { telegramBotToken } from '@/config'
import { addReplies } from '@/modules/replies'
import { addSchedulers } from '@/modules/schedulers'
import { createLogger } from '@/services/logger'
import { Bot } from 'grammy'

const log = createLogger({ name: 'bootstrap' })

function mustEnv(name: string, value: string) {
  if (!value) throw new Error(`${name} is missing`) 
  return value
}

async function main() {
  const token = mustEnv('TELEGRAM_BOT_TOKEN', telegramBotToken)

  const bot = new Bot(token)

  // Register modules
  addReplies(bot)
  addSchedulers(bot)

  bot.catch((err) => {
    // Grammy error wrapper
    log.error('grammy update handler failed', {
      error: String(err?.error || err),
      ctx: {
        updateId: err?.ctx?.update?.update_id,
        chatId: err?.ctx?.chat?.id,
        fromId: err?.ctx?.from?.id,
      },
    })
  })

  try {
    const me = await bot.api.getMe()
    log.info(`bot starting as @${me.username}`)
  } catch (error) {
    log.warn('bot getMe failed (continuing)', { error: String(error) })
  }

  await bot.start()
}

main().catch((error) => {
  log.error('fatal startup error', { error: String(error) })
  process.exit(1)
})
