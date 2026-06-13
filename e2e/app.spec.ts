import { test, expect, type Page } from '@playwright/test'

// Start every test from a clean slate so seeded progress is deterministic.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
})

async function gotoHash(page: Page, hash: string) {
  await page.goto(`/#${hash}`)
}

/** Dismiss the "Achievement Unlocked" modal if it happens to appear. */
async function dismissAchievement(page: Page) {
  const btn = page.getByRole('button', { name: 'Awesome!' })
  if (await btn.isVisible().catch(() => false)) await btn.click()
}

test('home dashboard loads with currency and level', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Alex' })).toBeVisible()
  // Fresh player starts with the core package's starting coins (200).
  await expect(page.getByTestId('coins')).toContainText('200')
  await expect(page.locator('.level-badge')).toBeVisible()
  await expect(page.locator('.subject-card')).toHaveCount(4)
})

test('bottom nav switches screens', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Shop' }).click()
  await expect(page.getByRole('heading', { name: 'Reward Shop' })).toBeVisible()
  await page.getByRole('button', { name: 'Profile' }).click()
  await expect(page.locator('.profile-name')).toHaveText('Alex')
})

test('completing a lesson awards rewards', async ({ page }) => {
  await gotoHash(page, '/quiz/english-l1')
  // english-l1 has 4 questions whose correct answer is option A (index 0).
  for (let i = 0; i < 4; i++) {
    await page.locator('.answer-option').first().click()
    await page.waitForTimeout(1000)
  }
  await dismissAchievement(page)
  await expect(page.getByTestId('score-popup')).toBeVisible()
  await expect(page.getByTestId('score-popup')).toContainText('Perfect!')
  await page.getByRole('button', { name: 'Continue' }).click()
  // Back on the subject hub, the lesson should now be marked complete.
  await expect(page.locator('.lesson-node.completed').first()).toBeVisible()
})

test('flashcard study session runs to results', async ({ page }) => {
  await gotoHash(page, '/flashcards')
  await expect(page.getByRole('heading', { name: 'Flashcards' })).toBeVisible()
  await page.locator('.deck-card', { hasText: 'Animal Friends' }).click()
  await expect(page.getByTestId('flashcard')).toBeVisible()

  // Deck "Animal Friends" has 6 cards; mark each "Got It".
  for (let i = 0; i < 6; i++) {
    await dismissAchievement(page)
    await page.getByRole('button', { name: 'Got It!' }).click()
    await page.waitForTimeout(150)
  }
  await dismissAchievement(page)
  await expect(page.getByRole('heading', { name: 'Great Session!' })).toBeVisible()
})

test('buying an affordable shop item shows confirmation and unlock toast', async ({ page }) => {
  await gotoHash(page, '/shop')
  // Hint Pack (150 coins) is affordable on a fresh 200-coin start.
  await page.getByRole('button', { name: '✨ Power-ups' }).click()
  await page.locator('.shop-item', { hasText: 'Hint Pack' }).click()
  await expect(page.locator('.modal-card')).toBeVisible()
  await page.getByRole('button', { name: 'Buy' }).click()
  await expect(page.getByTestId('toast-stack')).toContainText('Unlocked')
})

test('switching course pack loads a different course', async ({ page }) => {
  await gotoHash(page, '/settings')
  // The manifest lists Space Explorers; selecting it swaps all content.
  await page.locator('.time-control-row', { hasText: 'Space Explorers' }).click()
  await expect(page.getByTestId('toast-stack')).toContainText('Course loaded')
  await page.getByRole('button', { name: 'Home' }).click()
  await expect(page.locator('.subject-card', { hasText: 'Planets' })).toBeVisible()
})

test('compete match plays through to the podium', async ({ page }) => {
  await gotoHash(page, '/compete')
  await page.getByRole('button', { name: 'Find Match' }).click()
  await expect(page.locator('.matchmaking-title')).toContainText('Finding Opponents')
  await page.getByText('Tap to start now').click()

  // Answer 10 questions by clicking the first option each time.
  await expect(page.locator('.compete-answer').first()).toBeVisible()
  for (let i = 0; i < 10; i++) {
    const answer = page.locator('.compete-answer').first()
    if (await answer.isVisible().catch(() => false)) {
      await answer.click()
      await page.waitForTimeout(1300)
    }
  }
  await dismissAchievement(page)
  await expect(page.getByRole('heading', { name: 'Match Complete!' })).toBeVisible({ timeout: 15000 })
})

test('parent dashboard requires the PIN', async ({ page }) => {
  await gotoHash(page, '/parent')
  await expect(page.getByText('Parents Only')).toBeVisible()
  for (const d of ['1', '2', '3', '4']) {
    await page.getByRole('button', { name: d, exact: true }).click()
  }
  await expect(page.getByRole('heading', { name: 'Parent Dashboard' })).toBeVisible()
})

test('memory game is playable and matches reveal', async ({ page }) => {
  await gotoHash(page, '/memory')
  await expect(page.locator('.memory-card')).toHaveCount(16)
  await page.locator('.memory-card').first().click()
  await expect(page.locator('.memory-card.flipped').first()).toBeVisible()
})
