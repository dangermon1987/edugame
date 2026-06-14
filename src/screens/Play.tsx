import { useNavigate } from 'react-router-dom'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { useT } from '@/i18n'

const META = [
  { emoji: '🏆', to: '/compete', color: 'var(--color-primary)' },
  { emoji: '🗂️', to: '/flashcards', color: 'var(--color-accent-green)' },
  { emoji: '🧠', to: '/memory', color: 'var(--color-accent-pink)' },
  { emoji: '🐉', to: '/pet', color: 'var(--color-accent-orange)' },
  { emoji: '🗺️', to: '/map', color: 'var(--color-accent-blue)' },
  { emoji: '🎨', to: '/themes', color: 'var(--color-accent-mint)' },
  { emoji: '✨', to: '/stickers', color: 'var(--color-accent-yellow)' },
  { emoji: '🛠️', to: '/workshop', color: 'var(--color-secondary)' },
]

export function Play() {
  const navigate = useNavigate()
  const t = useT()
  const ACTIVITIES = META.map((m, i) => ({ ...m, title: t.play.tiles[i][0], desc: t.play.tiles[i][1] }))
  return (
    <div id="screen-play">
      <StatusBar dark />
      <div style={{ padding: '8px 20px 0' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900 }}>{t.play.title} 🎮</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>{t.play.subtitle}</p>
      </div>

      <SectionHeader title={t.play.activities} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '0 16px',
        }}
      >
        {ACTIVITIES.map((a) => (
          <div
            key={a.to}
            onClick={() => navigate(a.to)}
            role="button"
            className="is-clickable"
            style={{
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: 18,
              boxShadow: 'var(--shadow-sm)',
              borderTop: `4px solid ${a.color}`,
            }}
          >
            <div style={{ fontSize: 36 }}>{a.emoji}</div>
            <h4 style={{ fontSize: 'var(--font-size-md)', marginTop: 6 }}>{a.title}</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{a.desc}</p>
          </div>
        ))}
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
