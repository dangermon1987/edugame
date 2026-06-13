import type { PersistedSnapshot, SnapshotPersistence, SyncState } from './types'

export interface SyncEngineOptions {
  /** How often to sync, in ms. Spec asks for every 5 minutes. */
  intervalMs?: number
  /** Returns the current local snapshot to push. */
  getSnapshot: () => PersistedSnapshot
  /** Applies a remote snapshot that won conflict resolution. */
  applyRemote: (snapshot: PersistedSnapshot) => void
  /** Notified whenever sync state changes (for UI). */
  onStateChange?: (state: SyncState) => void
  /** Injectable clock for tests. */
  now?: () => number
}

/**
 * Coordinates the local-first model: a periodic loop that mirrors the local
 * snapshot to a remote target and pulls remote changes.
 *
 * Conflict resolution is snapshot-level last-write-wins by `updatedAt`. This is
 * deliberately simple and predictable for a single-user game save across a
 * couple of devices; the seam (`applyRemote`) allows a smarter merge later.
 */
export class SyncEngine {
  private remote: SnapshotPersistence | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private inFlight = false
  private readonly intervalMs: number
  private readonly now: () => number
  private state: SyncState = {
    status: 'disabled',
    lastSyncedAt: null,
    error: null,
    remoteLabel: null,
  }

  constructor(private readonly opts: SyncEngineOptions) {
    this.intervalMs = opts.intervalMs ?? 5 * 60 * 1000
    this.now = opts.now ?? (() => Date.now())
  }

  getState(): SyncState {
    return this.state
  }

  private setState(patch: Partial<SyncState>): void {
    this.state = { ...this.state, ...patch }
    this.opts.onStateChange?.(this.state)
  }

  /** Attach (or detach) a remote target and (re)start the loop. */
  setRemote(remote: SnapshotPersistence | null): void {
    this.remote = remote
    if (remote) {
      this.setState({ status: 'idle', remoteLabel: remote.label, error: null })
      this.start()
      // Kick an immediate sync so a freshly-connected device pulls its save.
      void this.syncNow()
    } else {
      this.stop()
      this.setState({ status: 'disabled', remoteLabel: null })
    }
  }

  start(): void {
    if (this.timer || !this.remote) return
    this.timer = setInterval(() => void this.syncNow(), this.intervalMs)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /** Run a single sync cycle. Safe to call concurrently (re-entrancy guarded). */
  async syncNow(): Promise<void> {
    if (!this.remote || this.inFlight) return
    if (!this.remote.isAvailable()) {
      this.setState({ status: 'offline' })
      return
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.setState({ status: 'offline' })
      return
    }

    this.inFlight = true
    this.setState({ status: 'syncing', error: null })
    try {
      const local = this.opts.getSnapshot()
      const remoteSnap = await this.remote.load()

      if (!remoteSnap) {
        // First sync on this account — seed the remote with local data.
        await this.remote.save(local)
      } else if (remoteSnap.updatedAt > local.updatedAt) {
        // Remote is newer (edited on another device) — adopt it.
        this.opts.applyRemote(remoteSnap)
      } else if (local.updatedAt > remoteSnap.updatedAt) {
        // Local is newer — push it.
        await this.remote.save(local)
      }
      // Equal timestamps: assume in sync, do nothing.

      this.setState({ status: 'synced', lastSyncedAt: this.now(), error: null })
    } catch (err) {
      this.setState({
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      this.inFlight = false
    }
  }

  /** Force-push local to remote (e.g. right after an important change). */
  async pushNow(): Promise<void> {
    if (!this.remote || !this.remote.isAvailable()) return
    try {
      await this.remote.save(this.opts.getSnapshot())
      this.setState({ status: 'synced', lastSyncedAt: this.now() })
    } catch (err) {
      this.setState({ status: 'error', error: err instanceof Error ? err.message : String(err) })
    }
  }

  dispose(): void {
    this.stop()
  }
}
