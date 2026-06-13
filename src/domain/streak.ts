import { daysBetween } from './datetime'

export interface StreakState {
  count: number
  lastActiveDate: string // YYYY-MM-DD, '' if never
}

export interface StreakResult {
  streak: StreakState
  /** True when this activity started/continued a streak on a new day. */
  incremented: boolean
}

/**
 * Registers activity on `today`. Streak continues if the previous active day
 * was yesterday, resets to 1 if there was a gap, and is unchanged if already
 * counted today (spec §5.3).
 */
export function registerActivity(prev: StreakState, today: string): StreakResult {
  if (!prev.lastActiveDate) {
    return { streak: { count: 1, lastActiveDate: today }, incremented: true }
  }
  const gap = daysBetween(prev.lastActiveDate, today)
  if (gap === 0) {
    return { streak: prev, incremented: false }
  }
  if (gap === 1) {
    return { streak: { count: prev.count + 1, lastActiveDate: today }, incremented: true }
  }
  // Missed one or more days — streak resets.
  return { streak: { count: 1, lastActiveDate: today }, incremented: true }
}

export const STREAK_MILESTONES = [7, 14, 30, 60, 100]

/** Next milestone strictly greater than `count`, or null past the last one. */
export function nextMilestone(count: number, milestones: number[] = STREAK_MILESTONES): number | null {
  return milestones.find((m) => m > count) ?? null
}

export function isMilestone(count: number, milestones: number[] = STREAK_MILESTONES): boolean {
  return milestones.includes(count)
}
