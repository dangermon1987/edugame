import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import type { ArcadeGame } from '@/content/schema'

export function Arcade() {
  const navigate = useNavigate()
  const pushToast = useStore((s) => s.pushToast)
  const games = useContent((c) => c.arcadeGames)

  function open(game: ArcadeGame) {
    if (game.engine === 'memory') navigate('/memory')
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

      <SectionHeader title="All Games" action={<a>{games.length} games</a>} />
      <div className="game-list">
        {games.map((g) => (
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
