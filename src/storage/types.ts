/**
 * Storage abstraction layer.
 *
 * The app is "local-first": all reads/writes go to a fast local store
 * (localStorage) and a SyncEngine periodically mirrors a snapshot to a remote
 * persistence target (Google Drive today, a REST/SQL server tomorrow).
 *
 * The ONLY thing you implement to switch backends is `SnapshotPersistence`.
 * Nothing in the UI or domain layer knows where bytes actually live.
 */

/** Monotonic schema version so we can migrate persisted data over time. */
export const SCHEMA_VERSION = 1

/** A complete, serializable snapshot of the app database. */
export interface PersistedSnapshot<T = unknown> {
  schemaVersion: number
  /** Epoch ms of the last local mutation contained in `data`. Drives conflict resolution. */
  updatedAt: number
  /** Stable per-browser id, used to detect cross-device edits. */
  deviceId: string
  /** The actual document collections / app state. */
  data: T
}

/**
 * The swappable persistence boundary. Implementations: localStorage, Google
 * Drive appDataFolder, an in-memory stub (tests), and a REST server stub.
 */
export interface SnapshotPersistence {
  /** Stable identifier, e.g. "localStorage" | "googleDrive" | "rest". */
  readonly id: string
  /** Human label for UI ("This device", "Google Drive"). */
  readonly label: string
  /** Whether this target is currently usable (e.g. Drive is connected). */
  isAvailable(): boolean
  /** Load the latest snapshot, or null if none exists yet. */
  load(): Promise<PersistedSnapshot | null>
  /** Persist a snapshot, overwriting any previous one. */
  save(snapshot: PersistedSnapshot): Promise<void>
  /** Remove the stored snapshot (used for reset / disconnect). */
  clear(): Promise<void>
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'disabled'

export interface SyncState {
  status: SyncStatus
  lastSyncedAt: number | null
  error: string | null
  remoteLabel: string | null
}
