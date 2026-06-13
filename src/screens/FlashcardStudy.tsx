import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { Confetti } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { isDue } from '@/domain/sm2'
import type { Flashcard } from '@/domain/types'

export function FlashcardStudy() {
  const navigate = useNavigate()
  const { deckId } = useParams<{ deckId: string }>()
  const reviewFlashcard = useStore((s) => s.reviewFlashcard)
  const addRewards = useStore((s) => s.addRewards)
  const cardProgress = useStore((s) => s.user.cardProgress)
  const registerStudyMinutes = useStore((s) => s.registerStudyMinutes)
  const decks = useContent((c) => c.decks)
  const deckById = useContent((c) => c.deckById)
  const subjectById = useContent((c) => c.subjectById)

  // Build the session queue once. (cardProgress read lazily via initial state.)
  const progressAtStart = useRef(cardProgress)
  const queue: Flashcard[] = useMemo(() => {
    if (deckId === 'due') {
      const now = Date.now()
      return decks.flatMap((d) => d.cards).filter((c) => isDue(progressAtStart.current[c.id], now))
    }
    return deckId ? (deckById[deckId]?.cards ?? []) : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId])

  const deck = deckId && deckId !== 'due' ? deckById[deckId] : undefined
  const subjectName = deck ? subjectById[deck.subject]?.name ?? 'Review' : 'Review'

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [gotIt, setGotIt] = useState(0)
  const [learning, setLearning] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [finished, setFinished] = useState(false)
  const finishedRef = useRef(false)

  const card = queue[index]

  function finish(finalGotIt: number) {
    if (finishedRef.current) return
    finishedRef.current = true
    const total = queue.length
    const perfect = finalGotIt === total && total > 0
    const coins = 25 + finalGotIt * 5
    const xp = 50 + finalGotIt * 10 + (perfect ? 100 : 0)
    const gems = perfect ? 5 : 0
    addRewards({ coins, xp, gems })
    registerStudyMinutes(Math.max(2, Math.round(total / 2)))
    setFinished(true)
  }

  function act(kind: 'gotit' | 'learning') {
    if (!card || finished) return
    reviewFlashcard(card.id, kind === 'gotit' ? 5 : 2)
    const nextGot = gotIt + (kind === 'gotit' ? 1 : 0)
    if (kind === 'gotit') {
      const c = combo + 1
      setCombo(c)
      setBestCombo((b) => Math.max(b, c))
      setGotIt(nextGot)
    } else {
      setCombo(0)
      setLearning((l) => l + 1)
    }
    setFlipped(false)
    if (index + 1 >= queue.length) {
      finish(nextGot)
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (queue.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <h2>Nothing to review!</h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 20px' }}>You're all caught up.</p>
        <button className="btn-primary" onClick={() => navigate('/flashcards')}>
          Back to Decks
        </button>
      </div>
    )
  }

  if (finished) {
    const total = queue.length
    const accuracy = Math.round((gotIt / total) * 100)
    const coins = 25 + gotIt * 5
    const xp = 50 + gotIt * 10 + (gotIt === total ? 100 : 0)
    const gems = gotIt === total ? 5 : 0
    return (
      <div className="results-screen" id="screen-flash-results">
        <StatusBar dark />
        <Confetti />
        <div className="results-celebration">
          <div className="results-emoji">🎉</div>
          <h1>Great Session!</h1>
          <p>You reviewed {total} flashcards</p>
        </div>

        <div className="results-stats-grid">
          <div className="result-stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value" style={{ color: 'var(--color-accent-mint)' }}>
              {gotIt}
            </div>
            <div className="stat-label">Got It</div>
          </div>
          <div className="result-stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-value" style={{ color: 'var(--color-accent-orange)' }}>
              {learning}
            </div>
            <div className="stat-label">Still Learning</div>
          </div>
          <div className="result-stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {accuracy}%
            </div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="result-stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value" style={{ color: 'var(--color-accent-yellow)' }}>
              x{bestCombo || 1}
            </div>
            <div className="stat-label">Best Combo</div>
          </div>
        </div>

        <div className="results-rewards">
          <h3>Rewards Earned</h3>
          <div className="rewards-row">
            <div className="reward-item">
              <div className="icon">🪙</div>
              <div className="value">+{coins}</div>
              <div className="label">Coins</div>
            </div>
            <div className="reward-item">
              <div className="icon">⭐</div>
              <div className="value">+{xp}</div>
              <div className="label">XP</div>
            </div>
            <div className="reward-item">
              <div className="icon">💎</div>
              <div className="value">+{gems}</div>
              <div className="label">Gems</div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn-primary" onClick={() => navigate('/flashcards')}>
            Back to Decks
          </button>
        </div>
        <div className="bottom-spacer" />
      </div>
    )
  }

  return (
    <div className="study-screen" id="screen-flash-study">
      <div className="study-header">
        <StatusBar />
        <div className="study-top-bar">
          <button className="study-close" onClick={() => navigate('/flashcards')} aria-label="Close">
            <i className="fas fa-times" />
          </button>
          <div className="study-progress-wrapper">
            <div className="study-progress-track">
              <div className="study-progress-fill" style={{ width: `${(index / queue.length) * 100}%` }} />
            </div>
          </div>
          <span className="study-count">
            {index + 1}/{queue.length}
          </span>
        </div>
        <div className="study-stats-bar">
          <div className="study-stat" style={{ color: 'var(--color-accent-mint)' }}>
            ✅ {gotIt} Got it
          </div>
          <div className="study-stat" style={{ color: 'var(--color-accent-orange)' }}>
            🔄 {learning} Learning
          </div>
        </div>
      </div>

      <div className="flashcard-body">
        <div
          className={`flashcard-container${flipped ? ' flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
          role="button"
          data-testid="flashcard"
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-media">
                <span className="media-icon">{card.frontEmoji}</span>
              </div>
              <div className="card-prompt-tag">{subjectName}</div>
              <div className="card-prompt">{card.frontText}</div>
              <div className="card-tap-hint">
                <i className="fas fa-hand-pointer" /> Tap to flip
              </div>
            </div>
            <div className="flashcard-back">
              <div className="back-answer">{card.backContent}</div>
              <div className="back-definition">{card.backDetails}</div>
            </div>
          </div>
        </div>

        <div className="swipe-actions">
          <button className="swipe-btn learning" onClick={() => act('learning')}>
            <i className="fas fa-rotate-right" /> Still Learning
          </button>
          <button className="swipe-btn got-it" onClick={() => act('gotit')}>
            <i className="fas fa-check" /> Got It!
          </button>
        </div>
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
