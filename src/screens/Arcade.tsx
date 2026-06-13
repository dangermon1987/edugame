import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'

interface Game {
  id: string
  icon: string
  bg: string
  title: string
  desc: string
  tags: Array<[label: string, bg: string, color: string]>
  badge?: 'POPULAR' | 'NEW'
  playable: boolean
}

const GAMES: Game[] = [
  { id: 'memory', icon: '🃏', bg: '#EDE7FF', title: 'Memory Match', desc: 'Find matching pairs of words & pictures!', tags: [['English', '#E0FFF5', 'var(--color-accent-mint)'], ['2-5 min', '#F0EEF8', 'var(--color-primary)']], badge: 'POPULAR', playable: true },
  { id: 'scramble', icon: '🔤', bg: '#FFE8E8', title: 'Word Scramble', desc: 'Unscramble the jumbled letters', tags: [['English', '#E0FFF5', 'var(--color-accent-mint)'], ['3 min', '#F0EEF8', 'var(--color-primary)']], playable: false },
  { id: 'bubbles', icon: '🫧', bg: '#E0F8F8', title: 'Math Bubbles', desc: 'Pop the bubble with the correct answer', tags: [['Math', '#FFE8E8', 'var(--color-secondary)'], ['2 min', '#F0EEF8', 'var(--color-primary)']], badge: 'NEW', playable: false },
  { id: 'spelling', icon: '🐝', bg: '#FFF2E5', title: 'Speed Spelling Bee', desc: 'Type the word you hear as fast as you can!', tags: [['English', '#E0FFF5', 'var(--color-accent-mint)'], ['5 min', '#F0EEF8', 'var(--color-primary)']], playable: false },
]

export function Arcade() {
  const navigate = useNavigate()
  const pushToast = useStore((s) => s.pushToast)

  function open(game: (typeof GAMES)[number]) {
    if (game.playable) navigate('/memory')
    else pushToast({ message: `${game.title} is coming soon!`, emoji: '🚧', kind: 'info' })
  }

  return (
    <div id="screen-arcade">
      <div className="arcade-header">
        <StatusBar />
        <div className="arcade-title-row">
          <h1>Arcade</h1>
        </div>
        <div className="arcade-subtitle">Fun mini-games to boost your brain!</div>
        <div className="arcade-tickets">
          <div className="arcade-ticket">🎟️ 5 tickets</div>
          <div className="arcade-ticket">🏅 Play & earn</div>
        </div>
      </div>

      <div style={{ padding: '16px 0 0' }}>
        <div className="daily-game-card" onClick={() => navigate('/memory')} role="button">
          <div className="daily-game-tag">🔥 Daily Challenge</div>
          <h3>Speed Memory Match</h3>
          <p>Find all pairs as fast as you can!</p>
          <div className="daily-game-reward">
            <span>🪙 +150</span> <span>💎 +5</span> <span>⭐ +100 XP</span>
          </div>
        </div>
      </div>

      <SectionHeader title="All Games" action={<a>{GAMES.length} games</a>} />
      <div className="game-list">
        {GAMES.map((g) => (
          <div className="game-card" key={g.id} onClick={() => open(g)} role="button">
            {g.badge && <div className={`game-card-badge ${g.badge === 'NEW' ? 'badge-new-game' : 'badge-popular'}`}>{g.badge}</div>}
            <div className="game-card-icon" style={{ background: g.bg }}>
              {g.icon}
            </div>
            <div className="game-card-info">
              <h3>{g.title}</h3>
              <p>{g.desc}</p>
              <div className="game-card-meta">
                {g.tags.map(([label, bg, color]) => (
                  <span className="game-meta-tag" key={label} style={{ background: bg, color }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <i className="fas fa-chevron-right game-card-arrow" />
          </div>
        ))}
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
