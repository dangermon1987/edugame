import type { ShopItem } from '@/domain/types'

export const SHOP_ITEMS: ShopItem[] = [
  // Avatars
  { id: 'av-lion', category: 'avatars', name: 'Lion King', preview: '🦁', price: 500, currency: 'coins', rarity: 'new', payload: '🦁' },
  { id: 'av-unicorn', category: 'avatars', name: 'Unicorn Magic', preview: '🦄', price: 15, currency: 'gems', rarity: 'rare', payload: '🦄' },
  { id: 'av-dragon', category: 'avatars', name: 'Baby Dragon', preview: '🐉', price: 800, currency: 'coins', rarity: 'hot', payload: '🐉' },
  { id: 'av-cat', category: 'avatars', name: 'Cool Cat', preview: '😺', price: 350, currency: 'coins', payload: '😺' },
  { id: 'av-robot', category: 'avatars', name: 'Robo Buddy', preview: '🤖', price: 20, currency: 'gems', rarity: 'rare', payload: '🤖' },
  { id: 'av-wizard', category: 'avatars', name: 'Wizard', preview: '🧙', price: 600, currency: 'coins', rarity: 'new', payload: '🧙' },
  { id: 'av-panda', category: 'avatars', name: 'Panda Pal', preview: '🐼', price: 400, currency: 'coins', payload: '🐼' },
  { id: 'av-owl', category: 'avatars', name: 'Wise Owl', preview: '🦉', price: 450, currency: 'coins', payload: '🦉' },

  // Themes (payload = data-theme value, applied to settings)
  { id: 'th-ocean', category: 'themes', name: 'Ocean Blue', preview: '🌊', price: 300, currency: 'coins', payload: 'ocean' },
  { id: 'th-forest', category: 'themes', name: 'Forest Green', preview: '🌲', price: 300, currency: 'coins', payload: 'forest' },
  { id: 'th-sunset', category: 'themes', name: 'Sunset', preview: '🌅', price: 400, currency: 'coins', rarity: 'hot', payload: 'sunset' },
  { id: 'th-candy', category: 'themes', name: 'Candy Pop', preview: '🍭', price: 10, currency: 'gems', rarity: 'rare', payload: 'candy' },
  { id: 'th-midnight', category: 'themes', name: 'Midnight', preview: '🌙', price: 18, currency: 'gems', rarity: 'rare', payload: 'midnight' },

  // Pets
  { id: 'pet-dog', category: 'pets', name: 'Puppy', preview: '🐶', price: 700, currency: 'coins', rarity: 'new', payload: '🐶' },
  { id: 'pet-fox', category: 'pets', name: 'Fox Kit', preview: '🦊', price: 25, currency: 'gems', rarity: 'rare', payload: '🦊' },
  { id: 'pet-dino', category: 'pets', name: 'Dino', preview: '🦕', price: 30, currency: 'gems', rarity: 'rare', payload: '🦕' },
  { id: 'pet-bunny', category: 'pets', name: 'Bunny', preview: '🐰', price: 550, currency: 'coins', payload: '🐰' },

  // Power-ups
  { id: 'pu-freeze', category: 'powerups', name: 'Streak Freeze', preview: '🧊', price: 200, currency: 'coins', payload: 'freeze' },
  { id: 'pu-hint', category: 'powerups', name: 'Hint Pack', preview: '💡', price: 150, currency: 'coins', payload: 'hint' },
  { id: 'pu-double', category: 'powerups', name: 'Double XP', preview: '⚡', price: 12, currency: 'gems', rarity: 'hot', payload: 'double' },
  { id: 'pu-heart', category: 'powerups', name: 'Extra Heart', preview: '❤️', price: 250, currency: 'coins', payload: 'heart' },
]

export const SHOP_BY_ID = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i])) as Record<string, ShopItem>
