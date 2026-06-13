import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { SUBJECTS } from '@/content/subjects'
import { selectSubjectProgress } from '@/state/selectors'

export function Learn() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)

  return (
    <div id="screen-learn">
      <StatusBar dark />
      <div style={{ padding: '8px 20px 0' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900 }}>Learn 📖</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Pick a subject to continue your adventure</p>
      </div>

      <SectionHeader title="Subjects" />
      <div className="subject-grid">
        {SUBJECTS.map((subject) => {
          const p = selectSubjectProgress(user, subject.id)
          return (
            <div
              key={subject.id}
              className={`subject-card ${subject.colorClass}`}
              onClick={() => navigate(`/subject/${subject.id}`)}
              role="button"
            >
              <div className="subject-icon">
                <i className={subject.icon} />
              </div>
              <h3>{subject.name}</h3>
              <p>{subject.description}</p>
              <div className="subject-progress">
                <div className="subject-progress-fill" style={{ width: `${p.percent}%` }} />
              </div>
              <div className="subject-progress-label">
                <span>
                  Lesson {p.completed}/{p.total}
                </span>
                <span>{p.percent}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <SectionHeader title="More Ways to Learn" />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ModeRow emoji="🗂️" title="Flashcards" desc="Practice with spaced repetition" onClick={() => navigate('/flashcards')} />
        <ModeRow emoji="🏆" title="Compete" desc="Race against friends & bots" onClick={() => navigate('/compete')} />
        <ModeRow emoji="🎮" title="Arcade" desc="Fun learning mini-games" onClick={() => navigate('/arcade')} />
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}

function ModeRow({ emoji, title, desc, onClick }: { emoji: string; title: string; desc: string; onClick: () => void }) {
  return (
    <div
      className="is-clickable"
      onClick={onClick}
      role="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ fontSize: 32 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 'var(--font-size-md)' }}>{title}</h4>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{desc}</p>
      </div>
      <i className="fas fa-chevron-right" style={{ color: 'var(--color-text-muted)' }} />
    </div>
  )
}
