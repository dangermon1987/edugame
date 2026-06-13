import type { UserState } from '@/domain/types'
import type { AchievementCriteria, AchievementDef } from './schema'

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/** Computes the declarative stat used by achievement criteria from user state. */
function statValue(stat: AchievementCriteria['stat'], s: UserState): number {
  switch (stat) {
    case 'lessonsCompleted':
      return s.stats.lessonsCompleted
    case 'streak':
      return s.streak.count
    case 'competeWins':
      return s.compete.wins
    case 'coins':
      return s.coins
    case 'xp':
      return s.xp
    case 'ownedItems':
      return s.ownedItems.length
    case 'threeStarLessons':
      return Object.values(s.lessonProgress).filter((p) => p.stars >= 3).length
    case 'perfectLessons':
      return Object.values(s.lessonProgress).filter((p) => p.bestAccuracy >= 1).length
    case 'masteredCards':
      return Object.values(s.cardProgress).filter((p) => p.status === 'mastered').length
    case 'avgAccuracy':
      return avg(s.stats.accuracySamples)
    default:
      return 0
  }
}

export function isAchievementEarned(def: AchievementDef, s: UserState): boolean {
  const { stat, gte, minSamples } = def.criteria
  if (stat === 'avgAccuracy' && minSamples && s.stats.accuracySamples.length < minSamples) {
    return false
  }
  return statValue(stat, s) >= gte
}

/** Returns ids of achievements satisfied by `next` that aren't yet recorded. */
export function evaluateAchievements(next: UserState, defs: AchievementDef[]): string[] {
  const newly: string[] = []
  for (const def of defs) {
    if (!next.achievements[def.id] && isAchievementEarned(def, next)) newly.push(def.id)
  }
  return newly
}
