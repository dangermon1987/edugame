export type StickerRarity = 'common' | 'rare' | 'epic' | 'shiny'

export interface Sticker {
  id: string
  name: string
  emoji: string
  rarity: StickerRarity
  collection: string
}

export const STICKERS: Sticker[] = [
  { id: 'st-lion', name: 'Lion King', emoji: '🦁', rarity: 'shiny', collection: 'Animals' },
  { id: 'st-book', name: 'Bookworm', emoji: '📖', rarity: 'common', collection: 'English' },
  { id: 'st-rainbow', name: 'Rainbow', emoji: '🌈', rarity: 'rare', collection: 'Art' },
  { id: 'st-butterfly', name: 'Butterfly', emoji: '🦋', rarity: 'shiny', collection: 'Animals' },
  { id: 'st-sunflower', name: 'Sunflower', emoji: '🌻', rarity: 'common', collection: 'Science' },
  { id: 'st-castle', name: 'Castle', emoji: '🏰', rarity: 'epic', collection: 'Adventure' },
  { id: 'st-rocket', name: 'Rocket', emoji: '🚀', rarity: 'epic', collection: 'Science' },
  { id: 'st-star', name: 'Gold Star', emoji: '⭐', rarity: 'common', collection: 'Rewards' },
  { id: 'st-numbers', name: 'Numbers', emoji: '🔢', rarity: 'common', collection: 'Math' },
  { id: 'st-abacus', name: 'Abacus', emoji: '🧮', rarity: 'shiny', collection: 'Math' },
  { id: 'st-geometry', name: 'Geometry', emoji: '📐', rarity: 'rare', collection: 'Math' },
  { id: 'st-dice', name: 'Lucky Dice', emoji: '🎲', rarity: 'common', collection: 'Math' },
  { id: 'st-clock', name: 'Clock', emoji: '⏰', rarity: 'common', collection: 'Math' },
  { id: 'st-money', name: 'Money', emoji: '💰', rarity: 'rare', collection: 'Math' },
  { id: 'st-unicorn', name: 'Unicorn', emoji: '🦄', rarity: 'shiny', collection: 'Rewards' },
  { id: 'st-crown', name: 'Crown', emoji: '👑', rarity: 'epic', collection: 'Rewards' },
]

export const RARITY_LABEL: Record<StickerRarity, string> = {
  common: '⬜ Common',
  rare: '🟦 Rare',
  epic: '🟪 Epic',
  shiny: '🌟 Shiny',
}
