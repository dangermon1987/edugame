import { describe, it, expect } from 'vitest'
import { levelForXp, levelTitle, MAX_LEVEL, cumulativeXpForLevel } from './leveling'
import { comboMultiplier } from './combo'
import { registerActivity, nextMilestone } from './streak'
import { reviewCard, newCardProgress, isDue } from './sm2'
import { botAnswer, pickBots } from './bots'

describe('leveling', () => {
  it('starts at level 1 with 0 xp', () => {
    const info = levelForXp(0)
    expect(info.level).toBe(1)
    expect(info.title).toBe('Beginner')
    expect(info.progress).toBe(0)
  })

  it('reaches level 2 after the first threshold', () => {
    expect(levelForXp(100).level).toBe(2)
    expect(levelForXp(99).level).toBe(1)
  })

  it('assigns the right title bands', () => {
    expect(levelTitle(3)).toBe('Beginner')
    expect(levelTitle(12)).toBe('Explorer')
    expect(levelTitle(20)).toBe('Scholar')
    expect(levelTitle(30)).toBe('Master')
    expect(levelTitle(45)).toBe('Legend')
  })

  it('caps at MAX_LEVEL', () => {
    expect(levelForXp(10_000_000).level).toBe(MAX_LEVEL)
    expect(levelForXp(10_000_000).progress).toBe(1)
  })

  it('cumulative xp is monotonic', () => {
    expect(cumulativeXpForLevel(2)).toBe(100)
    expect(cumulativeXpForLevel(3)).toBeGreaterThan(cumulativeXpForLevel(2))
  })
})

describe('combo', () => {
  it('escalates per spec thresholds', () => {
    expect(comboMultiplier(0)).toBe(1)
    expect(comboMultiplier(2)).toBe(1)
    expect(comboMultiplier(3)).toBe(2)
    expect(comboMultiplier(5)).toBe(3)
    expect(comboMultiplier(8)).toBe(4)
    expect(comboMultiplier(12)).toBe(5)
    expect(comboMultiplier(99)).toBe(5)
  })
})

describe('streak', () => {
  it('starts a streak on first activity', () => {
    const r = registerActivity({ count: 0, lastActiveDate: '' }, '2026-06-13')
    expect(r.streak.count).toBe(1)
    expect(r.incremented).toBe(true)
  })

  it('does not double-count same day', () => {
    const r = registerActivity({ count: 5, lastActiveDate: '2026-06-13' }, '2026-06-13')
    expect(r.streak.count).toBe(5)
    expect(r.incremented).toBe(false)
  })

  it('increments on consecutive day', () => {
    const r = registerActivity({ count: 5, lastActiveDate: '2026-06-12' }, '2026-06-13')
    expect(r.streak.count).toBe(6)
  })

  it('resets after a gap', () => {
    const r = registerActivity({ count: 5, lastActiveDate: '2026-06-10' }, '2026-06-13')
    expect(r.streak.count).toBe(1)
  })

  it('finds the next milestone', () => {
    expect(nextMilestone(3)).toBe(7)
    expect(nextMilestone(7)).toBe(14)
    expect(nextMilestone(200)).toBeNull()
  })
})

describe('sm2', () => {
  const now = 1_000_000_000_000

  it('new cards are due immediately', () => {
    expect(isDue(undefined, now)).toBe(true)
    expect(isDue(newCardProgress(now), now)).toBe(true)
  })

  it('advances interval on correct reviews', () => {
    let p = newCardProgress(now)
    p = reviewCard(p, 5, now)
    expect(p.interval).toBe(1)
    expect(p.status).toBe('learning')
    p = reviewCard(p, 5, now)
    expect(p.interval).toBe(6)
    p = reviewCard(p, 5, now)
    expect(p.status).toBe('mastered')
    expect(p.interval).toBeGreaterThan(6)
  })

  it('resets streak on a lapse but keeps a floor ease', () => {
    let p = newCardProgress(now)
    p = reviewCard(p, 5, now)
    p = reviewCard(p, 2, now)
    expect(p.correctStreak).toBe(0)
    expect(p.interval).toBe(1)
    expect(p.ease).toBeGreaterThanOrEqual(1.3)
  })
})

describe('bots', () => {
  const seq = (vals: number[]) => {
    let i = 0
    return () => vals[i++ % vals.length]
  }

  it('answers correctly when rng is below accuracy', () => {
    const bot = { id: 'b', name: 'B', avatar: '🤖', tier: 'rookie' as const, accuracy: 0.5, minMs: 1000, maxMs: 2000 }
    expect(botAnswer(bot, seq([0.1, 0.5])).correct).toBe(true)
    expect(botAnswer(bot, seq([0.9, 0.5])).correct).toBe(false)
  })

  it('picks the requested number of bots', () => {
    expect(pickBots(3, 'mixed')).toHaveLength(3)
    expect(pickBots(3, 'champion')).toHaveLength(3)
  })
})
