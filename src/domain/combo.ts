/** Combo multiplier system (spec §5.5). Config-driven. */

export interface ComboTier {
  minStreak: number
  multiplier: number
}

export const DEFAULT_COMBO: ComboTier[] = [
  { minStreak: 3, multiplier: 2 },
  { minStreak: 5, multiplier: 3 },
  { minStreak: 8, multiplier: 4 },
  { minStreak: 12, multiplier: 5 },
]

/** Reward multiplier for a run of `consecutiveCorrect` answers. */
export function comboMultiplier(consecutiveCorrect: number, tiers: ComboTier[] = DEFAULT_COMBO): number {
  let mult = 1
  for (const tier of tiers) {
    if (consecutiveCorrect >= tier.minStreak) mult = tier.multiplier
  }
  return mult
}
