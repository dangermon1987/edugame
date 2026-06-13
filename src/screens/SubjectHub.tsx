import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { BackButton, SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { selectSubjectProgress } from '@/state/selectors'

function stars(n: number) {
  return '★★★☆☆☆'.slice(3 - n, 6 - n)
}

export function SubjectHub() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const user = useStore((s) => s.user)
  const subjectById = useContent((c) => c.subjectById)
  const lessonsBySubject = useContent((c) => c.lessonsBySubject)
  const subject = id ? subjectById[id] : undefined

  if (!subject) {
    return (
      <div style={{ padding: 24 }}>
        <BackButton to="/" />
        <p>Subject not found.</p>
      </div>
    )
  }

  const lessons = lessonsBySubject[subject.id] ?? []
  const progress = selectSubjectProgress(user, subject.id)
  const firstIncompleteIdx = lessons.findIndex((l) => !user.lessonProgress[l.id]?.completed)
  const currentIdx = firstIncompleteIdx === -1 ? lessons.length : firstIncompleteIdx
  const totalMinutes = lessons.reduce((s, l) => s + l.estMinutes, 0)

  return (
    <div id="screen-subject">
      <StatusBar dark />
      <div className="subject-hub-header">
        <BackButton to="/" />
        <div className="subject-hub-hero">
          <h1>
            {subject.emoji} {subject.name}
          </h1>
          <p>{subject.description}</p>
          <div className="hub-stats">
            <div className="hub-stat">
              <i className="fas fa-star" /> {progress.percent}% done
            </div>
            <div className="hub-stat">
              <i className="fas fa-trophy" /> {progress.stars} stars
            </div>
            <div className="hub-stat">
              <i className="fas fa-clock" /> {totalMinutes}m total
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Learning Path" action={<a onClick={() => navigate('/map')}>Map View</a>} />
      <div className="lesson-path">
        <div className="path-line" />
        {lessons.map((lesson, i) => {
          const lp = user.lessonProgress[lesson.id]
          const status = lp?.completed ? 'completed' : i === currentIdx ? 'current' : i < currentIdx ? 'completed' : 'locked'
          const clickable = status !== 'locked'
          return (
            <div
              key={lesson.id}
              className={`lesson-node ${status}`}
              onClick={() => clickable && navigate(`/quiz/${lesson.id}`)}
              role={clickable ? 'button' : undefined}
            >
              <div className="lesson-node-icon">
                <i className={status === 'completed' ? 'fas fa-check' : status === 'current' ? 'fas fa-play' : 'fas fa-lock'} />
              </div>
              <div className="lesson-card">
                <h4>{lesson.title}</h4>
                <p>{lesson.description}</p>
                <div className="lesson-meta">
                  {lp?.completed && <span className="lesson-stars">{stars(lp.stars)}</span>}
                  <span>
                    <i className="fas fa-clock" /> {lesson.estMinutes} min
                  </span>
                  <span>
                    <i className="fas fa-coins" /> +{lesson.coinReward}
                  </span>
                  {lesson.gemReward > 0 && (
                    <span>
                      <i className="fas fa-gem" style={{ color: 'var(--color-gem)' }} /> +{lesson.gemReward}
                    </span>
                  )}
                </div>
                {status === 'current' && <button className="play-btn-mini">Continue</button>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
