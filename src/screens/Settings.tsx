import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { BackButton, SectionHeader } from '@/components/ui'
import { isDriveConfigured } from '@/lib/googleDrive'
import { useContentStore, saveContentToDrive, loadContentFromDrive } from '@/content/runtime'
import { useAuth } from '@/auth/store'
import { useT } from '@/i18n'

function timeAgo(ts: number | null): string {
  if (!ts) return 'never'
  const secs = Math.round((Date.now() - ts) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export function Settings() {
  const navigate = useNavigate()
  const t = useT()
  const account = useAuth((s) => s.account)
  const signOut = useAuth((s) => s.signOut)
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
    if (r.ok) pushToast({ message: t.settings.courseLoaded, emoji: '📦', kind: 'success' })
    else pushToast({ message: r.errors[0] ?? t.settings.courseLoadErr, emoji: '⚠️', kind: 'error' })
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const r = uploadPackage(text)
    if (r.ok) pushToast({ message: t.settings.packImported, emoji: '📦', kind: 'success' })
    else pushToast({ message: r.errors[0] ?? t.settings.invalidPackage, emoji: '⚠️', kind: 'error' })
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
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900, marginTop: 8 }}>{t.settings.title} ⚙️</h1>
      </div>

      <SectionHeader title={t.settings.sound} />
      <div className="time-controls-card">
        <div className="time-control-row">
          <div className="tc-info">
            <h4>{t.settings.soundEffects}</h4>
            <p>{t.settings.soundEffectsDesc}</p>
          </div>
          <div
            className={`toggle-switch${settings.sound ? ' on' : ''}`}
            onClick={() => setSetting('sound', !settings.sound)}
            role="switch"
            aria-checked={settings.sound}
            aria-label={t.settings.soundEffects}
          />
        </div>
        <div className="time-control-row">
          <div className="tc-info">
            <h4>{t.settings.bgMusic}</h4>
            <p>{t.settings.bgMusicDesc}</p>
          </div>
          <div
            className={`toggle-switch${settings.music ? ' on' : ''}`}
            onClick={() => setSetting('music', !settings.music)}
            role="switch"
            aria-checked={settings.music}
            aria-label={t.settings.bgMusic}
          />
        </div>
      </div>

      <SectionHeader title={t.settings.appearance} />
      <div className="time-controls-card">
        <div className="time-control-row is-clickable" onClick={() => navigate('/themes')} role="button">
          <div className="tc-info">
            <h4>{t.settings.theme}</h4>
            <p>{t.settings.themeDesc}</p>
          </div>
          <i className="fas fa-chevron-right" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      <SectionHeader title={t.settings.coursePack} />
      <p style={{ padding: '0 24px 8px', color: 'var(--color-text-muted)', fontSize: 12 }}>
        {t.settings.coursePackDesc}
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
            <h4>{t.settings.importPack}</h4>
            <p>{t.settings.importPackDesc}</p>
          </div>
          <i className="fas fa-file-arrow-up" style={{ color: 'var(--color-primary)' }} />
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onUpload} data-testid="pack-upload" />
      </div>

      <SectionHeader title={t.settings.cloudSync} />
      <div className="time-controls-card">
        <div className="time-control-row">
          <div className="tc-info">
            <h4>{t.settings.googleDrive}</h4>
            <p data-testid="sync-status">
              {!driveReady
                ? t.settings.notConfigured
                : driveConnected
                  ? `Connected · ${sync.status} · last sync ${timeAgo(sync.lastSyncedAt)}`
                  : t.settings.saveAcross}
            </p>
          </div>
          {driveConnected ? (
            <button className="btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => disconnectDrive()}>
              {t.settings.disconnect}
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 14px' }}
              disabled={!driveReady}
              onClick={() => connectDrive()}
            >
              {t.settings.connect}
            </button>
          )}
        </div>
        {driveConnected && (
          <>
            <div className="time-control-row is-clickable" onClick={() => syncNow()} role="button">
              <div className="tc-info">
                <h4>{t.settings.syncNow}</h4>
                <p>{t.settings.syncNowDesc}</p>
              </div>
              <i className="fas fa-sync" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="time-control-row is-clickable" onClick={pushToDrive} role="button">
              <div className="tc-info">
                <h4>{t.settings.saveCourse}</h4>
                <p>{t.settings.saveCourseDesc}</p>
              </div>
              <i className="fas fa-cloud-arrow-up" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="time-control-row is-clickable" onClick={pullFromDrive} role="button">
              <div className="tc-info">
                <h4>{t.settings.loadCourse}</h4>
                <p>{t.settings.loadCourseDesc}</p>
              </div>
              <i className="fas fa-cloud-arrow-down" style={{ color: 'var(--color-primary)' }} />
            </div>
          </>
        )}
      </div>
      <p style={{ padding: '8px 24px', color: 'var(--color-text-muted)', fontSize: 12 }}>
        {t.settings.syncNote}
      </p>

      <SectionHeader title={t.settings.account} />
      <div className="time-controls-card">
        <div className="time-control-row">
          <div className="tc-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>{account?.avatar ?? '🙂'}</span>
            <div>
              <h4>{account?.displayName ?? '—'}</h4>
              <p>{t.settings.signedInAs} {account?.username ?? '—'}</p>
            </div>
          </div>
          <button className="btn-secondary" data-testid="signout" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => signOut()}>
            {t.settings.signOut}
          </button>
        </div>
      </div>

      <SectionHeader title={t.settings.data} />
      <div className="time-controls-card">
        <div className="time-control-row is-clickable" onClick={() => setConfirmReset(true)} role="button">
          <div className="tc-info">
            <h4 style={{ color: 'var(--color-secondary)' }}>{t.settings.resetProgress}</h4>
            <p>{t.settings.resetDesc}</p>
          </div>
          <i className="fas fa-trash" style={{ color: 'var(--color-secondary)' }} />
        </div>
      </div>

      <div className="bottom-spacer" />

      {confirmReset && (
        <div className="modal-scrim" onClick={() => setConfirmReset(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48 }}>⚠️</div>
            <h3>{t.settings.resetTitle}</h3>
            <p>{t.settings.resetBody}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmReset(false)}>
                {t.common.cancel}
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                  navigate('/')
                }}
              >
                {t.settings.reset}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
