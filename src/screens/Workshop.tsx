import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { SectionHeader, EmptyState } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'
import type { QuizQuestion, SubjectId } from '@/domain/types'
import { uuid } from '@/lib/id'

const EMOJIS = ['📚', '🔢', '🌍', '🔬', '🎨', '🦄', '🚀', '🎯']

export function Workshop() {
  const navigate = useNavigate()
  const t = useT()
  const quizzes = useStore((s) => s.user.customQuizzes)
  const addCustomQuiz = useStore((s) => s.addCustomQuiz)
  const removeCustomQuiz = useStore((s) => s.removeCustomQuiz)
  const pushToast = useStore((s) => s.pushToast)
  const subjects = useContent((c) => c.subjects)

  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📚')
  const [subject, setSubject] = useState<SubjectId>(subjects[0]?.id ?? '')
  const [prompt, setPrompt] = useState('')
  const [correct, setCorrect] = useState('')
  const [wrong, setWrong] = useState(['', '', ''])
  const [draft, setDraft] = useState<QuizQuestion[]>([])

  function addQuestion() {
    if (!prompt.trim() || !correct.trim() || wrong.some((w) => !w.trim())) {
      pushToast({ message: t.workshop.needQ, emoji: '✏️', kind: 'error' })
      return
    }
    const options = [correct, ...wrong]
    // Shuffle while tracking the correct option.
    const indexed = options.map((text, i) => ({ text, correct: i === 0 }))
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indexed[i], indexed[j]] = [indexed[j], indexed[i]]
    }
    const q: QuizQuestion = {
      id: uuid(),
      type: 'My Quiz',
      prompt: prompt.trim(),
      options: indexed.map((o) => o.text),
      correctIndex: indexed.findIndex((o) => o.correct),
    }
    setDraft((d) => [...d, q])
    setPrompt('')
    setCorrect('')
    setWrong(['', '', ''])
    pushToast({ message: t.workshop.added, emoji: '➕', kind: 'success' })
  }

  function saveQuiz() {
    if (!title.trim()) {
      pushToast({ message: t.workshop.needTitle, emoji: '✏️', kind: 'error' })
      return
    }
    if (draft.length === 0) {
      pushToast({ message: t.workshop.needOne, emoji: '✏️', kind: 'error' })
      return
    }
    addCustomQuiz({ title: title.trim(), emoji, subject, questions: draft })
    setTitle('')
    setDraft([])
    pushToast({ message: t.workshop.saved, emoji: '🎉', kind: 'success' })
  }

  const list = Object.values(quizzes).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div id="screen-workshop">
      <div className="workshop-header">
        <div className="workshop-title-row">
          <h1>{t.workshop.title}</h1>
        </div>
        <div className="workshop-subtitle">{t.workshop.subtitle}</div>
      </div>

      <SectionHeader title={t.workshop.newQuiz} />
      <div className="card-builder">
        <div className="builder-title">✏️ {t.workshop.builder} {draft.length > 0 && `· ${draft.length} question${draft.length === 1 ? '' : 's'}`}</div>

        <div className="builder-field">
          <div className="builder-label">{t.workshop.quizTitle}</div>
          <input className="builder-input" placeholder={t.workshop.quizTitlePh} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="builder-field">
          <div className="builder-label">{t.workshop.icon}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 24,
                  padding: 6,
                  borderRadius: 10,
                  border: emoji === e ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                  background: 'var(--color-bg-card)',
                  cursor: 'pointer',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="builder-field">
          <div className="builder-label">{t.workshop.subject}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`compete-subject-chip${subject === s.id ? ' selected' : ''}`}
                style={{ flex: 'none' }}
              >
                <span className="chip-emoji">{s.emoji}</span>
                <span className="chip-label">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="builder-field">
          <div className="builder-label">{t.workshop.question}</div>
          <input className="builder-input" placeholder={t.workshop.questionPh} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div className="builder-field">
          <div className="builder-label">{t.workshop.correct}</div>
          <input className="builder-input" placeholder={t.workshop.correctPh} value={correct} onChange={(e) => setCorrect(e.target.value)} />
        </div>
        <div className="builder-field">
          <div className="builder-label">{t.workshop.wrong}</div>
          {wrong.map((w, i) => (
            <input
              key={i}
              className="builder-input"
              placeholder={t.workshop.wrongPh(i + 1)}
              style={{ marginBottom: 8 }}
              value={w}
              onChange={(e) => setWrong((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
            />
          ))}
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: 12, background: 'linear-gradient(135deg,var(--color-accent-orange),#E88A2D)' }}
          onClick={addQuestion}
        >
          <i className="fas fa-plus" /> {t.workshop.addQuestion}
        </button>
        <button className="btn-primary" style={{ marginTop: 8 }} onClick={saveQuiz}>
          <i className="fas fa-save" /> {t.workshop.saveQuiz}
        </button>
      </div>

      <SectionHeader title={t.workshop.myQuizzes} action={<a>{t.workshop.quizzes(list.length)}</a>} />
      {list.length === 0 ? (
        <EmptyState emoji="🛠️" title={t.workshop.noneTitle} hint={t.workshop.noneBody} />
      ) : (
        <div className="my-quizzes">
          {list.map((quiz) => (
            <div className="quiz-item" key={quiz.id}>
              <div className="quiz-item-icon" style={{ background: '#EDE7FF' }}>
                {quiz.emoji}
              </div>
              <div className="quiz-item-info" onClick={() => navigate(`/quiz/${quiz.id}`)} role="button" style={{ cursor: 'pointer' }}>
                <h3>{quiz.title}</h3>
                <p>{t.workshop.tapToPlay}</p>
                <div className="quiz-item-stats">
                  <span className="qi-stat">
                    <i className="fas fa-layer-group" /> {t.workshop.cards(quiz.questions.length)}
                  </span>
                  <span className="qi-stat">
                    <i className="fas fa-tag" /> {quiz.subject}
                  </span>
                </div>
              </div>
              <i
                className="fas fa-trash quiz-item-action"
                onClick={() => removeCustomQuiz(quiz.id)}
                role="button"
                aria-label="Delete quiz"
              />
            </div>
          ))}
        </div>
      )}

      <div className="bottom-spacer" />
    </div>
  )
}
