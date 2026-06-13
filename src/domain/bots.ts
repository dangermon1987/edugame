/** AI opponents for Compete Mode (spec §2.3). */

export type BotTier = 'rookie' | 'challenger' | 'champion'

export interface Bot {
  id: string
  name: string
  avatar: string
  tier: BotTier
  /** Probability of answering a question correctly. */
  accuracy: number
  /** Answer-time window in ms (lower = faster). */
  minMs: number
  maxMs: number
}

export const BOTS: Bot[] = [
  { id: 'bot-pip', name: 'Pip', avatar: '🐣', tier: 'rookie', accuracy: 0.55, minMs: 5000, maxMs: 11000 },
  { id: 'bot-mango', name: 'Mango', avatar: '🦜', tier: 'rookie', accuracy: 0.6, minMs: 4500, maxMs: 10000 },
  { id: 'bot-zip', name: 'Zip', avatar: '🦊', tier: 'challenger', accuracy: 0.72, minMs: 3000, maxMs: 7000 },
  { id: 'bot-luna', name: 'Luna', avatar: '🦉', tier: 'challenger', accuracy: 0.78, minMs: 2800, maxMs: 6500 },
  { id: 'bot-rex', name: 'Rex', avatar: '🐲', tier: 'champion', accuracy: 0.9, minMs: 1500, maxMs: 4000 },
  { id: 'bot-nova', name: 'Nova', avatar: '🚀', tier: 'champion', accuracy: 0.93, minMs: 1200, maxMs: 3500 },
]

export interface BotAnswer {
  correct: boolean
  delayMs: number
}

/** Simulates how a bot tackles one question. `rng` defaults to Math.random. */
export function botAnswer(bot: Bot, rng: () => number = Math.random): BotAnswer {
  const correct = rng() < bot.accuracy
  const delayMs = Math.round(bot.minMs + rng() * (bot.maxMs - bot.minMs))
  return { correct, delayMs }
}

/** Pick `n` bots, preferring the requested tier, padding from others. */
export function pickBots(n: number, tier: BotTier | 'mixed', rng: () => number = Math.random): Bot[] {
  const pool = tier === 'mixed' ? [...BOTS] : BOTS.filter((b) => b.tier === tier)
  const fallback = [...BOTS]
  const chosen: Bot[] = []
  const take = (arr: Bot[]) => {
    while (chosen.length < n && arr.length) {
      const i = Math.floor(rng() * arr.length)
      chosen.push(arr.splice(i, 1)[0])
    }
  }
  take([...pool])
  take(fallback.filter((b) => !chosen.includes(b)))
  return chosen.slice(0, n)
}
