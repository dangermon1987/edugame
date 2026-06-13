import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { BackButton, SectionHeader } from '@/components/ui'
import { isDriveConfigured } from '@/lib/googleDrive'
import { useContentStore, saveContentToDrive, loadContentFromDrive } from '@/content/runtime'

function timeAgo(ts: number | null): string {
  if (!ts) return 'never'
  const secs = Math.round((Date.now() - ts) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export function Settings() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.user.settings)
  const setSetting = useStore((s) => s.setSetting)
  const sync = useStore((s) => s.sync)
  const driveConnected = useStore((s) => s.driveConnected)
  const connectDrive = useStore((s) => s.connectDrive)
  const disconnectDrive = useStore((s) => s.disconnectDrive)
  const syncNow = useStore((s) => s.syncNow)
  const resetProgress = useStore((s) => s.resetProgress)
  const pushToast = useStore((s) => s.pushToast)
  const [confirmReset, setConfirmReset] = useState(false)

  const manifest = useContentStore((s) => s.manifest)
  const activeId = useContentStore((s) => s.activeId)
  const activeName = useContentStore((s) => s.content.meta.name)
  const switchTo = useContentStore((s) => s.switchTo)
  const uploadPackage = useContentStore((s) => s.uploadPackage)
  const fileRef = useRef<HTMLInputElement>(null)

  const driveReady = isDriveConfigured()

  async function pickPack(id: string) {
    const r = await switchTo(id)
    if (r.ok) pushToast({ message: 'Course loaded!', emoji: '📦', kind: 'success' })
    else pushToast({ message: r.errors[0] ?? 'Could not load course', emoji: '⚠️', kind: 'error' })
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const r = uploadPackage(text)
    if (r.ok) pushToast({ message: 'Course package imported!', emoji: '📦', kind: 'success' })
    else pushToast({ message: r.errors[0] ?? 'Invalid package', emoji: '⚠️', kind: 'error' })
    if (fileRef.current) fileRef.current.value = ''
  }

  async function pushToDrive() {
    const r = await saveContentToDrive()
    pushToast(r.ok ? { message: 'Course saved to Drive', emoji: '☁️', kind: 'success' } : { message: r.error ?? 'Failed', emoji: '⚠️', kind: 'error' })
  }
  async function pullFromDrive() {
    const r = await loadContentFromDrive()
    pushToast(r.ok ? { message: 'Course loaded from Drive', emoji: '☁️', kind: 'success' } : { message: r.error ?? 'Failed', emoji: '⚠️', kind: 'error' })
  }

  // Manifest may not include the active pack (e.g. an uploaded one) — show it too.
  const packs = manifest.some((m) => m.id === activeId)
    ? manifest
    : [{ id: activeId, name: activeName, description: 'Imported course', cover: '📦', file: '' }, ...manifest]

  return (
    <div id="screen-settings">
      <StatusBar dark />
      <div style={{ padding: '8px 16px 0' }}>
        <BackButton to="/profile" />
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900, marginTop: 8 }}>Settings ⚙️</h1>
      </div>

      <SectionHeader title="Sound" />
      <div className="time-controls-card">
        <div className="time-control-row">
          <div className="tc-info">
            <h4>Sound Effects</h4>
            <p>Chimes & celebration sounds</p>
          </div>
          <div
            className={`toggle-switch${settings.sound ? ' on' : ''}`}
            onClick={() => setSetting('sound', !settings.sound)}
            role="switch"
            aria-checked={settings.sound}
            aria-label="Sound Effects"
          />
        </div>
        <div className="time-control-row">
          <div className="tc-info">
            <h4>Background Music</h4>
            <p>Gentle looping music</p>
          </div>
          <div
            className={`toggle-switch${settings.music ? ' on' : ''}`}
            onClick={() => setSetting('music', !settings.music)}
            role="switch"
            aria-checked={settings.music}
            aria-label="Background Music"
          />
        </div>
      </div>

      <SectionHeader title="Appearance" />
      <div className="time-controls-card">
        <div className="time-control-row is-clickable" onClick={() => navigate('/themes')} role="button">
          <div className="tc-info">
            <h4>Theme</h4>
            <p>Change colors & look</p>
          </div>
          <i className="fas fa-chevron-right" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      <SectionHeader title="Course Pack" />
      <p style={{ padding: '0 24px 8px', color: 'var(--color-text-muted)', fontSize: 12 }}>
        A course pack supplies every subject, lesson, deck, shop item & theme. Switch packs to load a whole different course.
      </p>
      <div className="time-controls-card">
        {packs.map((p) => (
          <div
            key={p.id}
            className="time-control-row is-clickable"
            onClick={() => p.id !== activeId && pickPack(p.id)}
            role="button"
            aria-label={`Use ${p.name}`}
          >
            <div className="tc-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26 }}>{p.cover}</span>
              <div>
                <h4>{p.name}</h4>
                <p>{p.description}</p>
              </div>
            </div>
            {p.id === activeId ? (
              <span className="theme-badge" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                ACTIVE
              </span>
            ) : (
              <i className="fas fa-circle-arrow-right" style={{ color: 'var(--color-primary)', fontSize: 20 }} />
            )}
          </div>
        ))}
        <div className="time-control-row is-clickable" onClick={() => fileRef.current?.click()} role="button">
          <div className="tc-info">
            <h4>Import Course Pack…</h4>
            <p>Load a .json package (e.g. AI-generated)</p>
          </div>
          <i className="fas fa-file-arrow-up" style={{ color: 'var(--color-primary)' }} />
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onUpload} data-testid="pack-upload" />
      </div>

      <SectionHeader title="Cloud Sync" />
      <div className="time-controls-card">
        <div className="time-control-row">
          <div className="tc-info">
            <h4>Google Drive</h4>
            <p data-testid="sync-status">
              {!driveReady
                ? 'Not configured — set VITE_GOOGLE_CLIENT_ID'
                : driveConnected
                  ? `Connected · ${sync.status} · last sync ${timeAgo(sync.lastSyncedAt)}`
                  : 'Save progress across devices'}
            </p>
          </div>
          {driveConnected ? (
            <button className="btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => disconnectDrive()}>
              Disconnect
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 14px' }}
              disabled={!driveReady}
              onClick={() => connectDrive()}
            >
              Connect
            </button>
          )}
        </div>
        {driveConnected && (
          <>
            <div className="time-control-row is-clickable" onClick={() => syncNow()} role="button">
              <div className="tc-info">
                <h4>Sync Now</h4>
                <p>Force an immediate progress sync</p>
              </div>
              <i className="fas fa-sync" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="time-control-row is-clickable" onClick={pushToDrive} role="button">
              <div className="tc-info">
                <h4>Save Course to Drive</h4>
                <p>Back up the active course pack</p>
              </div>
              <i className="fas fa-cloud-arrow-up" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="time-control-row is-clickable" onClick={pullFromDrive} role="button">
              <div className="tc-info">
                <h4>Load Course from Drive</h4>
                <p>Restore a course saved to Drive</p>
              </div>
              <i className="fas fa-cloud-arrow-down" style={{ color: 'var(--color-primary)' }} />
            </div>
          </>
        )}
      </div>
      <p style={{ padding: '8px 24px', color: 'var(--color-text-muted)', fontSize: 12 }}>
        Your progress is always saved on this device. Cloud sync mirrors it to your Google Drive every 5 minutes so you can
        play on other devices.
      </p>

      <SectionHeader title="Data" />
      <div className="time-controls-card">
        <div className="time-control-row is-clickable" onClick={() => setConfirmReset(true)} role="button">
          <div className="tc-info">
            <h4 style={{ color: 'var(--color-secondary)' }}>Reset Progress</h4>
            <p>Start over (keeps your name & settings)</p>
          </div>
          <i className="fas fa-trash" style={{ color: 'var(--color-secondary)' }} />
        </div>
      </div>

      <div className="bottom-spacer" />

      {confirmReset && (
        <div className="modal-scrim" onClick={() => setConfirmReset(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48 }}>⚠️</div>
            <h3>Reset Progress?</h3>
            <p>This will erase coins, XP, lessons and items. This can't be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                  navigate('/')
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
