import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { SUBJECTS } from '@/content/subjects'
import type { SubjectId } from '@/domain/types'
import type { BotTier } from '@/domain/bots'

type Mode = { id: 'rookie' | 'challenger' | 'champion' | 'mixed'; emoji: string; bg: string; title: string; desc: string }

const MODES: Mode[] = [
  { id: 'rookie', emoji: '🤖', bg: '#E0F8F8', title: 'vs Rookie Bots', desc: 'Friendly AI that answers slowly. Great for warming up.' },
  { id: 'challenger', emoji: '🎯', bg: '#EDE7FF', title: 'vs Challenger Bots', desc: 'Smarter, faster opponents for a real test.' },
  { id: 'champion', emoji: '🔥', bg: '#FFE8E8', title: 'vs Champion Bots', desc: 'The toughest AI. Only legends win here.' },
]

export function CompeteLobby() {
  const navigate = useNavigate()
  const compete = useStore((s) => s.user.compete)
  const multiplayer = useStore((s) => s.user.settings.parental.multiplayerEnabled)
  const [mode, setMode] = useState<Mode['id']>('rookie')
  const [subject, setSubject] = useState<SubjectId>('english')

  function findMatch() {
    const tier: BotTier | 'mixed' = mode === 'mixed' ? 'mixed' : mode
    navigate('/compete/live', { state: { tier, subject } })
  }

  return (
    <div id="screen-compete-lobby">
      <div className="compete-header">
        <StatusBar />
        <div className="compete-title-row">
          <h1>Compete!</h1>
        </div>
        <div className="compete-subtitle">Race to answer fastest & win big rewards</div>
        <div className="compete-record">
          <div className="compete-record-item">🏆 {compete.wins} Wins</div>
          <div className="compete-record-item">🎮 {compete.matches} Played</div>
          <div className="compete-record-item">🔥 {compete.winStreak} streak</div>
        </div>
      </div>

      <SectionHeader title="Choose Mode" />
      <div className="mode-cards">
        {MODES.map((m) => (
          <div
            key={m.id}
            className={`mode-card${mode === m.id ? ' selected' : ''}`}
            onClick={() => setMode(m.id)}
            role="button"
          >
            <div className="mode-icon" style={{ background: m.bg }}>
              {m.emoji}
            </div>
            <div className="mode-info">
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
            <i className="fas fa-chevron-right mode-arrow" />
          </div>
        ))}
        {multiplayer && (
          <div className="mode-card" onClick={() => setMode('mixed')} role="button" style={mode === 'mixed' ? undefined : undefined}>
            <div className="mode-icon" style={{ background: '#FFF2E5' }}>
              🎭
            </div>
            <div className="mode-info">
              <h3>Mixed Match</h3>
              <p>A mix of players and AI bots of all levels.</p>
            </div>
            <i className="fas fa-chevron-right mode-arrow" />
          </div>
        )}
      </div>

      <SectionHeader title="Pick Subject" />
      <div className="compete-subject-row">
        {SUBJECTS.map((s) => (
          <div
            key={s.id}
            className={`compete-subject-chip${subject === s.id ? ' selected' : ''}`}
            onClick={() => setSubject(s.id)}
            role="button"
          >
            <span className="chip-emoji">{s.emoji}</span>
            <span className="chip-label">{s.name}</span>
          </div>
        ))}
      </div>

      <div className="compete-start-area">
        <button className="btn-compete" onClick={findMatch}>
          <i className="fas fa-bolt" /> Find Match
        </button>
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
