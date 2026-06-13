/** XP / leveling system (spec §5.2). Levels 1-50 with title bands. */

export const MAX_LEVEL = 50

/** XP required to advance FROM `level` to the next one. */
export function xpToNext(level: number): number {
  if (level >= MAX_LEVEL) return Infinity
  return 100 + (level - 1) * 80
}

/** Cumulative XP required to have reached `level`. */
export function cumulativeXpForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) total += xpToNext(l)
  return total
}

export function levelTitle(level: number): string {
  if (level <= 5) return 'Beginner'
  if (level <= 15) return 'Explorer'
  if (level <= 25) return 'Scholar'
  if (level <= 40) return 'Master'
  return 'Legend'
}

export interface LevelInfo {
  level: number
  title: string
  /** XP accumulated within the current level. */
  xpIntoLevel: number
  /** XP needed to fill the current level (Infinity at max). */
  xpForLevel: number
  /** 0..1 progress through the current level. */
  progress: number
}

export function levelForXp(totalXp: number): LevelInfo {
  let level = 1
  let remaining = Math.max(0, Math.floor(totalXp))
  while (level < MAX_LEVEL && remaining >= xpToNext(level)) {
    remaining -= xpToNext(level)
    level++
  }
  const xpForLevel = xpToNext(level)
  const progress = xpForLevel === Infinity ? 1 : remaining / xpForLevel
  return {
    level,
    title: levelTitle(level),
    xpIntoLevel: remaining,
    xpForLevel,
    progress: Math.min(1, progress),
  }
}
