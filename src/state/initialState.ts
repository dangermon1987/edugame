import type { UserState } from '@/domain/types'
import { getContent } from '@/content/runtime'

/**
 * Fresh-install state, derived from the active content package's economy, default
 * profile, and pet. A new player starts at level 1 with the package's starting
 * currency and no progress; achievements are earned through play.
 */
export function createInitialState(): UserState {
  const content = getContent()
  const economy = content.economy
  return {
    profile: { ...content.defaultProfile },
    coins: economy.startingCoins,
    gems: economy.startingGems,
    xp: 0,
    streak: { count: 0, lastActiveDate: '' },
    activeDays: [],
    lessonProgress: {},
    cardProgress: {},
    ownedItems: [],
    equippedAvatar: content.defaultProfile.avatar,
    achievements: {},
    stickers: [],
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
      species: content.pet.species,
      name: content.pet.name,
      hunger: 70,
      happiness: 80,
      energy: 70,
      xp: 0,
      evolutionStage: 0,
    },
    customQuizzes: {},
    compete: { matches: 0, wins: 0, winStreak: 0 },
    stats: {
      lessonsCompleted: 0,
      totalStudyMinutes: 0,
      dailyMinutes: {},
      accuracySamples: [],
    },
  }
}

/** Reset keeps the player's name + settings but wipes all progress. */
export function createResetState(prev: UserState): UserState {
  const fresh = createInitialState()
  return { ...fresh, profile: prev.profile, settings: prev.settings }
}
