import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { SUBJECTS } from '@/content/subjects'
import { selectLevel, selectSubjectProgress, greetingForHour } from '@/state/selectors'
import { nextMilestone } from '@/domain/streak'
import { dateKey } from '@/domain/datetime'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function currentWeek(activeDays: string[]) {
  const today = new Date()
  const todayKey = dateKey(today)
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    const key = dateKey(d)
    return { letter: DAY_LETTERS[i], active: activeDays.includes(key), today: key === todayKey }
  })
}

export function Home() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const level = selectLevel(user)
  const greeting = greetingForHour(new Date().getHours())
  const week = currentWeek(user.activeDays)
  const milestone = nextMilestone(user.streak.count)

  return (
    <div id="screen-home">
      <div className="home-header">
        <StatusBar />
        <div className="home-greeting">
          <div className="greeting-left">
            <h2>{greeting} 👋</h2>
            <h1>{user.profile.name}</h1>
          </div>
          <div className="avatar-container" onClick={() => navigate('/profile')} role="button" aria-label="Profile">
            {user.profile.avatar}
          </div>
        </div>

        <div className="currency-bar">
          <div className="currency-item" data-testid="coins">
            <span className="coin-icon">🪙</span> {user.coins.toLocaleString()}
          </div>
          <div className="currency-item">
            <span className="coin-icon">💎</span> {user.gems}
          </div>
          <div className="currency-item">
            <span className="coin-icon">🔥</span> {user.streak.count} days
          </div>
        </div>

        <div className="xp-bar-container">
          <div className="xp-bar-top">
            <div className="xp-level">
              <div className="level-badge">{level.level}</div>
              <span className="xp-label">{level.title}</span>
            </div>
            <span className="xp-amount">
              {level.xpIntoLevel} / {level.xpForLevel === Infinity ? '∞' : level.xpForLevel} XP
            </span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="streak-section">
        <div className="streak-card">
          <div className="streak-flame">🔥</div>
          <div className="streak-info">
            <h3>{user.streak.count}-Day Streak!</h3>
            <p>
              {milestone
                ? `Keep going! ${milestone - user.streak.count} more day${milestone - user.streak.count === 1 ? '' : 's'} for a bonus reward`
                : 'You are a streak legend! 🏆'}
            </p>
            <div className="streak-days">
              {week.map((d, i) => (
                <div key={i} className={`streak-dot${d.today ? ' today' : d.active ? ' active' : ''}`}>
                  {d.letter}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="My Subjects" action={<a onClick={() => navigate('/learn')}>See All</a>} />
      <div className="subject-grid">
        {SUBJECTS.map((subject) => {
          const p = selectSubjectProgress(user, subject.id)
          return (
            <div
              key={subject.id}
              className={`subject-card ${subject.colorClass}`}
              onClick={() => navigate(`/subject/${subject.id}`)}
              role="button"
              aria-label={subject.name}
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

      <div className="daily-challenge" onClick={() => navigate('/quiz/math-l2')} role="button">
        <div className="daily-challenge-tag">⚡ Daily Challenge</div>
        <h3>Speed Math Challenge</h3>
        <p>Solve addition problems and earn big rewards</p>
        <div className="challenge-reward">
          <span>🪙 +200</span>
          <span>💎 +5</span>
          <span>⭐ +100 XP</span>
        </div>
        <button className="challenge-btn">Start Challenge</button>
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
