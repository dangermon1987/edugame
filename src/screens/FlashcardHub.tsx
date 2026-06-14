import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { isDue } from '@/domain/sm2'
import { bgFor, subjectVar } from '@/lib/subjectColor'
import { useT } from '@/i18n'
import type { SubjectId } from '@/domain/types'

export function FlashcardHub() {
  const t = useT()
  const navigate = useNavigate()
  const cardProgress = useStore((s) => s.user.cardProgress)
  const streak = useStore((s) => s.user.streak.count)
  const allDecks = useContent((c) => c.decks)
  const subjects = useContent((c) => c.subjects)
  const subjectById = useContent((c) => c.subjectById)
  const [filter, setFilter] = useState<SubjectId | 'all'>('all')

  const now = Date.now()
  const allCards = allDecks.flatMap((d) => d.cards)
  const masteredCount = allCards.filter((c) => cardProgress[c.id]?.status === 'mastered').length
  const dueCount = allCards.filter((c) => isDue(cardProgress[c.id], now)).length

  const decks = filter === 'all' ? allDecks : allDecks.filter((d) => d.subject === filter)

  return (
    <div id="screen-flash-hub">
      <div className="flash-hub-header">
        <div className="flash-hub-title-row">
          <h1>{t.flashcards.title}</h1>
        </div>
        <div className="flash-hub-stats">
          <div className="flash-hub-stat">📇 {t.flashcards.cards(allCards.length)}</div>
          <div className="flash-hub-stat">🧠 {t.flashcards.mastered(masteredCount)}</div>
          <div className="flash-hub-stat">🔥 {t.flashcards.streak(streak)}</div>
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
            <h3>{t.flashcards.dailyReview}</h3>
            <p>{dueCount > 0 ? t.flashcards.cardsDue(dueCount) : t.flashcards.allCaught}</p>
          </div>
          {dueCount > 0 && <div className="daily-review-badge">{dueCount} {t.flashcards.due}</div>}
        </div>
      </div>

      <div className="subject-tabs">
        <button className={`subject-tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
          {t.flashcards.all}
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            className={`subject-tab${filter === s.id ? ' active' : ''}`}
            onClick={() => setFilter(s.id)}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      <SectionHeader title={t.flashcards.myDecks} />
      <div className="deck-grid">
        {decks.map((deck) => {
          const mastered = deck.cards.filter((c) => cardProgress[c.id]?.status === 'mastered').length
          const percent = Math.round((mastered / deck.cards.length) * 100)
          const started = deck.cards.some((c) => cardProgress[c.id])
          const color = subjectById[deck.subject]?.colorClass
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
                style={{ background: bgFor(color), color: subjectVar(color ?? 'english') }}
              >
                {deck.iconEmoji}
              </div>
              <h3>{deck.title}</h3>
              <p>{deck.description}</p>
              <div className="deck-progress">
                <div
                  className="deck-progress-fill"
                  style={{ width: `${percent}%`, background: subjectVar(color ?? 'english') }}
                />
              </div>
              <div className="deck-meta">
                <span>{t.flashcards.cardsCount(deck.cards.length)}</span>
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
