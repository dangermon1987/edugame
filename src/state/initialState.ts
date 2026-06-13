import type { UserState } from '@/domain/types'
import { dateKey } from '@/domain/datetime'
import { ACHIEVEMENTS } from '@/content/achievements'

/**
 * Default state for a fresh install. Seeded to look like a returning player so
 * the app matches the approved prototype on first run; `resetProgress` returns
 * to a near-empty version of this.
 */
export function createInitialState(today = dateKey()): UserState {
  const state: UserState = {
    profile: { name: 'Alex', avatar: '🦊', age: 8 },
    coins: 2450,
    gems: 38,
    xp: 6150, // → Level 12 "Explorer"
    streak: { count: 7, lastActiveDate: today },
    activeDays: [today],
    lessonProgress: {
      'english-l1': { completed: true, stars: 3, bestAccuracy: 1 },
      'english-l2': { completed: true, stars: 2, bestAccuracy: 0.85 },
      'math-l1': { completed: true, stars: 3, bestAccuracy: 1 },
      'art-l1': { completed: true, stars: 2, bestAccuracy: 0.8 },
      'art-l2': { completed: true, stars: 1, bestAccuracy: 0.6 },
    },
    cardProgress: {},
    ownedItems: ['av-cat'],
    equippedAvatar: '🦊',
    achievements: {},
    stickers: ['st-star', 'st-rocket'],
    settings: {
      sound: true,
      music: false,
      theme: '',
      parentPin: '1234',
      parental: {
        dailyTimeLimit: true,
        bedtimeMode: true,
        progressReports: true,
        purchaseApproval: false,
        multiplayerEnabled: true,
      },
    },
    pet: {
      species: '🐉',
      name: 'Sparky',
      hunger: 70,
      happiness: 85,
      energy: 60,
      xp: 120,
      evolutionStage: 1,
    },
    customQuizzes: {},
    compete: { matches: 4, wins: 2, winStreak: 1 },
    stats: {
      lessonsCompleted: 5,
      totalStudyMinutes: 240,
      dailyMinutes: { [today]: 35 },
      accuracySamples: [1, 0.85, 1, 0.8, 0.6],
    },
  }

  // Pre-stamp achievements the returning player already qualifies for, so the
  // first in-app action doesn't pop a pile of "unlocked" modals at once.
  const seededAt = Date.parse(`${today}T09:00:00`)
  for (const a of ACHIEVEMENTS) {
    if (a.isEarned(state)) state.achievements[a.id] = seededAt
  }
  return state
}

/** A near-empty state used by "reset progress". Keeps profile + settings. */
export function createResetState(prev: UserState, today = dateKey()): UserState {
  const fresh = createInitialState(today)
  return {
    ...fresh,
    profile: prev.profile,
    settings: prev.settings,
    coins: 100,
    gems: 0,
    xp: 0,
    streak: { count: 0, lastActiveDate: '' },
    activeDays: [],
    lessonProgress: {},
    ownedItems: [],
    stickers: [],
    achievements: {},
    compete: { matches: 0, wins: 0, winStreak: 0 },
    stats: { lessonsCompleted: 0, totalStudyMinutes: 0, dailyMinutes: {}, accuracySamples: [] },
  }
}
