import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { DECKS } from '@/content/decks'
import { SUBJECTS } from '@/content/subjects'
import { isDue } from '@/domain/sm2'
import type { SubjectId } from '@/domain/types'

const SUBJECT_BG: Record<SubjectId, string> = {
  english: '#EDE7FF',
  math: '#FFE8E8',
  science: '#E0F8F8',
  art: '#FFF2E5',
}

export function FlashcardHub() {
  const navigate = useNavigate()
  const cardProgress = useStore((s) => s.user.cardProgress)
  const streak = useStore((s) => s.user.streak.count)
  const [filter, setFilter] = useState<SubjectId | 'all'>('all')

  const now = Date.now()
  const allCards = DECKS.flatMap((d) => d.cards)
  const masteredCount = allCards.filter((c) => cardProgress[c.id]?.status === 'mastered').length
  const dueCount = allCards.filter((c) => isDue(cardProgress[c.id], now)).length

  const decks = filter === 'all' ? DECKS : DECKS.filter((d) => d.subject === filter)

  return (
    <div id="screen-flash-hub">
      <div className="flash-hub-header">
        <StatusBar />
        <div className="flash-hub-title-row">
          <h1>Flashcards</h1>
        </div>
        <div className="flash-hub-stats">
          <div className="flash-hub-stat">📇 {allCards.length} cards</div>
          <div className="flash-hub-stat">🧠 {masteredCount} mastered</div>
          <div className="flash-hub-stat">🔥 {streak} streak</div>
        </div>
      </div>

      <div style={{ paddingTop: 16 }}>
        <div
          className={`daily-review-card${dueCount === 0 ? ' is-disabled' : ''}`}
          onClick={() => dueCount > 0 && navigate('/flashcards/due/study')}
          role="button"
        >
          <div className="daily-review-icon">🧠</div>
          <div className="daily-review-info">
            <h3>Daily Review</h3>
            <p>{dueCount > 0 ? `${dueCount} cards due for review today` : 'All caught up! 🎉'}</p>
          </div>
          {dueCount > 0 && <div className="daily-review-badge">{dueCount} DUE</div>}
        </div>
      </div>

      <div className="subject-tabs">
        <button className={`subject-tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            className={`subject-tab${filter === s.id ? ' active' : ''}`}
            onClick={() => setFilter(s.id)}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      <SectionHeader title="My Decks" />
      <div className="deck-grid">
        {decks.map((deck) => {
          const mastered = deck.cards.filter((c) => cardProgress[c.id]?.status === 'mastered').length
          const percent = Math.round((mastered / deck.cards.length) * 100)
          const started = deck.cards.some((c) => cardProgress[c.id])
          return (
            <div
              key={deck.id}
              className="deck-card"
              onClick={() => navigate(`/flashcards/${deck.id}/study`)}
              role="button"
            >
              {percent === 100 && <span className="deck-badge badge-mastered">MASTERED</span>}
              {!started && <span className="deck-badge badge-new">NEW</span>}
              <div
                className="deck-emoji"
                style={{ background: SUBJECT_BG[deck.subject], color: `var(--color-${deck.subject})` }}
              >
                {deck.iconEmoji}
              </div>
              <h3>{deck.title}</h3>
              <p>{deck.description}</p>
              <div className="deck-progress">
                <div
                  className="deck-progress-fill"
                  style={{ width: `${percent}%`, background: `var(--color-${deck.subject})` }}
                />
              </div>
              <div className="deck-meta">
                <span>{deck.cards.length} cards</span>
                <span style={percent === 100 ? { color: 'var(--color-accent-mint)' } : undefined}>{percent}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
