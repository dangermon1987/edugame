/** Combo multiplier system (spec §5.5). */

/** Returns the reward multiplier for a run of `consecutiveCorrect` answers. */
export function comboMultiplier(consecutiveCorrect: number): number {
  if (consecutiveCorrect >= 12) return 5
  if (consecutiveCorrect >= 8) return 4
  if (consecutiveCorrect >= 5) return 3
  if (consecutiveCorrect >= 3) return 2
  return 1
}
