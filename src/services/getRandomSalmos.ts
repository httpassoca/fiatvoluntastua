import json from '@/data/salmos.json'
import { pickRandom, type Rng } from '@/lib/random'

export type Chapter = {
  chapter: number
  text: string[]
}

const salmos: Chapter[] = json

export function formatSalmo(ch: Chapter) {
  return `SALMO ${ch.chapter}\n\n${ch.text.join('\n')}`
}

export function getRandomSalmo(rng: Rng = Math.random) {
  const salmoRandom: Chapter = pickRandom(salmos, rng) || salmos[50]!
  return formatSalmo(salmoRandom)
}
