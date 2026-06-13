import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export function BackButton({ to, label = 'Back' }: { to?: string; label?: string }) {
  const navigate = useNavigate()
  return (
    <button className="back-btn" onClick={() => (to ? navigate(to) : navigate(-1))}>
      <i className="fas fa-arrow-left" /> {label}
    </button>
  )
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {action}
    </div>
  )
}

const CONFETTI_COLORS = ['#6C5CE7', '#FF6B6B', '#FECA57', '#00D2D3', '#FF9F43', '#FF6B81', '#54A0FF', '#1DD1A1']

/** Confetti burst, matching the prototype's 40-particle effect. */
export function Confetti({ count = 40 }: { count?: number }) {
  return (
    <div className="confetti-container" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${(i / count) * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 10) * 0.05}s`,
            animationDuration: `${2 + (i % 5) * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}

export function EmptyState({ emoji, title, hint }: { emoji: string; title: string; hint?: string }) {
  return (
    <div className="empty-state">
      <div className="empty-emoji">{emoji}</div>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  )
}
