import type { Subject } from '@/domain/types'

export const SUBJECTS: Subject[] = [
  {
    id: 'english',
    name: 'English',
    description: 'Vocabulary & Grammar',
    icon: 'fas fa-book-open',
    emoji: '📚',
    colorClass: 'english',
  },
  {
    id: 'math',
    name: 'Math',
    description: 'Addition & Shapes',
    icon: 'fas fa-calculator',
    emoji: '🔢',
    colorClass: 'math',
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Animals & Nature',
    icon: 'fas fa-flask',
    emoji: '🔬',
    colorClass: 'science',
  },
  {
    id: 'art',
    name: 'Art',
    description: 'Colors & Drawing',
    icon: 'fas fa-palette',
    emoji: '🎨',
    colorClass: 'art',
  },
]

export const SUBJECT_BY_ID = Object.fromEntries(SUBJECTS.map((s) => [s.id, s])) as Record<
  string,
  Subject
>
