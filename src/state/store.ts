import { create } from 'zustand'
import type { UserState, SubjectId, QuizQuestion, CustomQuiz } from '@/domain/types'
import { createInitialState, createResetState } from './initialState'
import { evaluateAchievements } from '@/content/achievements'
import { SHOP_BY_ID } from '@/content/shop'
import { LESSON_BY_ID } from '@/content/lessons'
import { CARD_BY_ID } from '@/content/decks'
import { reviewCard, newCardProgress } from '@/domain/sm2'
import { registerActivity } from '@/domain/streak'
import { dateKey } from '@/domain/datetime'
import { uuid, getDeviceId } from '@/lib/id'
import {
  LocalStoragePersistence,
  SyncEngine,
  SCHEMA_VERSION,
  type PersistedSnapshot,
  type SnapshotPersistence,
  type SyncState,
} from '@/storage'

export interface Toast {
  id: string
  message: string
  emoji?: string
  kind?: 'success' | 'error' | 'info'
}

export interface RewardBundle {
  coins?: number
  gems?: number
  xp?: number
}

interface StoreShape {
  user: UserState
  updatedAt: number
  sync: SyncState
  driveConnected: boolean
  toasts: Toast[]
  /** ids of achievements awarded but not yet shown in a popup. */
  pendingAchievements: string[]

  // reward + progress
  addRewards: (r: RewardBundle) => void
  completeLesson: (lessonId: string, result: { correct: number; total: number }) => RewardBundle
  reviewFlashcard: (cardId: string, quality: number) => void
  finishCompeteMatch: (placement: number, perfect: boolean) => RewardBundle
  registerStudyMinutes: (minutes: number) => void

  // shop / cosmetics
  purchaseItem: (itemId: string) => boolean
  equipAvatar: (emoji: string) => void
  setTheme: (theme: string) => void

  // settings / parental
  setSetting: (key: 'sound' | 'music', value: boolean) => void
  setParental: (key: keyof UserState['settings']['parental'], value: boolean) => void
  setParentPin: (pin: string) => void
  setProfile: (patch: Partial<UserState['profile']>) => void

  // workshop / stickers / pet
  addCustomQuiz: (quiz: Omit<CustomQuiz, 'id' | 'createdAt'>) => void
  removeCustomQuiz: (id: string) => void
  addSticker: (id: string) => void
  petAction: (action: 'feed' | 'play' | 'rest') => void

  // toasts + achievements
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  clearPendingAchievements: () => void

  // lifecycle
  resetProgress: () => void
  connectDrive: () => Promise<void>
  disconnectDrive: () => Promise<void>
  syncNow: () => Promise<void>
}

// --- persistence singletons -------------------------------------------------
const local = new LocalStoragePersistence()

function buildSnapshot(user: UserState, updatedAt: number): PersistedSnapshot<UserState> {
  return { schemaVersion: SCHEMA_VERSION, updatedAt, deviceId: getDeviceId(), data: user }
}

function hydrate(): { user: UserState; updatedAt: number } {
  const snap = local.loadSync()
  if (snap && snap.data) {
    // Shallow-merge over defaults so new fields added in later versions exist.
    const merged = { ...createInitialState(), ...(snap.data as UserState) }
    return { user: merged, updatedAt: snap.updatedAt }
  }
  return { user: createInitialState(), updatedAt: Date.now() }
}

const initial = hydrate()

// The sync engine reads/writes through closures bound to the store below.
let syncEngine: SyncEngine

export const useStore = create<StoreShape>((set, get) => {
  /** Apply a pure state transform, recompute achievements, persist, bump clock. */
  function mutate(fn: (s: UserState) => UserState, opts: { touchStreak?: boolean } = {}) {
    set((state) => {
      let next = fn(state.user)
      if (opts.touchStreak) {
        const today = dateKey()
        const r = registerActivity(next.streak, today)
        next = {
          ...next,
          streak: r.streak,
          activeDays: next.activeDays.includes(today) ? next.activeDays : [...next.activeDays, today],
        }
      }
      const newly = evaluateAchievements(state.user, next)
      if (newly.length) {
        const stamped = { ...next.achievements }
        for (const id of newly) stamped[id] = Date.now()
        next = { ...next, achievements: stamped }
      }
      const updatedAt = Date.now()
      local.saveSync(buildSnapshot(next, updatedAt))
      return {
        user: next,
        updatedAt,
        pendingAchievements: newly.length
          ? [...state.pendingAchievements, ...newly]
          : state.pendingAchievements,
      }
    })
  }

  syncEngine = new SyncEngine({
    getSnapshot: () => buildSnapshot(get().user, get().updatedAt),
    applyRemote: (snap) => {
      const data = snap.data as UserState
      const merged = { ...createInitialState(), ...data }
      local.saveSync(buildSnapshot(merged, snap.updatedAt))
      set({ user: merged, updatedAt: snap.updatedAt })
    },
    onStateChange: (sync) => set({ sync }),
  })

  return {
    user: initial.user,
    updatedAt: initial.updatedAt,
    sync: syncEngine.getState(),
    driveConnected: false,
    toasts: [],
    pendingAchievements: [],

    addRewards: (r) =>
      mutate((s) => ({
        ...s,
        coins: s.coins + (r.coins ?? 0),
        gems: s.gems + (r.gems ?? 0),
        xp: s.xp + (r.xp ?? 0),
      })),

    completeLesson: (lessonId, { correct, total }) => {
      const lesson = LESSON_BY_ID[lessonId]
      const accuracy = total > 0 ? correct / total : 0
      const stars = accuracy >= 1 ? 3 : accuracy >= 0.7 ? 2 : accuracy > 0 ? 1 : 0
      const baseCoins = lesson?.coinReward ?? 50
      const xpGain = correct * 10 + (accuracy >= 1 ? 50 : 0)
      const gemGain = (lesson?.gemReward ?? 0) + (accuracy >= 1 ? 2 : 0)
      const reward: RewardBundle = { coins: baseCoins, xp: xpGain, gems: gemGain }

      mutate((s) => {
        const prev = s.lessonProgress[lessonId]
        const lessonProgress = {
          ...s.lessonProgress,
          [lessonId]: {
            completed: true,
            stars: Math.max(stars, prev?.stars ?? 0),
            bestAccuracy: Math.max(accuracy, prev?.bestAccuracy ?? 0),
          },
        }
        return {
          ...s,
          coins: s.coins + (reward.coins ?? 0),
          gems: s.gems + (reward.gems ?? 0),
          xp: s.xp + (reward.xp ?? 0),
          lessonProgress,
          stats: {
            ...s.stats,
            lessonsCompleted: prev?.completed ? s.stats.lessonsCompleted : s.stats.lessonsCompleted + 1,
            accuracySamples: [...s.stats.accuracySamples, accuracy].slice(-50),
          },
        }
      }, { touchStreak: true })

      return reward
    },

    reviewFlashcard: (cardId, quality) => {
      if (!CARD_BY_ID[cardId]) return
      mutate((s) => {
        const prev = s.cardProgress[cardId] ?? newCardProgress(Date.now())
        return {
          ...s,
          cardProgress: { ...s.cardProgress, [cardId]: reviewCard(prev, quality, Date.now()) },
        }
      }, { touchStreak: true })
    },

    finishCompeteMatch: (placement, perfect) => {
      const reward: RewardBundle =
        placement === 1
          ? { xp: 200, coins: 100 }
          : placement === 2
            ? { xp: 100, coins: 50 }
            : placement === 3
              ? { xp: 50, coins: 25 }
              : { xp: 20, coins: 10 }
      if (perfect) reward.gems = (reward.gems ?? 0) + 5

      mutate((s) => ({
        ...s,
        coins: s.coins + (reward.coins ?? 0),
        gems: s.gems + (reward.gems ?? 0),
        xp: s.xp + (reward.xp ?? 0),
        compete: {
          matches: s.compete.matches + 1,
          wins: s.compete.wins + (placement === 1 ? 1 : 0),
          winStreak: placement === 1 ? s.compete.winStreak + 1 : 0,
        },
      }), { touchStreak: true })
      return reward
    },

    registerStudyMinutes: (minutes) =>
      mutate((s) => {
        const today = dateKey()
        return {
          ...s,
          stats: {
            ...s.stats,
            totalStudyMinutes: s.stats.totalStudyMinutes + minutes,
            dailyMinutes: { ...s.stats.dailyMinutes, [today]: (s.stats.dailyMinutes[today] ?? 0) + minutes },
          },
        }
      }),

    purchaseItem: (itemId) => {
      const item = SHOP_BY_ID[itemId]
      const s = get().user
      if (!item || s.ownedItems.includes(itemId)) return false
      const balance = item.currency === 'coins' ? s.coins : s.gems
      if (balance < item.price) {
        get().pushToast({ message: `Not enough ${item.currency}!`, emoji: '😅', kind: 'error' })
        return false
      }
      mutate((st) => ({
        ...st,
        coins: item.currency === 'coins' ? st.coins - item.price : st.coins,
        gems: item.currency === 'gems' ? st.gems - item.price : st.gems,
        ownedItems: [...st.ownedItems, itemId],
        // Auto-equip avatars and apply themes on purchase for instant gratification.
        equippedAvatar: item.category === 'avatars' ? (item.payload ?? st.equippedAvatar) : st.equippedAvatar,
        settings:
          item.category === 'themes'
            ? { ...st.settings, theme: item.payload ?? st.settings.theme }
            : st.settings,
      }))
      get().pushToast({ message: `Unlocked ${item.name}!`, emoji: item.preview, kind: 'success' })
      return true
    },

    equipAvatar: (emoji) => mutate((s) => ({ ...s, equippedAvatar: emoji, profile: { ...s.profile, avatar: emoji } })),
    setTheme: (theme) => mutate((s) => ({ ...s, settings: { ...s.settings, theme } })),

    setSetting: (key, value) => mutate((s) => ({ ...s, settings: { ...s.settings, [key]: value } })),
    setParental: (key, value) =>
      mutate((s) => ({ ...s, settings: { ...s.settings, parental: { ...s.settings.parental, [key]: value } } })),
    setParentPin: (pin) => mutate((s) => ({ ...s, settings: { ...s.settings, parentPin: pin } })),
    setProfile: (patch) => mutate((s) => ({ ...s, profile: { ...s.profile, ...patch } })),

    addCustomQuiz: (quiz) =>
      mutate((s) => {
        const id = uuid()
        const full: CustomQuiz = { ...quiz, id, createdAt: Date.now() }
        return { ...s, customQuizzes: { ...s.customQuizzes, [id]: full } }
      }),
    removeCustomQuiz: (id) =>
      mutate((s) => {
        const next = { ...s.customQuizzes }
        delete next[id]
        return { ...s, customQuizzes: next }
      }),

    addSticker: (id) =>
      mutate((s) => (s.stickers.includes(id) ? s : { ...s, stickers: [...s.stickers, id] })),

    petAction: (action) =>
      mutate((s) => {
        const clamp = (n: number) => Math.max(0, Math.min(100, n))
        const pet = { ...s.pet }
        if (action === 'feed') pet.hunger = clamp(pet.hunger + 25)
        if (action === 'play') {
          pet.happiness = clamp(pet.happiness + 20)
          pet.energy = clamp(pet.energy - 10)
        }
        if (action === 'rest') pet.energy = clamp(pet.energy + 30)
        pet.xp += 10
        if (pet.xp >= 300) {
          pet.evolutionStage = Math.min(3, pet.evolutionStage + 1)
          pet.xp = 0
        }
        return { ...s, pet }
      }),

    pushToast: (t) => {
      const id = uuid()
      set((state) => ({ toasts: [...state.toasts, { ...t, id }] }))
      setTimeout(() => get().dismissToast(id), 2800)
    },
    dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    clearPendingAchievements: () => set({ pendingAchievements: [] }),

    resetProgress: () =>
      mutate((s) => createResetState(s)),

    connectDrive: async () => {
      const { createDriveClient } = await import('@/lib/googleDrive')
      const { GoogleDrivePersistence } = await import('@/storage')
      try {
        const client = await createDriveClient()
        await client.signIn()
        const remote: SnapshotPersistence = new GoogleDrivePersistence(client)
        syncEngine.setRemote(remote)
        set({ driveConnected: true })
        get().pushToast({ message: 'Connected to Google Drive', emoji: '☁️', kind: 'success' })
      } catch (err) {
        get().pushToast({
          message: err instanceof Error ? err.message : 'Drive connection failed',
          emoji: '⚠️',
          kind: 'error',
        })
      }
    },

    disconnectDrive: async () => {
      syncEngine.setRemote(null)
      set({ driveConnected: false })
      try {
        const { signOutDrive } = await import('@/lib/googleDrive')
        await signOutDrive()
      } catch {
        /* ignore */
      }
      get().pushToast({ message: 'Disconnected from Google Drive', emoji: '👋', kind: 'info' })
    },

    syncNow: async () => {
      await syncEngine.syncNow()
    },
  }
})

/** Flush local + push to remote — call on page hide/unload. */
export function flushAndPush(): void {
  const s = useStore.getState()
  local.saveSync(buildSnapshot(s.user, s.updatedAt))
  void syncEngine.pushNow()
}

export type { SubjectId, QuizQuestion }
