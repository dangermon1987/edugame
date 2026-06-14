import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'
import { selectLevel, selectSubjectProgress, greetingKey, localizedBandTitle } from '@/state/selectors'
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
  const subjects = useContent((c) => c.subjects)
  const app = useContent((c) => c.app)
  const economy = useContent((c) => c.economy)
  const t = useT()
  const level = selectLevel(user)
  const greeting = t.greeting[greetingKey(new Date().getHours())]
  const levelTitle = localizedBandTitle(level.level, economy.levels.bands, t.levelBands)
  const week = currentWeek(user.activeDays)
  const milestone = nextMilestone(user.streak.count, economy.streakMilestones)

  return (
    <div id="screen-home">
      <div className="home-header">
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
            <span className="coin-icon">🔥</span> {user.streak.count} {t.common.days}
          </div>
        </div>

        <div className="xp-bar-container">
          <div className="xp-bar-top">
            <div className="xp-level">
              <div className="level-badge">{level.level}</div>
              <span className="xp-label">{levelTitle}</span>
            </div>
            <span className="xp-amount">
              {level.xpIntoLevel} / {level.xpForLevel === Infinity ? '∞' : level.xpForLevel} {t.common.xp}
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
            <h3>{t.home.streakTitle(user.streak.count)}</h3>
            <p>{milestone ? t.home.streakNext(milestone - user.streak.count) : t.home.streakLegend}</p>
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

      <SectionHeader title={t.home.mySubjects} action={<a onClick={() => navigate('/learn')}>{t.common.seeAll}</a>} />
      <div className="subject-grid">
        {subjects.slice(0, 4).map((subject) => {
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
                <span>{t.home.lesson(p.completed, p.total)}</span>
                <span>{p.percent}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="daily-challenge" onClick={() => navigate(`/quiz/${app.dailyChallengeLessonId}`)} role="button">
        <div className="daily-challenge-tag">⚡ {t.home.dailyChallenge}</div>
        <h3>{app.dailyChallenge.title}</h3>
        <p>{app.dailyChallenge.description}</p>
        <div className="challenge-reward">
          <span>🪙 +{app.dailyChallenge.coins}</span>
          {app.dailyChallenge.gems > 0 && <span>💎 +{app.dailyChallenge.gems}</span>}
          <span>⭐ +{app.dailyChallenge.xp} {t.common.xp}</span>
        </div>
        <button className="challenge-btn">{t.home.startChallenge}</button>
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
