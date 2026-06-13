import type { UserState, SubjectId } from '@/domain/types'
import { levelForXp } from '@/domain/leveling'
import { getContent } from '@/content/runtime'

export function selectLevel(user: UserState) {
  return levelForXp(user.xp, getContent().economy.levels)
}

export function selectSubjectProgress(user: UserState, subjectId: SubjectId) {
  const lessons = getContent().lessonsBySubject[subjectId] ?? []
  const completed = lessons.filter((l) => user.lessonProgress[l.id]?.completed).length
  const total = lessons.length || 1
  return {
    completed,
    total: lessons.length,
    percent: Math.round((completed / total) * 100),
    stars: lessons.reduce((sum, l) => sum + (user.lessonProgress[l.id]?.stars ?? 0), 0),
  }
}

export function selectAverageAccuracy(user: UserState): number {
  const xs = user.stats.accuracySamples
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}
