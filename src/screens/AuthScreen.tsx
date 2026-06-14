import { useState } from 'react'
import { useAuth } from '@/auth/store'
import type { AuthErrorCode } from '@/auth/local'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'
import { isDriveConfigured } from '@/lib/googleDrive'

export function AuthScreen() {
  const t = useT()
  const app = useContent((c) => c.app)
  const signIn = useAuth((s) => s.signIn)
  const signUp = useAuth((s) => s.signUp)
  const signInGoogle = useAuth((s) => s.signInGoogle)
  const signInGuest = useAuth((s) => s.signInGuest)
  const listAccounts = useAuth((s) => s.listAccounts)

  const [mode, setMode] = useState<'in' | 'up'>(listAccounts().length ? 'in' : 'up')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<AuthErrorCode | null>(null)
  const [busy, setBusy] = useState(false)

  const accounts = listAccounts()

  const errText = (c: AuthErrorCode): string =>
    c === 'TAKEN'
      ? t.auth.taken
      : c === 'TOO_SHORT'
        ? t.auth.tooShort
        : c === 'NEED_NAME'
          ? t.auth.needName
          : c === 'GOOGLE_FAILED'
            ? 'Google sign-in failed'
            : t.auth.wrongCreds

  async function submit() {
    setBusy(true)
    setError(null)
    const res =
      mode === 'in' ? await signIn(username, password) : await signUp({ username, password, displayName })
    setBusy(false)
    if (!res.ok && res.code) setError(res.code)
  }

  async function google() {
    setBusy(true)
    setError(null)
    const res = await signInGoogle()
    setBusy(false)
    if (!res.ok && res.code) setError(res.code)
  }

  return (
    <div className="app-stage">
      <div className="phone-frame">
        <div className="screen-container">
          <div className="screen active">
            <div className="auth-screen">
              <div className="auth-logo">🎓</div>
              <h2 className="auth-welcome">{t.auth.welcome}</h2>
              <h1 className="auth-app">{app.title}</h1>
              <p className="auth-tagline">{t.auth.tagline}</p>

              {accounts.length > 0 && mode === 'in' && (
                <div className="auth-profiles">
                  {accounts.map((a) => (
                    <button
                      key={a.id}
                      className={`auth-profile${username === a.username ? ' active' : ''}`}
                      onClick={() => setUsername(a.username)}
                      type="button"
                    >
                      <span className="auth-profile-av">{a.avatar}</span>
                      <span className="auth-profile-name">{a.displayName}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="auth-form">
                {mode === 'up' && (
                  <input
                    className="builder-input"
                    data-testid="auth-displayname"
                    placeholder={t.auth.displayNamePh}
                    aria-label={t.auth.displayName}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                )}
                <input
                  className="builder-input"
                  data-testid="auth-username"
                  placeholder={t.auth.usernamePh}
                  aria-label={t.auth.username}
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="builder-input"
                  data-testid="auth-password"
                  type="password"
                  placeholder={t.auth.passwordPh}
                  aria-label={t.auth.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                />

                {error && <div className="auth-error">{errText(error)}</div>}

                <button className="btn-primary" data-testid="auth-submit" disabled={busy} onClick={submit}>
                  {mode === 'in' ? t.auth.signIn : t.auth.signUp}
                </button>

                <button className="auth-toggle" data-testid="auth-toggle" type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
                  {mode === 'in' ? t.auth.needAccount : t.auth.haveAccount}
                </button>
              </div>

              <div className="auth-divider"><span>·</span></div>

              {isDriveConfigured() && (
                <button className="btn-secondary auth-google" disabled={busy} onClick={google}>
                  <i className="fab fa-google" /> {t.auth.google}
                </button>
              )}
              <button className="auth-guest" data-testid="auth-guest" type="button" onClick={signInGuest}>
                {t.auth.guest}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
