import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { Confetti } from '@/components/ui'
import { LESSONS_BY_SUBJECT } from '@/content/lessons'
import { SUBJECT_BY_ID } from '@/content/subjects'
import { pickBots, botAnswer, type BotTier } from '@/domain/bots'
import type { QuizQuestion, SubjectId } from '@/domain/types'

const LETTERS = ['A', 'B', 'C', 'D']
const Q_COUNT = 10
const Q_SECONDS = 15
const POS_COLORS = ['var(--color-accent-yellow)', '#C0C0C0', '#CD7F32', 'var(--color-text-muted)']

interface Player {
  id: string
  name: string
  avatar: string
  isYou: boolean
  bg: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function CompeteLive() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as { tier?: BotTier | 'mixed'; subject?: SubjectId }) ?? {}
  const tier = state.tier ?? 'rookie'
  const subjectId = state.subject ?? 'english'
  const subject = SUBJECT_BY_ID[subjectId]

  const user = useStore((s) => s.user)
  const finishMatch = useStore((s) => s.finishCompeteMatch)

  // Stable per-match setup.
  const bots = useMemo(() => pickBots(3, tier), [tier])
  const players: Player[] = useMemo(
    () => [
      { id: 'you', name: user.profile.name, avatar: user.profile.avatar, isYou: true, bg: '#FFF2E5' },
      ...bots.map((b, i) => ({ id: b.id, name: b.name, avatar: b.avatar, isYou: false, bg: ['#E0F8F8', '#FFE8E8', '#EDE7FF'][i] })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bots],
  )
  const questions: QuizQuestion[] = useMemo(() => {
    const all = LESSONS_BY_SUBJECT[subjectId].flatMap((l) => l.questions)
    const out = shuffle(all)
    while (out.length < Q_COUNT) out.push(...all)
    return out.slice(0, Q_COUNT)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  const [phase, setPhase] = useState<'matchmaking' | 'playing' | 'results'>('matchmaking')
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(Q_SECONDS)
  const [scores, setScores] = useState<number[]>(() => players.map(() => 0))
  const [playerCorrect, setPlayerCorrect] = useState(0)
  const [botCorrect, setBotCorrect] = useState<number[]>(() => bots.map(() => 0))
  const [combo, setCombo] = useState(0)

  const scoresRef = useRef(scores)
  scoresRef.current = scores
  const botTimers = useRef<number[]>([])
  const finishedRef = useRef(false)
  const placementRef = useRef(1)

  const q = questions[qIndex]

  // Matchmaking → playing.
  useEffect(() => {
    if (phase !== 'matchmaking') return
    const t = window.setTimeout(() => setPhase('playing'), 2600)
    return () => window.clearTimeout(t)
  }, [phase])

  // Schedule bot answers for the active question.
  useEffect(() => {
    if (phase !== 'playing' || !q) return
    botTimers.current.forEach((t) => window.clearTimeout(t))
    botTimers.current = []
    bots.forEach((bot, i) => {
      const res = botAnswer(bot)
      if (!res.correct) return
      const id = window.setTimeout(() => {
        const points = 100 + Math.max(0, Math.round((bot.maxMs - res.delayMs) / 100))
        const next = [...scoresRef.current]
        next[i + 1] += points
        setScores(next)
        setBotCorrect((bc) => {
          const copy = [...bc]
          copy[i] += 1
          return copy
        })
      }, Math.min(res.delayMs, (Q_SECONDS - 1) * 1000))
      botTimers.current.push(id)
    })
    return () => {
      botTimers.current.forEach((t) => window.clearTimeout(t))
      botTimers.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex])

  // Per-question countdown.
  useEffect(() => {
    if (phase !== 'playing' || answered) return
    if (timeLeft <= 0) {
      goNext()
      return
    }
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, answered, phase])

  function goNext() {
    botTimers.current.forEach((t) => window.clearTimeout(t))
    botTimers.current = []
    if (qIndex + 1 >= questions.length) {
      finish()
      return
    }
    setQIndex((i) => i + 1)
    setSelected(null)
    setAnswered(false)
    setTimeLeft(Q_SECONDS)
  }

  function answer(i: number) {
    if (answered || phase !== 'playing' || !q) return
    setSelected(i)
    setAnswered(true)
    if (i === q.correctIndex) {
      const points = 100 + timeLeft * 10 + combo * 10
      const next = [...scoresRef.current]
      next[0] += points
      setScores(next)
      setPlayerCorrect((c) => c + 1)
      setCombo((c) => c + 1)
    } else {
      setCombo(0)
    }
    window.setTimeout(goNext, 1200)
  }

  function finish() {
    if (finishedRef.current) return
    finishedRef.current = true
    const finalScores = scoresRef.current
    const sorted = players.map((p, i) => ({ p, score: finalScores[i] })).sort((a, b) => b.score - a.score)
    const placement = sorted.findIndex((s) => s.p.isYou) + 1
    placementRef.current = placement
    const perfect = playerCorrect === questions.length
    finishMatch(placement, perfect)
    setPhase('results')
  }

  // ---- Matchmaking screen ----
  if (phase === 'matchmaking') {
    return (
      <div className="matchmaking-screen" id="screen-matchmaking">
        <StatusBar />
        <div className="matchmaking-content">
          <div className="matchmaking-title">Finding Opponents...</div>
          <div className="matchmaking-sub">
            {subject.name} · {tier === 'mixed' ? 'Mixed Match' : `vs ${tier} bots`}
          </div>
        </div>
        <div className="players-preview">
          {players.map((p) => (
            <div className="player-slot" key={p.id}>
              <div className={`player-slot-avatar ${p.isYou ? 'you' : 'bot'}`} style={{ background: p.bg }}>
                {p.avatar}
              </div>
              <div className="player-slot-name">{p.name}</div>
              <span className={`player-slot-tag ${p.isYou ? 'tag-you' : 'tag-bot'}`}>{p.isYou ? 'YOU' : 'BOT'}</span>
            </div>
          ))}
        </div>
        <div className="matchmaking-countdown" onClick={() => setPhase('playing')} role="button">
          <div className="countdown-spinner" />
          <div className="countdown-text">Match starting...</div>
          <div className="countdown-sub">Tap to start now</div>
        </div>
        <div className="bottom-spacer" />
      </div>
    )
  }

  // ---- Results / podium ----
  if (phase === 'results') {
    const ranked = players
      .map((p, i) => ({ p, score: scores[i], correct: p.isYou ? playerCorrect : botCorrect[i - 1] ?? 0 }))
      .sort((a, b) => b.score - a.score)
    const podiumOrder = [ranked[1], ranked[0], ranked[2]] // 2nd, 1st, 3rd
    const blockClass = ['second', 'first', 'third']
    const placement = placementRef.current
    const reward =
      placement === 1 ? { coins: 100, xp: 200 } : placement === 2 ? { coins: 50, xp: 100 } : placement === 3 ? { coins: 25, xp: 50 } : { coins: 10, xp: 20 }
    return (
      <div className="podium-screen" id="screen-compete-results">
        <StatusBar />
        <Confetti />
        <div className="podium-header">
          <h1>Match Complete!</h1>
          <p>
            {subject.name} · {tier === 'mixed' ? 'Mixed Match' : `vs ${tier} bots`}
          </p>
        </div>

        <div className="podium-container">
          {podiumOrder.map((entry, i) =>
            entry ? (
              <div className="podium-place" key={entry.p.id}>
                <div className="podium-avatar-wrap">
                  {blockClass[i] === 'first' && <div className="podium-crown">👑</div>}
                  <div className="podium-avatar" style={{ background: entry.p.bg }}>
                    {entry.p.avatar}
                  </div>
                </div>
                <div className="podium-name">{entry.p.isYou ? `${entry.p.name} (You!)` : entry.p.name}</div>
                <div className="podium-score">{entry.score} pts</div>
                <div className={`podium-block ${blockClass[i]}`}>{i === 1 ? 1 : i === 0 ? 2 : 3}</div>
              </div>
            ) : null,
          )}
        </div>

        <div className="podium-results-card">
          <div className="podium-your-result">
            <div className="podium-your-place">
              You placed <strong>{placement === 1 ? '1st!' : placement === 2 ? '2nd!' : placement === 3 ? '3rd!' : '4th'}</strong>
            </div>
          </div>

          <div className="podium-rewards-row">
            <div className="podium-reward">
              <div className="pr-icon">🪙</div>
              <div className="pr-val">+{reward.coins}</div>
              <div className="pr-lbl">Coins</div>
            </div>
            <div className="podium-reward">
              <div className="pr-icon">⭐</div>
              <div className="pr-val">+{reward.xp}</div>
              <div className="pr-lbl">XP</div>
            </div>
            <div className="podium-reward">
              <div className="pr-icon">💎</div>
              <div className="pr-val">+{playerCorrect === questions.length ? 5 : 0}</div>
              <div className="pr-lbl">Gems</div>
            </div>
          </div>

          <div className="standings-list">
            {ranked.map((entry, i) => (
              <div className={`standing-item${entry.p.isYou ? ' me' : ''}`} key={entry.p.id}>
                <div className="standing-rank" style={{ color: POS_COLORS[i] }}>
                  {['👑', '🥈', '🥉'][i] ?? i + 1}
                </div>
                <div className="standing-avatar" style={{ background: entry.p.bg }}>
                  {entry.p.avatar}
                </div>
                <div className="standing-name">{entry.p.isYou ? `${entry.p.name} (You)` : entry.p.name}</div>
                <div className="standing-score">{entry.score}</div>
                <div className="standing-accuracy">{entry.correct}/{questions.length}</div>
              </div>
            ))}
          </div>

          <div className="podium-actions">
            <button className="btn-compete" onClick={() => navigate('/compete')}>
              Play Again
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
        <div className="bottom-spacer" style={{ height: 120 }} />
      </div>
    )
  }

  // ---- Live play ----
  const liveBoard = players
    .map((p, i) => ({ p, score: scores[i] }))
    .sort((a, b) => b.score - a.score)

  return (
    <div className="live-screen" id="screen-compete-live">
      <div className="live-header">
        <StatusBar />
        <div className="live-top-bar">
          <span className="live-q-num">
            Q {qIndex + 1}/{questions.length}
          </span>
          <div className="live-timer">
            <i className="fas fa-clock" /> 0:{String(timeLeft).padStart(2, '0')}
          </div>
          <span className="live-q-num" style={{ color: 'var(--color-accent-yellow)' }}>
            🔥 x{combo + 1}
          </span>
        </div>
      </div>

      <div className="live-scoreboard">
        {liveBoard.map((entry, i) => (
          <div className={`live-player${entry.p.isYou ? ' you-playing' : ''}`} key={entry.p.id}>
            <div className="live-player-pos" style={{ background: POS_COLORS[i] }}>
              {i + 1}
            </div>
            <div className="live-player-avatar" style={{ background: entry.p.bg }}>
              {entry.p.avatar}
            </div>
            <div className="live-player-name">{entry.p.name}</div>
            <div className="live-player-score">{entry.score}</div>
          </div>
        ))}
      </div>

      <div className="live-question">
        <div className="live-question-tag">
          {subject.name} · {q.type}
        </div>
        <div className="live-question-text">{q.prompt}</div>
      </div>

      <div className="compete-answers">
        {q.options.map((opt, i) => {
          let cls = 'compete-answer'
          if (answered) {
            if (i === q.correctIndex) cls += ' ca-correct'
            else if (i === selected) cls += ' ca-wrong'
          }
          return (
            <div key={i} className={cls} onClick={() => answer(i)} role="button">
              <span className="answer-badge">{LETTERS[i]}</span>
              {opt}
            </div>
          )
        })}
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
