import { describe, expect, it } from 'vitest'
import { pickRandom } from './random'

describe('pickRandom', () => {
  it('returns null for empty', () => {
    expect(pickRandom([])).toBe(null)
  })

  it('returns deterministic item with rng', () => {
    const out = pickRandom(['a', 'b', 'c'], () => 0.99)
    expect(out).toBe('c')
  })
})
