import type { Achievement, UserState } from '@/domain/types'

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-win', name: 'First Win', emoji: '🏆', description: 'Complete your first lesson', isEarned: (s) => s.stats.lessonsCompleted >= 1 },
  { id: 'streak-7', name: '7-Day Streak', emoji: '🔥', description: 'Keep a 7-day streak', isEarned: (s) => s.streak.count >= 7 },
  { id: 'bookworm', name: 'Bookworm', emoji: '📚', description: 'Complete 10 lessons', isEarned: (s) => s.stats.lessonsCompleted >= 10 },
  { id: 'speed-star', name: 'Speed Star', emoji: '⚡', description: 'Win a compete match', isEarned: (s) => s.compete.wins >= 1 },
  { id: 'perfect-10', name: 'Perfect 10', emoji: '💯', description: 'Get a perfect lesson score', isEarned: (s) => Object.values(s.lessonProgress).some((p) => p.bestAccuracy >= 1) },
  { id: 'sharpshooter', name: 'Sharpshooter', emoji: '🎯', description: 'Reach 90% average accuracy', isEarned: (s) => avg(s.stats.accuracySamples) >= 0.9 && s.stats.accuracySamples.length >= 3 },
  { id: 'champion', name: 'Champion', emoji: '👑', description: 'Win 5 compete matches', isEarned: (s) => s.compete.wins >= 5 },
  { id: 'all-stars', name: 'All Stars', emoji: '🌟', description: 'Earn 3 stars on 5 lessons', isEarned: (s) => Object.values(s.lessonProgress).filter((p) => p.stars >= 3).length >= 5 },
  { id: 'collector', name: 'Collector', emoji: '🛍️', description: 'Own 5 shop items', isEarned: (s) => s.ownedItems.length >= 5 },
  { id: 'rich', name: 'Coin Master', emoji: '🪙', description: 'Save up 1000 coins', isEarned: (s) => s.coins >= 1000 },
  { id: 'scholar', name: 'Scholar', emoji: '🎓', description: 'Reach 2000 XP', isEarned: (s) => s.xp >= 2000 },
  { id: 'card-master', name: 'Card Master', emoji: '🃏', description: 'Master 10 flashcards', isEarned: (s) => Object.values(s.cardProgress).filter((p) => p.status === 'mastered').length >= 10 },
]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<
  string,
  Achievement
>

/** Returns ids of achievements newly earned given previous + current state. */
export function evaluateAchievements(prev: UserState, next: UserState): string[] {
  const newly: string[] = []
  for (const a of ACHIEVEMENTS) {
    if (!next.achievements[a.id] && a.isEarned(next)) newly.push(a.id)
  }
  void prev
  return newly
}
