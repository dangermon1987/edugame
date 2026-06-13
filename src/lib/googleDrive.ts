/**
 * Google Drive integration using Google Identity Services (GIS) for OAuth and
 * the Drive REST API for storage. Saves go to the hidden `appDataFolder`, which
 * is private to this app and invisible in the user's normal Drive.
 *
 * Configuration: set VITE_GOOGLE_CLIENT_ID (an OAuth 2.0 Web client id) at build
 * time. With no client id, Drive sync is simply unavailable and the app stays
 * fully functional in local-only mode.
 */
import type { DriveClient } from '@/storage'

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const GIS_SRC = 'https://accounts.google.com/gsi/client'

interface TokenResponse {
  access_token: string
  expires_in: number
  error?: string
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
  callback: (resp: TokenResponse) => void
}

// Minimal shape of the global injected by the GIS script.
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (resp: TokenResponse) => void
          }) => TokenClient
          revoke: (token: string, done?: () => void) => void
        }
      }
    }
  }
}

export function getGoogleClientId(): string | undefined {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
}

export function isDriveConfigured(): boolean {
  return Boolean(getGoogleClientId())
}

let scriptPromise: Promise<void> | null = null
function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

let accessToken: string | null = null
let tokenExpiry = 0

class GoogleDriveClientImpl implements DriveClient {
  private tokenClient: TokenClient | null = null

  constructor(private readonly clientId: string) {}

  private async ensureTokenClient(): Promise<TokenClient> {
    await loadGisScript()
    const oauth2 = window.google?.accounts.oauth2
    if (!oauth2) throw new Error('Google Identity Services unavailable')
    if (!this.tokenClient) {
      this.tokenClient = oauth2.initTokenClient({
        client_id: this.clientId,
        scope: SCOPE,
        callback: () => {}, // replaced per-request below
      })
    }
    return this.tokenClient
  }

  /** Interactive consent / token acquisition. */
  async signIn(): Promise<void> {
    await this.requestToken('consent')
  }

  isSignedIn(): boolean {
    return Boolean(accessToken) && Date.now() < tokenExpiry
  }

  private requestToken(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ensureTokenClient()
        .then((client) => {
          client.callback = (resp) => {
            if (resp.error || !resp.access_token) {
              reject(new Error(resp.error || 'Authorization failed'))
              return
            }
            accessToken = resp.access_token
            tokenExpiry = Date.now() + (resp.expires_in - 60) * 1000
            resolve(resp.access_token)
          }
          client.requestAccessToken({ prompt })
        })
        .catch(reject)
    })
  }

  private async token(): Promise<string> {
    if (this.isSignedIn() && accessToken) return accessToken
    return this.requestToken('')
  }

  private async authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const token = await this.token()
    const res = await fetch(url, {
      ...init,
      headers: { ...(init.headers ?? {}), authorization: `Bearer ${token}` },
    })
    if (res.status === 401) {
      // Token rejected — force a fresh one once.
      accessToken = null
      const fresh = await this.requestToken('')
      return fetch(url, {
        ...init,
        headers: { ...(init.headers ?? {}), authorization: `Bearer ${fresh}` },
      })
    }
    return res
  }

  private async findFileId(name: string): Promise<string | null> {
    const q = encodeURIComponent(`name='${name}'`)
    const res = await this.authedFetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`,
    )
    if (!res.ok) throw new Error(`Drive list failed: ${res.status}`)
    const body = (await res.json()) as { files: Array<{ id: string }> }
    return body.files[0]?.id ?? null
  }

  async readAppDataFile(name: string): Promise<string | null> {
    const id = await this.findFileId(name)
    if (!id) return null
    const res = await this.authedFetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Drive read failed: ${res.status}`)
    return res.text()
  }

  async writeAppDataFile(name: string, contents: string): Promise<void> {
    const id = await this.findFileId(name)
    if (id) {
      const res = await this.authedFetch(
        `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`,
        { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: contents },
      )
      if (!res.ok) throw new Error(`Drive update failed: ${res.status}`)
      return
    }
    const boundary = 'eduquest_' + Math.random().toString(36).slice(2)
    const metadata = { name, parents: ['appDataFolder'] }
    const multipart =
      `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\n` +
      'Content-Type: application/json\r\n\r\n' +
      contents +
      `\r\n--${boundary}--`
    const res = await this.authedFetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      { method: 'POST', headers: { 'content-type': `multipart/related; boundary=${boundary}` }, body: multipart },
    )
    if (!res.ok) throw new Error(`Drive create failed: ${res.status}`)
  }

  async deleteAppDataFile(name: string): Promise<void> {
    const id = await this.findFileId(name)
    if (!id) return
    const res = await this.authedFetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok && res.status !== 404) throw new Error(`Drive delete failed: ${res.status}`)
  }
}

export interface ConnectableDriveClient extends DriveClient {
  signIn: () => Promise<void>
}

export async function createDriveClient(): Promise<ConnectableDriveClient> {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error('Google Drive is not configured (set VITE_GOOGLE_CLIENT_ID).')
  }
  return new GoogleDriveClientImpl(clientId)
}

export async function signOutDrive(): Promise<void> {
  if (accessToken && window.google?.accounts?.oauth2) {
    const token = accessToken
    await new Promise<void>((resolve) => window.google!.accounts.oauth2.revoke(token, resolve))
  }
  accessToken = null
  tokenExpiry = 0
}
