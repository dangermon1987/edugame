import { useNavigate } from 'react-router-dom'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'

const ACTIVITIES = [
  { emoji: '🏆', title: 'Compete', desc: 'Live quiz battles', to: '/compete', color: 'var(--color-primary)' },
  { emoji: '🗂️', title: 'Flashcards', desc: 'Quick review', to: '/flashcards', color: 'var(--color-accent-green)' },
  { emoji: '🧠', title: 'Memory Match', desc: 'Find the pairs', to: '/memory', color: 'var(--color-accent-pink)' },
  { emoji: '🐉', title: 'My Pet', desc: 'Feed & play', to: '/pet', color: 'var(--color-accent-orange)' },
  { emoji: '🗺️', title: 'Adventure Map', desc: 'Explore islands', to: '/map', color: 'var(--color-accent-blue)' },
  { emoji: '🎨', title: 'Themes', desc: 'Customize your app', to: '/themes', color: 'var(--color-accent-mint)' },
  { emoji: '✨', title: 'Stickers', desc: 'Your collection', to: '/stickers', color: 'var(--color-accent-yellow)' },
  { emoji: '🛠️', title: 'Workshop', desc: 'Make your own quiz', to: '/workshop', color: 'var(--color-secondary)' },
]

export function Play() {
  const navigate = useNavigate()
  return (
    <div id="screen-play">
      <StatusBar dark />
      <div style={{ padding: '8px 20px 0' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900 }}>Play 🎮</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Games, pets & creative fun</p>
      </div>

      <SectionHeader title="Activities" />
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
