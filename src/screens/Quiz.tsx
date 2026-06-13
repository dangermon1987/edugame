import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, type RewardBundle } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { Confetti } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { comboMultiplier } from '@/domain/combo'
import type { QuizQuestion } from '@/domain/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const SECONDS_PER_Q = 30
const MAX_HEARTS = 3

export function Quiz() {
  const navigate = useNavigate()
  const { lessonId } = useParams<{ lessonId: string }>()
  const completeLesson = useStore((s) => s.completeLesson)
  const registerStudyMinutes = useStore((s) => s.registerStudyMinutes)

  const lessonById = useContent((c) => c.lessonById)
  const lesson = lessonId ? lessonById[lessonId] : undefined
  const custom = useStore((s) => (lessonId ? s.user.customQuizzes[lessonId] : undefined))
  const questions: QuizQuestion[] = lesson?.questions ?? custom?.questions ?? []

  const [index, setIndex] = useState(0)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [combo, setCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_Q)
  const [finished, setFinished] = useState(false)
  const [reward, setReward] = useState<RewardBundle | null>(null)
  const finishedRef = useRef(false)

  const q = questions[index]
  const backTo = lesson ? `/subject/${lesson.subjectId}` : '/play'

  function finish(correct: number) {
    if (finishedRef.current) return
    finishedRef.current = true
    if (lessonId && (lesson || custom)) {
      const r = completeLesson(lessonId, { correct, total: questions.length })
      registerStudyMinutes(Math.max(2, Math.round((lesson?.estMinutes ?? 5) / 3)))
      setReward(r)
    }
    setFinished(true)
  }

  function advance(nextCorrect: number, nextHearts: number) {
    if (nextHearts <= 0 || index + 1 >= questions.length) {
      finish(nextCorrect)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setAnswered(false)
    setTimeLeft(SECONDS_PER_Q)
  }

  function handleSelect(i: number) {
    if (answered || finished || !q) return
    const isCorrect = i === q.correctIndex
    setSelected(i)
    setAnswered(true)
    const nextCorrect = correctCount + (isCorrect ? 1 : 0)
    const nextHearts = hearts - (isCorrect ? 0 : 1)
    if (isCorrect) setCombo((c) => c + 1)
    else setCombo(0)
    setCorrectCount(nextCorrect)
    setHearts(nextHearts)
    window.setTimeout(() => advance(nextCorrect, nextHearts), 900)
  }

  // Per-question countdown.
  useEffect(() => {
    if (answered || finished || !q) return
    if (timeLeft <= 0) {
      handleSelect(-1) // time out counts as a wrong answer
      return
    }
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, answered, finished, q])

  if (!q && !finished) {
    return (
      <div style={{ padding: 24 }}>
        <p>Quiz not found.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    )
  }

  const multiplier = comboMultiplier(combo)
  const mm = Math.floor(timeLeft / 60)
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="quiz-screen" id="screen-quiz">
      <div className="quiz-header">
        <StatusBar />
        <div className="quiz-top-bar">
          <button className="quiz-close" onClick={() => navigate(backTo)} aria-label="Close quiz">
            <i className="fas fa-times" />
          </button>
          <div className="quiz-progress-wrapper">
            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${(index / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <span className="quiz-question-num">
            {Math.min(index + 1, questions.length)}/{questions.length}
          </span>
        </div>
        <div className="quiz-stats-bar">
          <div className="quiz-stat hearts" data-testid="hearts">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span key={i} style={{ opacity: i < hearts ? 1 : 0.25 }}>
                ❤️
              </span>
            ))}
          </div>
          <div className="quiz-stat combo">🔥 x{multiplier} Combo</div>
          <div className="quiz-stat timer-stat">
            <i className="fas fa-clock" /> {mm}:{ss}
          </div>
        </div>
      </div>

      {q && (
        <div className="quiz-body">
          <div className="question-card">
            <div className="question-type-tag">{q.type}</div>
            <div className="question-text">{q.prompt}</div>
            {q.hint && <div className="question-hint">{q.hint}</div>}
          </div>

          <div className="answer-grid">
            {q.options.map((opt, i) => {
              let cls = 'answer-option'
              if (answered) {
                if (i === q.correctIndex) cls += ' correct'
                else if (i === selected) cls += ' wrong'
              } else if (i === selected) {
                cls += ' selected'
              }
              return (
                <div key={i} className={cls} onClick={() => handleSelect(i)} role="button">
                  <div className="answer-letter">{LETTERS[i]}</div>
                  <div className="answer-text">{opt}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {finished && (
        <>
          <Confetti />
          <div className="score-popup show" data-testid="score-popup">
            <div className="score-emoji">{correctCount === questions.length ? '🏆' : correctCount > 0 ? '🎉' : '💪'}</div>
            <h2>{correctCount === questions.length ? 'Perfect!' : correctCount > 0 ? 'Awesome!' : 'Keep Trying!'}</h2>
            <p>
              You got {correctCount} of {questions.length} correct
            </p>
            <div className="score-rewards">
              <div className="score-reward-item">
                <div className="icon">🪙</div>
                <div className="value">+{reward?.coins ?? 0}</div>
                <div className="label">Coins</div>
              </div>
              <div className="score-reward-item">
                <div className="icon">⭐</div>
                <div className="value">+{reward?.xp ?? 0}</div>
                <div className="label">XP</div>
              </div>
              <div className="score-reward-item">
                <div className="icon">💎</div>
                <div className="value">+{reward?.gems ?? 0}</div>
                <div className="label">Gems</div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate(backTo)}>
              Continue
            </button>
          </div>
        </>
      )}
    </div>
  )
}
