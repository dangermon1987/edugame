import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './store'
import { getContent } from '@/content/runtime'

function reset() {
  useStore.getState().resetProgress()
}

describe('store actions', () => {
  beforeEach(() => {
    reset()
  })

  it('adds rewards', () => {
    const before = useStore.getState().user
    useStore.getState().addRewards({ coins: 50, xp: 100, gems: 2 })
    const after = useStore.getState().user
    expect(after.coins).toBe(before.coins + 50)
    expect(after.xp).toBe(before.xp + 100)
    expect(after.gems).toBe(before.gems + 2)
  })

  it('completes a lesson and records progress', () => {
    const lessonId = getContent().lessons[0].id
    const reward = useStore.getState().completeLesson(lessonId, { correct: 4, total: 4 })
    const user = useStore.getState().user
    expect(user.lessonProgress[lessonId].completed).toBe(true)
    expect(user.lessonProgress[lessonId].stars).toBe(3)
    expect(user.stats.lessonsCompleted).toBe(1)
    expect(reward.coins).toBeGreaterThan(0)
  })

  it('purchases an affordable item and rejects an unaffordable one', () => {
    const coinItems = getContent().shopItems.filter((i) => i.currency === 'coins')
    const cheap = [...coinItems].sort((a, b) => a.price - b.price)[0]
    const pricey = [...coinItems].sort((a, b) => b.price - a.price)[0]

    useStore.getState().addRewards({ coins: 5000 })
    expect(useStore.getState().purchaseItem(cheap.id)).toBe(true)
    expect(useStore.getState().user.ownedItems).toContain(cheap.id)

    // Drain coins, then the most expensive coin item should fail.
    useStore.getState().addRewards({ coins: -useStore.getState().user.coins })
    expect(useStore.getState().purchaseItem(pricey.id)).toBe(false)
  })

  it('applies a theme when a theme item is purchased', () => {
    const themeItem = getContent().shopItems.find((i) => i.category === 'themes')!
    useStore.getState().addRewards({ coins: 5000, gems: 100 })
    useStore.getState().purchaseItem(themeItem.id)
    expect(useStore.getState().user.settings.theme).toBe(themeItem.payload)
  })

  it('persists to localStorage', () => {
    useStore.getState().addRewards({ coins: 7 })
    const raw = localStorage.getItem('eduquest.db.guest')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.data.coins).toBe(useStore.getState().user.coins)
  })

  it('awards achievements as conditions are met', () => {
    // Completing one lesson should satisfy the "1 lesson" achievement in the pack.
    const ach = getContent().achievements.find((a) => a.criteria.stat === 'lessonsCompleted' && a.criteria.gte <= 1)
    expect(ach).toBeTruthy()
    useStore.getState().completeLesson(getContent().lessons[0].id, { correct: 4, total: 4 })
    expect(useStore.getState().user.achievements[ach!.id]).toBeTruthy()
  })
})
