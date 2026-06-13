import type { CardProgress, CardStatus } from './types'

/**
 * SM-2 spaced repetition (spec §1.3). `quality` is 0-5; flashcards map the two
 * swipe gestures to quality 5 ("Got it") and 2 ("Still learning").
 */

export const DEFAULT_EASE = 2.5
export const MIN_EASE = 1.3
const DAY_MS = 86_400_000

export function newCardProgress(now: number): CardProgress {
  return {
    ease: DEFAULT_EASE,
    interval: 0,
    nextReview: now,
    correctStreak: 0,
    status: 'new',
  }
}

function statusFor(correctStreak: number): CardStatus {
  if (correctStreak >= 3) return 'mastered'
  if (correctStreak >= 1) return 'learning'
  return 'new'
}

export function reviewCard(prev: CardProgress, quality: number, now: number): CardProgress {
  const passed = quality >= 3

  // Update ease factor (SM-2 formula), clamped to a sane floor.
  let ease = prev.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  ease = Math.max(MIN_EASE, ease)

  let interval: number
  let correctStreak: number

  if (!passed) {
    // Lapse — relearn from the start, keep adjusted ease.
    correctStreak = 0
    interval = 1
  } else {
    correctStreak = prev.correctStreak + 1
    if (correctStreak === 1) interval = 1
    else if (correctStreak === 2) interval = 6
    else interval = Math.round(prev.interval * ease)
    interval = Math.max(1, interval)
  }

  return {
    ease,
    interval,
    nextReview: now + interval * DAY_MS,
    correctStreak,
    status: statusFor(correctStreak),
  }
}

/** Whether a card is due for review at `now`. New cards (no progress) are due. */
export function isDue(progress: CardProgress | undefined, now: number): boolean {
  if (!progress) return true
  return progress.nextReview <= now
}
