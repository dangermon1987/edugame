import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { useContent } from '@/content/runtime'
import { selectSubjectProgress } from '@/state/selectors'

// Island slots — subjects are placed in order, so any package works.
const POSITIONS = [
  { top: 370, left: 45, bg: 'linear-gradient(135deg,#EDE7FF,#D5CEFC)' },
  { top: 260, left: 140, bg: 'linear-gradient(135deg,#FFE8E8,#FFD0D0)' },
  { top: 160, left: 230, bg: 'linear-gradient(135deg,#E0F8F8,#B8F0F0)' },
  { top: 90, left: 275, bg: 'linear-gradient(135deg,#FFF2E5,#FFE0C0)' },
  { top: 440, left: 250, bg: 'linear-gradient(135deg,#E0FFF5,#C0F5E5)' },
  { top: 340, left: 290, bg: 'linear-gradient(135deg,#FFF8E0,#FFEFC0)' },
]

const LOCKED = [
  { top: 50, left: 160, emoji: '🎵', label: 'Music Valley' },
  { top: 110, left: 60, emoji: '💻', label: 'Code Castle' },
]

function starString(percent: number) {
  if (percent >= 66) return '★★★'
  if (percent >= 33) return '★★☆'
  if (percent > 0) return '★☆☆'
  return 'NEW'
}

export function AdventureMap() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const subjects = useContent((c) => c.subjects)
  const completedAreas = subjects.filter((s) => selectSubjectProgress(user, s.id).percent === 100).length
  const currentId = subjects.find((s) => selectSubjectProgress(user, s.id).percent < 100)?.id

  return (
    <div id="screen-map">
      <div className="map-header">
        <StatusBar />
        <div className="map-title-row">
          <h1>World Map</h1>
          <div className="map-progress-tag">🗺️ {completedAreas}/{subjects.length} Areas</div>
        </div>
      </div>

      <div className="world-map">
        <div className="map-water" />
        <div className="map-wave" />
        <div className="map-cloud" style={{ top: 20, left: 10 }}>☁️</div>
        <div className="map-cloud" style={{ top: 50, left: 200, fontSize: 22 }}>☁️</div>
        <div className="map-cloud" style={{ top: 80, left: 100, fontSize: 20 }}>☁️</div>

        <div className="treasure-marker" style={{ top: 350, left: 140 }}>💎</div>
        <div className="treasure-marker" style={{ top: 240, left: 300 }}>🏴‍☠️</div>

        {subjects.slice(0, POSITIONS.length).map((s, i) => {
          const p = selectSubjectProgress(user, s.id)
          const pos = POSITIONS[i]
          const isCurrent = s.id === currentId
          return (
            <div className="map-island" style={{ top: pos.top, left: pos.left }} key={s.id} onClick={() => navigate(`/subject/${s.id}`)} role="button">
              <div className={`island-icon ${p.percent === 100 ? 'unlocked' : isCurrent ? 'current' : 'unlocked'}`} style={{ background: pos.bg }}>
                {s.emoji}
              </div>
              <div className="island-label">{s.name}</div>
              <div className="island-stars">{isCurrent ? 'NOW!' : starString(p.percent)}</div>
            </div>
          )
        })}

        {LOCKED.map((l) => (
          <div className="map-island" style={{ top: l.top, left: l.left }} key={l.label}>
            <div className="island-icon locked" style={{ background: '#DDD' }}>
              {l.emoji}
            </div>
            <div className="island-lock">
              <i className="fas fa-lock" />
            </div>
            <div className="island-label">{l.label}</div>
          </div>
        ))}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--color-accent-mint)' }} /> Completed
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--color-accent-yellow)' }} /> Current
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--color-text-muted)' }} /> Locked
        </div>
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
