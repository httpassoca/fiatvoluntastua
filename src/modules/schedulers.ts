import telegramIds from '../data/telegramIds.json'
import { Bot } from 'grammy'
import cron from 'node-cron'
import { getRandomSalmo } from '@/services/getRandomSalmos'
import { createLogger } from '@/services/logger'

const log = createLogger({ name: 'schedulers' })

export const addSchedulers = (bot: Bot) => {
  // Saturday 4pm
  cron.schedule('0 15 * * 5', async () => {
    try {
      log.info('cron: roleta reminder')
      await bot.api.sendMessage(telegramIds.PUCUNA, 'Tem roleta amanhã 22h/18h')
    } catch (error) {
      log.error('cron: roleta reminder failed', { error: String(error) })
    }
  })

  // Everyday 12am
  cron.schedule('0 12 * * *', async () => {
    try {
      log.info('cron: salmos')
      await bot.api.sendMessage(telegramIds.PUCUNA, getRandomSalmo())
    } catch (error) {
      log.error('cron: salmos failed', { error: String(error) })
    }
  })
}
