/** XP / leveling system (spec §5.2). Config-driven so packages can re-tune it. */

export interface LevelConfig {
  baseXp: number
  stepXp: number
  maxLevel: number
  bands: Array<{ minLevel: number; title: string }>
}

export const DEFAULT_LEVELS: LevelConfig = {
  baseXp: 100,
  stepXp: 80,
  maxLevel: 50,
  bands: [
    { minLevel: 1, title: 'Beginner' },
    { minLevel: 6, title: 'Explorer' },
    { minLevel: 16, title: 'Scholar' },
    { minLevel: 26, title: 'Master' },
    { minLevel: 41, title: 'Legend' },
  ],
}

/** @deprecated use cfg.maxLevel — kept for existing tests. */
export const MAX_LEVEL = DEFAULT_LEVELS.maxLevel

/** XP required to advance FROM `level` to the next one. */
export function xpToNext(level: number, cfg: LevelConfig = DEFAULT_LEVELS): number {
  if (level >= cfg.maxLevel) return Infinity
  return cfg.baseXp + (level - 1) * cfg.stepXp
}

/** Cumulative XP required to have reached `level`. */
export function cumulativeXpForLevel(level: number, cfg: LevelConfig = DEFAULT_LEVELS): number {
  let total = 0
  for (let l = 1; l < level; l++) total += xpToNext(l, cfg)
  return total
}

export function levelTitle(level: number, cfg: LevelConfig = DEFAULT_LEVELS): string {
  let title = cfg.bands[0]?.title ?? 'Beginner'
  for (const band of cfg.bands) {
    if (level >= band.minLevel) title = band.title
  }
  return title
}

export interface LevelInfo {
  level: number
  title: string
  xpIntoLevel: number
  xpForLevel: number
  progress: number
}

export function levelForXp(totalXp: number, cfg: LevelConfig = DEFAULT_LEVELS): LevelInfo {
  let level = 1
  let remaining = Math.max(0, Math.floor(totalXp))
  while (level < cfg.maxLevel && remaining >= xpToNext(level, cfg)) {
    remaining -= xpToNext(level, cfg)
    level++
  }
  const xpForLevel = xpToNext(level, cfg)
  const progress = xpForLevel === Infinity ? 1 : remaining / xpForLevel
  return {
    level,
    title: levelTitle(level, cfg),
    xpIntoLevel: remaining,
    xpForLevel,
    progress: Math.min(1, progress),
  }
}
