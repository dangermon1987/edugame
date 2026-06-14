import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  validateContentPackage,
  normalizeContentPackage,
  DEFAULT_ECONOMY,
  CONTENT_FORMAT,
  type ContentPackage,
} from './schema'
import { isAchievementEarned, evaluateAchievements } from './evaluate'
import coreData from './core.package.json'
import type { UserState } from '@/domain/types'

const core = coreData as unknown as ContentPackage

function emptyUser(over: Partial<UserState> = {}): UserState {
  return {
    profile: { name: 'T', avatar: '🦊', age: 8 },
    coins: 0,
    gems: 0,
    xp: 0,
    streak: { count: 0, lastActiveDate: '' },
    activeDays: [],
    lessonProgress: {},
    cardProgress: {},
    ownedItems: [],
    equippedAvatar: '🦊',
    achievements: {},
    stickers: [],
    settings: {
      sound: true, music: false, theme: '', parentPin: '1234',
      parental: { dailyTimeLimit: true, bedtimeMode: true, progressReports: true, purchaseApproval: false, multiplayerEnabled: true },
    },
    pet: { species: '🐉', name: 'P', hunger: 50, happiness: 50, energy: 50, xp: 0, evolutionStage: 0 },
    customQuizzes: {},
    compete: { matches: 0, wins: 0, winStreak: 0 },
    stats: { lessonsCompleted: 0, totalStudyMinutes: 0, dailyMinutes: {}, accuracySamples: [] },
    ...over,
  }
}

describe('content schema validation', () => {
  it('accepts the bundled core package', () => {
    const r = validateContentPackage(core)
    expect(r.ok).toBe(true)
    expect(r.errors).toEqual([])
  })

  it('accepts every package listed in the static manifest', () => {
    const dir = resolve(__dirname, '../../public/content')
    const manifest = JSON.parse(readFileSync(resolve(dir, 'index.json'), 'utf8')) as {
      packages: Array<{ id: string; file: string }>
    }
    expect(manifest.packages.length).toBeGreaterThan(0)
    for (const entry of manifest.packages) {
      const pkg = JSON.parse(readFileSync(resolve(dir, entry.file), 'utf8'))
      const r = validateContentPackage(pkg)
      // Surface which package failed, if any.
      expect({ id: entry.id, ok: r.ok, errors: r.errors }).toEqual({ id: entry.id, ok: true, errors: [] })
      // Normalizing must not throw and must index correctly.
      const c = normalizeContentPackage(pkg)
      expect(c.subjects.length).toBeGreaterThan(0)
      expect(c.lessons.length).toBeGreaterThan(0)
    }
  })

  it('rejects a package with the wrong format tag', () => {
    const r = validateContentPackage({ format: 'nope', formatVersion: 1, meta: { id: 'x', name: 'X' }, subjects: [], lessons: [] })
    expect(r.ok).toBe(false)
    expect(r.errors.join(' ')).toContain('format')
  })

  it('flags lessons without questions', () => {
    const r = validateContentPackage({
      format: CONTENT_FORMAT, formatVersion: 1, meta: { id: 'x', name: 'X' },
      subjects: [{ id: 's', name: 'S', description: '', icon: '', emoji: '', colorClass: 'english' }],
      lessons: [{ id: 'l', subjectId: 's', title: 'L', description: '', order: 1, estMinutes: 1, coinReward: 0, gemReward: 0, questions: [] }],
    })
    expect(r.ok).toBe(false)
  })

  it('warns on a lesson referencing an unknown subject', () => {
    const r = validateContentPackage({
      format: CONTENT_FORMAT, formatVersion: 1, meta: { id: 'x', name: 'X' },
      subjects: [{ id: 's', name: 'S', description: '', icon: '', emoji: '', colorClass: 'english' }],
      lessons: [{ id: 'l', subjectId: 'nope', title: 'L', description: '', order: 1, estMinutes: 1, coinReward: 0, gemReward: 0, questions: [{ id: 'q', type: 't', prompt: 'p', options: ['a', 'b'], correctIndex: 0 }] }],
    })
    expect(r.warnings.join(' ')).toContain('unknown subject')
  })
})

describe('content normalization', () => {
  it('fills economy defaults for a minimal package', () => {
    const minimal: ContentPackage = {
      format: CONTENT_FORMAT, formatVersion: 1,
      meta: { id: 'min', name: 'Min', description: '', author: '', version: '1', locale: 'en', cover: '🎓' },
      subjects: [{ id: 's', name: 'S', description: '', icon: '', emoji: '🔤', colorClass: 'english' }],
      lessons: [{ id: 'l', subjectId: 's', title: 'L', description: '', order: 1, estMinutes: 5, coinReward: 10, gemReward: 0, questions: [{ id: 'q', type: 't', prompt: 'p', options: ['a', 'b'], correctIndex: 0 }] }],
    }
    const c = normalizeContentPackage(minimal)
    expect(c.economy.startingCoins).toBe(DEFAULT_ECONOMY.startingCoins)
    expect(c.economy.levels.maxLevel).toBe(DEFAULT_ECONOMY.levels.maxLevel)
    expect(c.app.dailyChallengeLessonId).toBe('l') // defaults to first lesson
    expect(c.app.dailyChallenge.title).toBe('L') // derived from the lesson, not hardcoded
    expect(c.themes.length).toBeGreaterThan(0) // default theme injected
    expect(c.arcadeGames.length).toBeGreaterThan(0)
  })

  it('builds index maps and lessonsBySubject', () => {
    const c = normalizeContentPackage(core)
    const firstSubject = c.subjects[0].id
    expect(c.subjectById[firstSubject]).toBeTruthy()
    expect(c.lessonsBySubject[firstSubject].length).toBeGreaterThan(0)
    expect(c.cardById[c.allCards[0].id]).toBe(c.allCards[0])
  })
})

describe('achievement evaluator', () => {
  const defs = normalizeContentPackage(core).achievements

  it('awards the "1 lesson" achievement after one lesson', () => {
    const first = defs.find((d) => d.criteria.stat === 'lessonsCompleted' && d.criteria.gte <= 1)!
    expect(first).toBeTruthy()
    const u = emptyUser({ stats: { lessonsCompleted: 1, totalStudyMinutes: 0, dailyMinutes: {}, accuracySamples: [] } })
    expect(isAchievementEarned(first, u)).toBe(true)
  })

  it('respects minSamples for avgAccuracy', () => {
    const sharp = defs.find((d) => d.criteria.stat === 'avgAccuracy' && d.criteria.minSamples)!
    expect(sharp).toBeTruthy()
    const need = sharp.criteria.minSamples!
    const fewSamples = emptyUser({ stats: { lessonsCompleted: 0, totalStudyMinutes: 0, dailyMinutes: {}, accuracySamples: Array(need - 1).fill(1) } })
    expect(isAchievementEarned(sharp, fewSamples)).toBe(false)
    const enough = emptyUser({ stats: { lessonsCompleted: 0, totalStudyMinutes: 0, dailyMinutes: {}, accuracySamples: Array(need).fill(1) } })
    expect(isAchievementEarned(sharp, enough)).toBe(true)
  })

  it('only reports newly-earned achievements', () => {
    const rich = defs.find((d) => d.criteria.stat === 'coins')!
    expect(rich).toBeTruthy()
    const fresh = emptyUser({ coins: rich.criteria.gte })
    expect(evaluateAchievements(fresh, defs)).toContain(rich.id)
    const already = emptyUser({ coins: rich.criteria.gte, achievements: { [rich.id]: 1 } })
    expect(evaluateAchievements(already, defs)).not.toContain(rich.id)
  })
})
