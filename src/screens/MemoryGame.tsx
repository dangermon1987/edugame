import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { Confetti } from '@/components/ui'
import { useT } from '@/i18n'

const EMOJIS = ['🦁', '🐸', '🦋', '🌈', '🚀', '🍎', '⭐', '🎈']

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

function newBoard(): Card[] {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, id) => ({ id, emoji, flipped: false, matched: false }))
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function MemoryGame() {
  const navigate = useNavigate()
  const t = useT()
  const addRewards = useStore((s) => s.addRewards)
  const registerStudyMinutes = useStore((s) => s.registerStudyMinutes)

  const [cards, setCards] = useState<Card[]>(newBoard)
  const [picked, setPicked] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [won, setWon] = useState(false)
  const lock = useRef(false)
  const rewardedRef = useRef(false)

  const matchedCount = cards.filter((c) => c.matched).length
  const score = Math.max(0, matchedCount * 50 - moves * 5)

  useEffect(() => {
    if (won) return
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [won])

  useEffect(() => {
    if (matchedCount === cards.length && !rewardedRef.current) {
      rewardedRef.current = true
      setWon(true)
      addRewards({ coins: 150, xp: 100, gems: 5 })
      registerStudyMinutes(3)
    }
  }, [matchedCount, cards.length, addRewards, registerStudyMinutes])

  function flip(idx: number) {
    if (lock.current || cards[idx].flipped || cards[idx].matched) return
    const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c))
    const nowPicked = [...picked, idx]
    setCards(next)
    setPicked(nowPicked)

    if (nowPicked.length === 2) {
      setMoves((m) => m + 1)
      lock.current = true
      const [a, b] = nowPicked
      if (next[a].emoji === next[b].emoji) {
        window.setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)))
          setPicked([])
          lock.current = false
        }, 350)
      } else {
        window.setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)))
          setPicked([])
          lock.current = false
        }, 800)
      }
    }
  }

  function reset() {
    setCards(newBoard())
    setPicked([])
    setMoves(0)
    setSeconds(0)
    setWon(false)
    rewardedRef.current = false
    lock.current = false
  }

  const mm = Math.floor(seconds / 60)
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="memory-game-screen" id="screen-memory">
      <div className="memory-header">
        <div className="memory-top-bar">
          <button className="memory-close" onClick={() => navigate('/arcade')} aria-label="Close">
            <i className="fas fa-times" />
          </button>
          <div className="memory-stats">
            <div className="memory-stat" style={{ color: 'var(--color-accent-yellow)' }}>
              ⭐ {score}
            </div>
            <div className="memory-stat" style={{ color: 'white' }}>
              🔄 {moves} {t.memory.moves}
            </div>
            <div className="memory-stat" style={{ color: 'white' }}>
              <i className="fas fa-clock" /> {mm}:{ss}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: 'white', padding: '0 20px 12px', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
        {t.memory.instruction}
      </div>

      <div className="memory-grid" id="memoryGrid">
        {cards.map((c, i) => (
          <div
            key={c.id}
            className={`memory-card${c.flipped || c.matched ? ' flipped' : ''}${c.matched ? ' matched' : ''}`}
            onClick={() => flip(i)}
            role="button"
            aria-label={c.flipped || c.matched ? c.emoji : 'hidden card'}
          >
            <div className="memory-card-face memory-card-back">
              <span className="card-pattern">❓</span>
            </div>
            <div className="memory-card-face memory-card-front">{c.emoji}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: 20 }}>
        <button className="btn-primary" onClick={reset} style={{ width: 'auto', padding: '12px 32px' }}>
          <i className="fas fa-redo" /> {t.memory.newGame}
        </button>
      </div>

      {won && (
        <>
          <Confetti />
          <div className="score-popup show" data-testid="memory-win">
            <div className="score-emoji">🏆</div>
            <h2>{t.memory.win}</h2>
            <p>
              {t.memory.cleared(moves, `${mm}:${ss}`)}
            </p>
            <div className="score-rewards">
              <div className="score-reward-item">
                <div className="icon">🪙</div>
                <div className="value">+150</div>
                <div className="label">{t.common.coins}</div>
              </div>
              <div className="score-reward-item">
                <div className="icon">⭐</div>
                <div className="value">+100</div>
                <div className="label">{t.common.xp}</div>
              </div>
              <div className="score-reward-item">
                <div className="icon">💎</div>
                <div className="value">+5</div>
                <div className="label">{t.common.gems}</div>
              </div>
            </div>
            <button className="btn-primary" onClick={reset}>
              {t.memory.playAgain}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
