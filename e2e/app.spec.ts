import { test, expect, type Page } from '@playwright/test'

// Fresh slate each test (cleared on every document load).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
})

async function gotoHash(page: Page, hash: string) {
  await page.goto(`/#${hash}`)
}

async function dismissAchievement(page: Page) {
  const btn = page.getByRole('button', { name: /Awesome|Tuyệt vời|太棒了|やったね/ })
  if (await btn.isVisible().catch(() => false)) await btn.click()
}

/**
 * Sign in as guest, then switch to the English course pack so UI chrome is
 * deterministic English for text-based assertions. (Hash navigations don't
 * reload the document, so the guest session + pack persist within a test.)
 */
async function enterEnglish(page: Page) {
  await page.goto('/')
  await page.getByTestId('auth-guest').click()
  await gotoHash(page, '/settings')
  await page.locator('.time-control-row', { hasText: 'EduQuest Core (English)' }).click()
  await page.waitForFunction(() => {
    try {
      return JSON.parse(localStorage.getItem('eduquest.content') || '{}').meta?.locale === 'en'
    } catch {
      return false
    }
  })
}

test('auth gate: guest sign-in reveals the app', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.auth-screen')).toBeVisible()
  await page.getByTestId('auth-guest').click()
  await expect(page.locator('.home-header')).toBeVisible()
})

test('sign up, sign out, then sign back in', async ({ page }) => {
  await page.goto('/')
  // No accounts yet → starts in sign-up mode (display name field present).
  await page.getByTestId('auth-displayname').fill('Tester')
  await page.getByTestId('auth-username').fill('tester1')
  await page.getByTestId('auth-password').fill('pass1234')
  await page.getByTestId('auth-submit').click()
  await expect(page.locator('.home-header')).toBeVisible()

  await gotoHash(page, '/settings')
  await page.getByTestId('signout').click()
  await expect(page.locator('.auth-screen')).toBeVisible()

  // Now sign in with the same credentials (still on the #/settings route).
  await page.getByTestId('auth-username').fill('tester1')
  await page.getByTestId('auth-password').fill('pass1234')
  await page.getByTestId('auth-submit').click()
  await expect(page.locator('.auth-screen')).toHaveCount(0) // signed in → app shown
  await gotoHash(page, '/')
  await expect(page.locator('.home-header')).toBeVisible()
})

test('wrong password is rejected', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('auth-displayname').fill('Tester')
  await page.getByTestId('auth-username').fill('tester2')
  await page.getByTestId('auth-password').fill('pass1234')
  await page.getByTestId('auth-submit').click()
  await expect(page.locator('.home-header')).toBeVisible()
  await gotoHash(page, '/settings')
  await page.getByTestId('signout').click()
  await page.getByTestId('auth-username').fill('tester2')
  await page.getByTestId('auth-password').fill('wrongpass')
  await page.getByTestId('auth-submit').click()
  await expect(page.locator('.auth-error')).toBeVisible()
})

test('switching to the Chinese course localizes the whole UI', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('auth-guest').click()
  await gotoHash(page, '/settings')
  await page.locator('.time-control-row', { hasText: '快乐学习' }).click()
  await gotoHash(page, '/')
  await expect(page.getByText('我的科目')).toBeVisible() // "My Subjects" in Chinese
  await expect(page.locator('.subject-card', { hasText: '数学' })).toBeVisible()
})

test('switching to the Japanese course localizes the whole UI', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('auth-guest').click()
  await gotoHash(page, '/settings')
  await page.locator('.time-control-row', { hasText: 'たのしく学ぼう' }).click()
  await gotoHash(page, '/')
  await expect(page.getByText('わたしの教科')).toBeVisible() // "My Subjects" in Japanese
})

test('home dashboard loads with currency, level and subjects', async ({ page }) => {
  await enterEnglish(page)
  await gotoHash(page, '/')
  await expect(page.locator('.greeting-left h1')).not.toBeEmpty()
  await expect(page.getByTestId('coins')).not.toBeEmpty()
  await expect(page.locator('.level-badge')).toBeVisible()
  await expect(page.locator('.subject-card')).toHaveCount(4)
})

test('nav switches screens', async ({ page }) => {
  await enterEnglish(page)
  await gotoHash(page, '/')
  await page.getByRole('button', { name: 'Shop' }).click()
  await expect(page.getByRole('heading', { name: 'Reward Shop' })).toBeVisible()
})

test('playing a lesson reaches the score screen', async ({ page }) => {
  await enterEnglish(page)
  await gotoHash(page, '/')
  await page.locator('.subject-card').first().click()
  await page.getByRole('button', { name: 'Continue' }).first().click()
  await expect(page.locator('.answer-option').first()).toBeVisible()
  for (let i = 0; i < 8; i++) {
    if (await page.getByTestId('score-popup').isVisible().catch(() => false)) break
    const opt = page.locator('.answer-option').first()
    if (await opt.isVisible().catch(() => false)) await opt.click()
    await page.waitForTimeout(1000)
  }
  await dismissAchievement(page)
  await expect(page.getByTestId('score-popup')).toBeVisible()
})

test('flashcard study session runs to results', async ({ page }) => {
  await enterEnglish(page)
  await gotoHash(page, '/flashcards')
  await page.locator('.deck-card').first().click()
  await expect(page.getByTestId('flashcard')).toBeVisible()
  for (let i = 0; i < 16; i++) {
    await dismissAchievement(page)
    if (await page.locator('.results-celebration').isVisible().catch(() => false)) break
    const got = page.getByRole('button', { name: 'Got It!' })
    if (await got.isVisible().catch(() => false)) await got.click()
    await page.waitForTimeout(150)
  }
  await dismissAchievement(page)
  await expect(page.getByRole('heading', { name: 'Great Session!' })).toBeVisible()
})

test('daily lucky spin grants a reward', async ({ page }) => {
  await enterEnglish(page)
  await gotoHash(page, '/shop')
  await page.locator('.spin-card').click()
  await expect(page.getByTestId('toast-stack')).toContainText('Lucky Spin')
})

test('compete match plays through to the podium', async ({ page }) => {
  await enterEnglish(page)
  await gotoHash(page, '/compete')
  await page.getByRole('button', { name: 'Find Match' }).click()
  await page.getByText('Tap to start now').click()
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
  await enterEnglish(page)
  await gotoHash(page, '/parent')
  await expect(page.getByText('Parents Only')).toBeVisible()
  for (const d of ['1', '2', '3', '4']) {
    await page.getByRole('button', { name: d, exact: true }).click()
  }
  await expect(page.getByRole('heading', { name: 'Parent Dashboard' })).toBeVisible()
})

test('memory game is playable', async ({ page }) => {
  await enterEnglish(page)
  await gotoHash(page, '/memory')
  await expect(page.locator('.memory-card')).toHaveCount(16)
  await page.locator('.memory-card').first().click()
  await expect(page.locator('.memory-card.flipped').first()).toBeVisible()
})
