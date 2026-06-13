/** Core domain types for EduQuest. Content (static) + user state (mutable). */

/** Subject ids are arbitrary strings so packages can define any subjects. */
export type SubjectId = string
/** Palette slot picked by a subject; each has matching design-system CSS. */
export type SubjectColor = 'english' | 'math' | 'science' | 'art' | 'music' | 'coding'
export type CurrencyKind = 'coins' | 'gems' | 'xp'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

export interface Subject {
  id: SubjectId
  name: string
  description: string
  /** Font Awesome icon class, e.g. "fas fa-book-open". */
  icon: string
  emoji: string
  /** Palette slot ("english" | "math" | ...) — drives card/progress colors. */
  colorClass: SubjectColor
}

export interface QuizQuestion {
  id: string
  /** e.g. "Vocabulary", "Addition" — shown as the type tag. */
  type: string
  prompt: string
  hint?: string
  options: string[]
  correctIndex: number
}

export interface Lesson {
  id: string
  subjectId: SubjectId
  title: string
  description: string
  estMinutes: number
  coinReward: number
  gemReward: number
  order: number
  questions: QuizQuestion[]
}

export interface Flashcard {
  id: string
  deckId: string
  frontText: string
  /** Emoji used as the card-front media in lieu of real image/video assets. */
  frontEmoji: string
  backContent: string
  backDetails: string
}

export interface Deck {
  id: string
  subject: SubjectId
  title: string
  description: string
  iconEmoji: string
  difficulty: Difficulty
  cards: Flashcard[]
}

export type ShopCategory = 'avatars' | 'themes' | 'pets' | 'powerups'
export type Rarity = 'common' | 'new' | 'hot' | 'rare'

export interface ShopItem {
  id: string
  category: ShopCategory
  name: string
  preview: string
  price: number
  currency: 'coins' | 'gems'
  rarity?: Rarity
  /** For themes: the data-theme value to apply. For avatars: the emoji. */
  payload?: string
}

// NOTE: Achievements are defined declaratively in the content package
// (see AchievementDef / AchievementCriteria in src/content/schema.ts) so they
// are serializable and AI-generatable, not as code predicates.

export interface Theme {
  id: string
  name: string
  emoji: string
  description: string
  swatch: string[]
}

// ---------------------------------------------------------------------------
// Mutable user state (the document collections persisted + synced)
// ---------------------------------------------------------------------------

export interface LessonProgress {
  completed: boolean
  stars: number // 0-3
  bestAccuracy: number // 0-1
}

export type CardStatus = 'new' | 'learning' | 'mastered'

export interface CardProgress {
  ease: number
  interval: number // days
  nextReview: number // epoch ms
  correctStreak: number
  status: CardStatus
}

export interface ParentalControls {
  dailyTimeLimit: boolean
  bedtimeMode: boolean
  progressReports: boolean
  purchaseApproval: boolean
  multiplayerEnabled: boolean
}

export interface Settings {
  sound: boolean
  music: boolean
  theme: string // '' = default purple, else data-theme value
  parentPin: string
  parental: ParentalControls
}

export interface PetState {
  species: string
  name: string
  hunger: number // 0-100
  happiness: number // 0-100
  energy: number // 0-100
  xp: number
  evolutionStage: number // 0..3
}

export interface CustomQuiz {
  id: string
  title: string
  emoji: string
  subject: SubjectId
  questions: QuizQuestion[]
  createdAt: number
}

export interface UserProfile {
  name: string
  avatar: string // emoji
  age: number
}

/** The full mutable app database. Maps are the "NoSQL document collections". */
export interface UserState {
  profile: UserProfile
  coins: number
  gems: number
  xp: number
  streak: {
    count: number
    lastActiveDate: string // YYYY-MM-DD
  }
  /** Set of YYYY-MM-DD strings the child was active. */
  activeDays: string[]
  lessonProgress: Record<string, LessonProgress>
  cardProgress: Record<string, CardProgress>
  ownedItems: string[]
  equippedAvatar: string
  achievements: Record<string, number> // id -> earnedAt epoch ms
  stickers: string[]
  settings: Settings
  pet: PetState
  customQuizzes: Record<string, CustomQuiz>
  compete: {
    matches: number
    wins: number
    winStreak: number
  }
  stats: {
    lessonsCompleted: number
    totalStudyMinutes: number
    /** date -> minutes studied that day. */
    dailyMinutes: Record<string, number>
    /** rolling list of recent accuracy samples (0-1) for averaging. */
    accuracySamples: number[]
  }
}
