import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'
import type { SubjectId } from '@/domain/types'
import type { BotTier } from '@/domain/bots'

type Mode = { id: 'rookie' | 'challenger' | 'champion' | 'mixed'; emoji: string; bg: string; title: string; desc: string }

export function CompeteLobby() {
  const t = useT()
  const navigate = useNavigate()
  const MODES: Mode[] = [
    { id: 'rookie', emoji: '🤖', bg: '#E0F8F8', title: t.compete.modes.rookie[0], desc: t.compete.modes.rookie[1] },
    { id: 'challenger', emoji: '🎯', bg: '#EDE7FF', title: t.compete.modes.challenger[0], desc: t.compete.modes.challenger[1] },
    { id: 'champion', emoji: '🔥', bg: '#FFE8E8', title: t.compete.modes.champion[0], desc: t.compete.modes.champion[1] },
  ]
  const compete = useStore((s) => s.user.compete)
  const multiplayer = useStore((s) => s.user.settings.parental.multiplayerEnabled)
  const subjects = useContent((c) => c.subjects)
  const [mode, setMode] = useState<Mode['id']>('rookie')
  const [subject, setSubject] = useState<SubjectId>(subjects[0]?.id ?? '')

  function findMatch() {
    const tier: BotTier | 'mixed' = mode === 'mixed' ? 'mixed' : mode
    navigate('/compete/live', { state: { tier, subject } })
  }

  return (
    <div id="screen-compete-lobby">
      <div className="compete-header">
        <StatusBar />
        <div className="compete-title-row">
          <h1>{t.compete.title}</h1>
        </div>
        <div className="compete-subtitle">{t.compete.subtitle}</div>
        <div className="compete-record">
          <div className="compete-record-item">🏆 {t.compete.wins(compete.wins)}</div>
          <div className="compete-record-item">🎮 {t.compete.played(compete.matches)}</div>
          <div className="compete-record-item">🔥 {t.compete.streak(compete.winStreak)}</div>
        </div>
      </div>

      <SectionHeader title={t.compete.chooseMode} />
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
              <h3>{t.compete.modes.mixed[0]}</h3>
              <p>{t.compete.modes.mixed[1]}</p>
            </div>
            <i className="fas fa-chevron-right mode-arrow" />
          </div>
        )}
      </div>

      <SectionHeader title={t.compete.pickSubject} />
      <div className="compete-subject-row">
        {subjects.map((s) => (
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
          <i className="fas fa-bolt" /> {t.compete.findMatch}
        </button>
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
