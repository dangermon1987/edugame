import type { Theme } from '@/domain/types'

/** id '' is the built-in default and is always available. */
export const THEMES: Theme[] = [
  { id: '', name: 'EduQuest Purple', emoji: '💜', description: 'The classic look', swatch: ['#6C5CE7', '#A29BFE', '#FECA57'] },
  { id: 'ocean', name: 'Ocean Blue', emoji: '🌊', description: 'Cool and calm', swatch: ['#2e86de', '#54a0ff', '#1dd1a1'] },
  { id: 'forest', name: 'Forest Green', emoji: '🌲', description: 'Fresh and natural', swatch: ['#10ac84', '#1dd1a1', '#feca57'] },
  { id: 'sunset', name: 'Sunset', emoji: '🌅', description: 'Warm and bright', swatch: ['#ee5a24', '#ff9f43', '#feca57'] },
  { id: 'candy', name: 'Candy Pop', emoji: '🍭', description: 'Sweet and fun', swatch: ['#ff6b81', '#ff9ff3', '#feca57'] },
  { id: 'midnight', name: 'Midnight', emoji: '🌙', description: 'Dark mode magic', swatch: ['#5f27cd', '#a29bfe', '#feca57'] },
]

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<string, Theme>
