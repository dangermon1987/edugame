import type { Deck, Flashcard, SubjectId, Difficulty } from '@/domain/types'

let cSeq = 0
function card(deckId: string, frontEmoji: string, frontText: string, backContent: string, backDetails: string): Flashcard {
  return { id: `c${++cSeq}`, deckId, frontEmoji, frontText, backContent, backDetails }
}

interface DeckSeed {
  id: string
  subject: SubjectId
  title: string
  description: string
  iconEmoji: string
  difficulty: Difficulty
  cards: Array<[emoji: string, front: string, back: string, details: string]>
}

const SEEDS: DeckSeed[] = [
  {
    id: 'deck-animals',
    subject: 'science',
    title: 'Animal Friends',
    description: 'Meet animals from around the world',
    iconEmoji: '🦁',
    difficulty: 'Easy',
    cards: [
      ['🦁', 'What animal is this?', 'Lion', 'Lions are big cats that live in groups called prides.'],
      ['🐘', 'What animal is this?', 'Elephant', 'Elephants are the largest land animals and have trunks.'],
      ['🐧', 'What animal is this?', 'Penguin', 'Penguins are birds that swim but cannot fly.'],
      ['🦒', 'What animal is this?', 'Giraffe', 'Giraffes have very long necks to reach tall leaves.'],
      ['🐢', 'What animal is this?', 'Turtle', 'Turtles carry their homes (shells) on their backs.'],
      ['🦋', 'What animal is this?', 'Butterfly', 'Butterflies start life as caterpillars.'],
    ],
  },
  {
    id: 'deck-sight-words',
    subject: 'english',
    title: 'Sight Words',
    description: 'Words you should know by sight',
    iconEmoji: '📖',
    difficulty: 'Easy',
    cards: [
      ['👀', 'Read this word: "the"', 'the', '"The" is the most common word in English.'],
      ['👀', 'Read this word: "and"', 'and', '"And" joins two things together.'],
      ['👀', 'Read this word: "you"', 'you', '"You" means the person being spoken to.'],
      ['👀', 'Read this word: "play"', 'play', '"Play" is a fun action word.'],
      ['👀', 'Read this word: "happy"', 'happy', '"Happy" means feeling good and joyful.'],
      ['👀', 'Read this word: "friend"', 'friend', 'A "friend" is someone you like to be with.'],
    ],
  },
  {
    id: 'deck-times-tables',
    subject: 'math',
    title: 'Times Tables (2s)',
    description: 'Multiplication by 2',
    iconEmoji: '✖️',
    difficulty: 'Medium',
    cards: [
      ['2️⃣', '2 × 2 = ?', '4', 'Two groups of two make four.'],
      ['2️⃣', '2 × 3 = ?', '6', 'Two groups of three make six.'],
      ['2️⃣', '2 × 4 = ?', '8', 'Two groups of four make eight.'],
      ['2️⃣', '2 × 5 = ?', '10', 'Two groups of five make ten.'],
      ['2️⃣', '2 × 6 = ?', '12', 'Two groups of six make twelve.'],
      ['2️⃣', '2 × 7 = ?', '14', 'Two groups of seven make fourteen.'],
    ],
  },
  {
    id: 'deck-colors',
    subject: 'art',
    title: 'Color Mixing',
    description: 'How colors combine',
    iconEmoji: '🎨',
    difficulty: 'Easy',
    cards: [
      ['🔴', 'Red + Yellow = ?', 'Orange', 'Mixing red and yellow paint makes orange.'],
      ['🔵', 'Blue + Yellow = ?', 'Green', 'Mixing blue and yellow paint makes green.'],
      ['🟣', 'Red + Blue = ?', 'Purple', 'Mixing red and blue paint makes purple.'],
      ['⚫', 'All colors mixed = ?', 'Brown/Black', 'Mixing many colors makes a dark muddy color.'],
      ['⚪', 'No color / paper = ?', 'White', 'White is the blank canvas color.'],
      ['🌈', 'How many colors in a rainbow?', '7', 'Red, orange, yellow, green, blue, indigo, violet.'],
    ],
  },
]

export const DECKS: Deck[] = SEEDS.map((s) => ({
  id: s.id,
  subject: s.subject,
  title: s.title,
  description: s.description,
  iconEmoji: s.iconEmoji,
  difficulty: s.difficulty,
  cards: s.cards.map(([emoji, front, back, details]) => card(s.id, emoji, front, back, details)),
}))

export const DECK_BY_ID = Object.fromEntries(DECKS.map((d) => [d.id, d])) as Record<string, Deck>
export const ALL_CARDS: Flashcard[] = DECKS.flatMap((d) => d.cards)
export const CARD_BY_ID = Object.fromEntries(ALL_CARDS.map((c) => [c.id, c])) as Record<string, Flashcard>
