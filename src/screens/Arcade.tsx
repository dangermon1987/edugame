import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'
import type { ArcadeGame } from '@/content/schema'

export function Arcade() {
  const navigate = useNavigate()
  const t = useT()
  const pushToast = useStore((s) => s.pushToast)
  const games = useContent((c) => c.arcadeGames)

  function open(game: ArcadeGame) {
    if (game.engine === 'memory') navigate('/memory')
    else pushToast({ message: t.arcade.comingSoon(game.title), emoji: '🚧', kind: 'info' })
  }

  return (
    <div id="screen-arcade">
      <div className="arcade-header">
        <div className="arcade-title-row">
          <h1>{t.arcade.title}</h1>
        </div>
        <div className="arcade-subtitle">{t.arcade.subtitle}</div>
        <div className="arcade-tickets">
          <div className="arcade-ticket">🎟️ 5 {t.arcade.tickets}</div>
          <div className="arcade-ticket">🏅 {t.arcade.playEarn}</div>
        </div>
      </div>

      <div style={{ padding: '16px 0 0' }}>
        <div className="daily-game-card" onClick={() => navigate('/memory')} role="button">
          <div className="daily-game-tag">🔥 {t.arcade.dailyChallenge}</div>
          <h3>{t.play.tiles[2][0]}</h3>
          <p>{t.memory.instruction}</p>
          <div className="daily-game-reward">
            <span>🪙 +150</span> <span>💎 +5</span> <span>⭐ +100 XP</span>
          </div>
        </div>
      </div>

      <SectionHeader title={t.arcade.allGames} action={<a>{t.arcade.games(games.length)}</a>} />
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
