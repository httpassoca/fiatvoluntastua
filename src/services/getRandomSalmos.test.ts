import { describe, expect, it } from 'vitest'
import { formatSalmo, getRandomSalmo } from './getRandomSalmos'

describe('getRandomSalmo', () => {
  it('formats a chapter', () => {
    const out = formatSalmo({ chapter: 123, text: ['a', 'b'] })
    expect(out).toBe('SALMO 123\n\na\nb')
  })

  it('is deterministic with injected rng', () => {
    // rng returns 0 => first item
    const out = getRandomSalmo(() => 0)
    expect(out.startsWith('SALMO ')).toBe(true)
  })
})
