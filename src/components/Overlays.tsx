import { useStore } from '@/state/store'
import { useContent } from '@/content/runtime'

export function Overlays() {
  const toasts = useStore((s) => s.toasts)
  const sync = useStore((s) => s.sync)
  const pending = useStore((s) => s.pendingAchievements)
  const clearPending = useStore((s) => s.clearPendingAchievements)
  const achievementById = useContent((c) => c.achievementById)

  return (
    <>
      <SyncPill status={sync.status} />

      {toasts.length > 0 && (
        <div className="toast-stack" data-testid="toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.kind ?? 'info'}`}>
              {t.emoji && <span className="toast-emoji">{t.emoji}</span>}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div className="modal-scrim" role="dialog" aria-label="Achievement unlocked">
          <div className="modal-card">
            <div style={{ fontSize: 56 }}>🏅</div>
            <h3>Achievement Unlocked!</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0 20px' }}>
              {pending.map((id) => {
                const a = achievementById[id]
                if (!a) return null
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span style={{ fontSize: 28 }}>{a.emoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <strong>{a.name}</strong>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{a.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="btn-primary" onClick={clearPending}>
              Awesome!
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function SyncPill({ status }: { status: string }) {
  if (status === 'idle' || status === 'disabled') return null
  const map: Record<string, { icon: string; text: string; spin?: boolean }> = {
    syncing: { icon: 'fas fa-sync', text: 'Syncing…', spin: true },
    synced: { icon: 'fas fa-cloud', text: 'Synced' },
    error: { icon: 'fas fa-triangle-exclamation', text: 'Sync error' },
    offline: { icon: 'fas fa-cloud-arrow-up', text: 'Offline' },
  }
  const cfg = map[status]
  if (!cfg) return null
  // Only keep "Synced" visible briefly via CSS-less approach: always render; it is unobtrusive.
  if (status === 'synced') return null
  return (
    <div className={`sync-pill${cfg.spin ? ' spin' : ''}`} data-testid="sync-pill">
      <i className={cfg.icon} />
      {cfg.text}
    </div>
  )
}
