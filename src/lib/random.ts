export type Rng = () => number

/**
 * Pick a random item from an array.
 * Returns null for invalid/empty arrays.
 */
export function pickRandom<T>(arr: readonly T[], rng: Rng = Math.random): T | null {
  if (!Array.isArray(arr) || arr.length === 0) return null
  const i = Math.floor(rng() * arr.length)
  return arr[i] ?? null
}
