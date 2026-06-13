import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './store'

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
    const reward = useStore.getState().completeLesson('english-l1', { correct: 4, total: 4 })
    const user = useStore.getState().user
    expect(user.lessonProgress['english-l1'].completed).toBe(true)
    expect(user.lessonProgress['english-l1'].stars).toBe(3)
    expect(user.stats.lessonsCompleted).toBe(1)
    expect(reward.coins).toBeGreaterThan(0)
  })

  it('purchases an affordable item and rejects an unaffordable one', () => {
    useStore.getState().addRewards({ coins: 1000 })
    const ok = useStore.getState().purchaseItem('av-cat') // 350 coins
    expect(ok).toBe(true)
    expect(useStore.getState().user.ownedItems).toContain('av-cat')

    // Drain coins, then a pricey item should fail.
    const coins = useStore.getState().user.coins
    useStore.getState().addRewards({ coins: -coins })
    const fail = useStore.getState().purchaseItem('av-dragon') // 800 coins
    expect(fail).toBe(false)
  })

  it('applies a theme when a theme item is purchased', () => {
    useStore.getState().addRewards({ coins: 1000 })
    useStore.getState().purchaseItem('th-ocean')
    expect(useStore.getState().user.settings.theme).toBe('ocean')
  })

  it('persists to localStorage', () => {
    useStore.getState().addRewards({ coins: 7 })
    const raw = localStorage.getItem('eduquest.db')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.data.coins).toBe(useStore.getState().user.coins)
  })

  it('awards achievements as conditions are met', () => {
    // resetProgress clears achievements; completing a lesson earns "first-win".
    useStore.getState().completeLesson('math-l1', { correct: 4, total: 4 })
    expect(useStore.getState().user.achievements['first-win']).toBeTruthy()
  })
})
