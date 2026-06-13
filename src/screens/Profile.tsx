import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { ACHIEVEMENTS } from '@/content/achievements'
import { selectLevel } from '@/state/selectors'
import { dateKey } from '@/domain/datetime'

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
  const user = useStore((s) => s.user)
  const level = selectLevel(user)

  const board = [...PEERS, { name: `${user.profile.name} (You)`, avatar: user.profile.avatar, xp: user.xp, bg: '#FFF2E5', me: true }]
    .sort((a, b) => b.xp - a.xp)

  return (
    <div id="screen-profile">
      <StatusBar dark />

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
          ⭐ Level {level.level} {level.title}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{user.xp.toLocaleString()}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{user.streak.count} 🔥</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{user.stats.lessonsCompleted}</div>
          <div className="stat-label">Lessons</div>
        </div>
      </div>

      <SectionHeader title="Achievements" />
      <div className="achievements-grid">
        {ACHIEVEMENTS.map((a) => {
          const earned = Boolean(user.achievements[a.id]) || a.isEarned(user)
          return (
            <div key={a.id} className="achievement-badge" title={a.description}>
              <div className={`badge-icon ${earned ? 'earned' : 'locked'}`}>{a.emoji}</div>
              <div className="badge-name">{a.name}</div>
            </div>
          )
        })}
      </div>

      <SectionHeader title="Activity Calendar" />
      <div className="streak-calendar">
        <div className="calendar-card">
          <MonthCalendar activeDays={user.activeDays} />
        </div>
      </div>

      <SectionHeader title="Leaderboard" action={<a>This Week</a>} />
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
