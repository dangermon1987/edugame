import type { PersistedSnapshot, SnapshotPersistence } from './types'

/**
 * Primary, always-available persistence. Synchronous under the hood (so the app
 * can hydrate instantly on boot) but exposed through the async interface.
 *
 * This is the "browser NoSQL database": the snapshot's `data` field holds
 * document collections (maps keyed by id), serialized as JSON.
 */
export class LocalStoragePersistence implements SnapshotPersistence {
  readonly id = 'localStorage'
  readonly label = 'This device'

  constructor(private readonly key = 'eduquest.db') {}

  isAvailable(): boolean {
    return typeof localStorage !== 'undefined'
  }

  /** Synchronous load for boot-time hydration. */
  loadSync(): PersistedSnapshot | null {
    try {
      const raw = localStorage.getItem(this.key)
      return raw ? (JSON.parse(raw) as PersistedSnapshot) : null
    } catch {
      return null
    }
  }

  async load(): Promise<PersistedSnapshot | null> {
    return this.loadSync()
  }

  /** Synchronous save so we never lose data on a page-unload race. */
  saveSync(snapshot: PersistedSnapshot): void {
    localStorage.setItem(this.key, JSON.stringify(snapshot))
  }

  async save(snapshot: PersistedSnapshot): Promise<void> {
    this.saveSync(snapshot)
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.key)
  }
}
