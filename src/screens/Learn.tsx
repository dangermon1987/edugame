import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'
import { selectSubjectProgress } from '@/state/selectors'

export function Learn() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const subjects = useContent((c) => c.subjects)
  const t = useT()

  return (
    <div id="screen-learn">
      <StatusBar dark />
      <div style={{ padding: '8px 20px 0' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900 }}>{t.learn.title} 📖</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>{t.learn.subtitle}</p>
      </div>

      <SectionHeader title={t.learn.subjects} />
      <div className="subject-grid">
        {subjects.map((subject) => {
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
                <span>{t.home.lesson(p.completed, p.total)}</span>
                <span>{p.percent}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <SectionHeader title={t.home.moreWays} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ModeRow emoji="🗂️" title={t.home.flashcards} desc={t.home.flashcardsDesc} onClick={() => navigate('/flashcards')} />
        <ModeRow emoji="🏆" title={t.home.compete} desc={t.home.competeDesc} onClick={() => navigate('/compete')} />
        <ModeRow emoji="🎮" title={t.home.arcade} desc={t.home.arcadeDesc} onClick={() => navigate('/arcade')} />
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
