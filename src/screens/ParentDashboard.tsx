import { useState } from 'react'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { BackButton, SectionHeader } from '@/components/ui'
import { SUBJECTS } from '@/content/subjects'
import { selectLevel, selectSubjectProgress, selectAverageAccuracy } from '@/state/selectors'
import { dateKey } from '@/domain/datetime'
import type { ParentalControls } from '@/domain/types'

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const realPin = useStore((s) => s.user.settings.parentPin)
  const [entry, setEntry] = useState('')
  const [error, setError] = useState(false)

  function press(d: string) {
    if (entry.length >= 4) return
    const next = entry + d
    setEntry(next)
    setError(false)
    if (next.length === 4) {
      if (next === realPin) {
        setTimeout(onUnlock, 150)
      } else {
        setTimeout(() => {
          setEntry('')
          setError(true)
        }, 300)
      }
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <BackButton to="/profile" />
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <div style={{ fontSize: 56 }}>🔒</div>
        <h2 style={{ margin: '12px 0 4px' }}>Parents Only</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {error ? 'Wrong PIN, try again' : 'Enter your 4-digit PIN'}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>(demo PIN: 1234)</p>
        <div className="pin-display">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`pin-dot${i < entry.length ? ' filled' : ''}`} />
          ))}
        </div>
        <div className="pin-pad" style={{ maxWidth: 240, margin: '0 auto' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} className="pin-key" onClick={() => press(d)}>
              {d}
            </button>
          ))}
          <button className="pin-key" onClick={() => setEntry('')}>
            ✕
          </button>
          <button className="pin-key" onClick={() => press('0')}>
            0
          </button>
          <button className="pin-key" onClick={() => setEntry(entry.slice(0, -1))}>
            ⌫
          </button>
        </div>
      </div>
    </div>
  )
}

const CONTROL_LABELS: Record<keyof ParentalControls, { title: string; desc: string }> = {
  dailyTimeLimit: { title: 'Daily Time Limit', desc: 'Max 2 hours per day' },
  bedtimeMode: { title: 'Bedtime Mode', desc: 'No access after 8:00 PM' },
  progressReports: { title: 'Progress Reports', desc: 'Weekly email summary' },
  purchaseApproval: { title: 'In-App Purchases', desc: 'Require parent approval' },
  multiplayerEnabled: { title: 'Multiplayer', desc: 'Allow Compete vs real players' },
}

export function ParentDashboard() {
  const [unlocked, setUnlocked] = useState(false)
  const user = useStore((s) => s.user)
  const setParental = useStore((s) => s.setParental)
  const level = selectLevel(user)

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />

  const today = dateKey()
  const todayMinutes = user.stats.dailyMinutes[today] ?? 0
  const accuracy = Math.round(selectAverageAccuracy(user) * 100)

  // Weekly chart from real daily minutes.
  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const mins = user.stats.dailyMinutes[dateKey(d)] ?? 0
    return { label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], mins }
  })
  const maxMins = Math.max(60, ...week.map((w) => w.mins))

  return (
    <div id="screen-parent">
      <div className="parent-header">
        <StatusBar />
        <div className="parent-title-row">
          <h1>Parent Dashboard</h1>
          <BackButton to="/profile" label="" />
        </div>
        <div className="child-profile-card">
          <div className="child-avatar">{user.profile.avatar}</div>
          <div className="child-info">
            <h3>{user.profile.name}'s Progress</h3>
            <p>
              Level {level.level} {level.title} · Age {user.profile.age}
            </p>
          </div>
        </div>
      </div>

      <div className="parent-stats-grid">
        <div className="parent-stat-card">
          <div className="stat-icon" style={{ background: '#E0FFF5', color: 'var(--color-accent-mint)' }}>
            <i className="fas fa-clock" />
          </div>
          <div className="stat-val">{todayMinutes}m</div>
          <div className="stat-lbl">Today's Study Time</div>
        </div>
        <div className="parent-stat-card">
          <div className="stat-icon" style={{ background: '#EDE7FF', color: 'var(--color-primary)' }}>
            <i className="fas fa-check-circle" />
          </div>
          <div className="stat-val">{user.stats.lessonsCompleted}</div>
          <div className="stat-lbl">Lessons Completed</div>
        </div>
        <div className="parent-stat-card">
          <div className="stat-icon" style={{ background: '#FFF2E5', color: 'var(--color-accent-orange)' }}>
            <i className="fas fa-bullseye" />
          </div>
          <div className="stat-val">{accuracy}%</div>
          <div className="stat-lbl">Average Accuracy</div>
        </div>
        <div className="parent-stat-card">
          <div className="stat-icon" style={{ background: '#FFE8E8', color: 'var(--color-secondary)' }}>
            <i className="fas fa-fire" />
          </div>
          <div className="stat-val">{user.streak.count}</div>
          <div className="stat-lbl">Current Streak</div>
        </div>
      </div>

      <SectionHeader title="Subject Performance" />
      <div className="subject-performance">
        {SUBJECTS.map((s) => {
          const p = selectSubjectProgress(user, s.id)
          return (
            <div key={s.id} className="performance-bar-item">
              <div className="perf-subject-label">{s.name}</div>
              <div className="perf-bar">
                <div
                  className="perf-fill"
                  style={{ width: `${p.percent}%`, background: `var(--color-${s.colorClass})` }}
                />
              </div>
              <div className="perf-value">{p.percent}%</div>
            </div>
          )
        })}
      </div>

      <SectionHeader title="Weekly Activity" />
      <div className="weekly-chart-card">
        <div className="chart-bars">
          {week.map((w, i) => (
            <div key={i} className="chart-bar-wrapper">
              <div className="chart-bar-value">{w.mins}m</div>
              <div
                className="chart-bar"
                style={{
                  height: `${Math.max(4, (w.mins / maxMins) * 100)}%`,
                  background:
                    w.mins === maxMins && w.mins > 0
                      ? 'linear-gradient(to top,var(--color-accent-yellow),var(--color-accent-orange))'
                      : 'linear-gradient(to top,var(--color-primary-light),var(--color-primary))',
                }}
              />
              <div className="chart-bar-label">{w.label}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionHeader title="Controls" />
      <div className="time-controls-card">
        {(Object.keys(CONTROL_LABELS) as Array<keyof ParentalControls>).map((key) => (
          <div key={key} className="time-control-row">
            <div className="tc-info">
              <h4>{CONTROL_LABELS[key].title}</h4>
              <p>{CONTROL_LABELS[key].desc}</p>
            </div>
            <div
              className={`toggle-switch${user.settings.parental[key] ? ' on' : ''}`}
              onClick={() => setParental(key, !user.settings.parental[key])}
              role="switch"
              aria-checked={user.settings.parental[key]}
              aria-label={CONTROL_LABELS[key].title}
            />
          </div>
        ))}
      </div>

      <div className="bottom-spacer" style={{ height: 120 }} />
    </div>
  )
}
