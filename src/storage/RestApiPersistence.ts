import type { PersistedSnapshot, SnapshotPersistence } from './types'

/**
 * Reference implementation for switching to a real server/database later.
 *
 * Nothing else in the app changes: construct this instead of (or alongside)
 * GoogleDrivePersistence and hand it to the SyncEngine. The contract is
 * identical — load/save a snapshot. A production server would expose, e.g.:
 *
 *   GET  /api/save   -> 200 { snapshot } | 404
 *   PUT  /api/save   <- { snapshot }
 *   DELETE /api/save
 *
 * For a more granular SQL/NoSQL backend you would instead implement a
 * per-collection repository; the SnapshotPersistence seam keeps that change
 * isolated to this folder.
 */
export class RestApiPersistence implements SnapshotPersistence {
  readonly id = 'rest'
  readonly label = 'Server'

  constructor(
    private readonly baseUrl: string,
    private readonly getAuthToken: () => string | null = () => null,
  ) {}

  isAvailable(): boolean {
    return Boolean(this.baseUrl)
  }

  private headers(): HeadersInit {
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    const token = this.getAuthToken()
    if (token) headers.authorization = `Bearer ${token}`
    return headers
  }

  async load(): Promise<PersistedSnapshot | null> {
    const res = await fetch(`${this.baseUrl}/save`, { headers: this.headers() })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`load failed: ${res.status}`)
    const body = (await res.json()) as { snapshot: PersistedSnapshot }
    return body.snapshot
  }

  async save(snapshot: PersistedSnapshot): Promise<void> {
    const res = await fetch(`${this.baseUrl}/save`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify({ snapshot }),
    })
    if (!res.ok) throw new Error(`save failed: ${res.status}`)
  }

  async clear(): Promise<void> {
    await fetch(`${this.baseUrl}/save`, { method: 'DELETE', headers: this.headers() })
  }
}
