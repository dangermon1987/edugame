import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { isAchievementEarned } from '@/content/evaluate'
import { selectLevel, localizedBandTitle } from '@/state/selectors'
import { dateKey } from '@/domain/datetime'
import { useT } from '@/i18n'

const PEERS = [
  { name: 'Emma', avatar: '🐰', xp: 3200, bg: '#FFE8E8' },
  { name: 'Liam', avatar: '🐸', xp: 2890, bg: '#E0F8F8' },
  { name: 'Sofia', avatar: '🦋', xp: 2100, bg: '#EDE7FF' },
  { name: 'Noah', avatar: '🐢', xp: 1950, bg: '#E0FFF5' },
]
const RANK_CLASS = ['gold', 'silver', 'bronze']
const RANK_ICON = ['👑', '🥈', '🥉']

function MonthCalendar({ activeDays }: { activeDays: string[] }) {
  const today = new Date()
  const todayKey = dateKey(today)
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  return (
    <div className="calendar-grid">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
        <div key={`l${i}`} className="cal-day-label">
          {d}
        </div>
      ))}
      {cells.map((day, i) => {
        if (day === null) return <div key={`e${i}`} className="cal-day empty" />
        const key = dateKey(new Date(year, month, day))
        const cls = key === todayKey ? 'today-day' : activeDays.includes(key) ? 'active-day' : ''
        return (
          <div key={key} className={`cal-day ${cls}`}>
            {day}
          </div>
        )
      })}
    </div>
  )
}

export function Profile() {
  const navigate = useNavigate()
  const t = useT()
  const user = useStore((s) => s.user)
  const achievements = useContent((c) => c.achievements)
  const economy = useContent((c) => c.economy)
  const level = selectLevel(user)

  const board = [...PEERS, { name: `${user.profile.name} (${t.profile.you})`, avatar: user.profile.avatar, xp: user.xp, bg: '#FFF2E5', me: true }]
    .sort((a, b) => b.xp - a.xp)

  return (
    <div id="screen-profile">

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px', gap: 8 }}>
        <button className="parent-settings-btn" onClick={() => navigate('/settings')} aria-label="Settings">
          <i className="fas fa-cog" />
        </button>
        <button className="parent-settings-btn" onClick={() => navigate('/parent')} aria-label="Parent dashboard">
          <i className="fas fa-user-shield" />
        </button>
      </div>

      <div className="profile-header-section">
        <div className="profile-avatar">
          <div className="profile-level-ring" />
          {user.profile.avatar}
        </div>
        <div className="profile-name">{user.profile.name}</div>
        <div className="profile-title">
          {t.profile.levelTitle(level.level, localizedBandTitle(level.level, economy.levels.bands, t.levelBands))}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{user.xp.toLocaleString()}</div>
          <div className="stat-label">{t.profile.totalXp}</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{user.streak.count} 🔥</div>
          <div className="stat-label">{t.profile.dayStreak}</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{user.stats.lessonsCompleted}</div>
          <div className="stat-label">{t.profile.lessons}</div>
        </div>
      </div>

      <SectionHeader title={t.profile.achievements} />
      <div className="achievements-grid">
        {achievements.map((a) => {
          const earned = Boolean(user.achievements[a.id]) || isAchievementEarned(a, user)
          return (
            <div key={a.id} className="achievement-badge" title={a.description}>
              <div className={`badge-icon ${earned ? 'earned' : 'locked'}`}>{a.emoji}</div>
              <div className="badge-name">{a.name}</div>
            </div>
          )
        })}
      </div>

      <SectionHeader title={t.profile.activityCalendar} />
      <div className="streak-calendar">
        <div className="calendar-card">
          <MonthCalendar activeDays={user.activeDays} />
        </div>
      </div>

      <SectionHeader title={t.profile.leaderboard} action={<a>{t.profile.thisWeek}</a>} />
      <div className="leaderboard-section">
        <div className="leaderboard-card">
          {board.map((p, i) => (
            <div key={p.name} className={`leaderboard-item${'me' in p && p.me ? ' me' : ''}`}>
              <div className={`lb-rank ${RANK_CLASS[i] ?? ''}`}>{RANK_ICON[i] ?? i + 1}</div>
              <div className="lb-avatar" style={{ background: p.bg }}>
                {p.avatar}
              </div>
              <div className="lb-name">{p.name}</div>
              <div className="lb-xp">{p.xp.toLocaleString()} XP</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
