import type { PersistedSnapshot, SnapshotPersistence } from './types'

/** In-memory persistence for tests and SSR fallback. */
export class MemoryPersistence implements SnapshotPersistence {
  readonly id = 'memory'
  readonly label = 'In-memory'
  private snapshot: PersistedSnapshot | null = null

  constructor(initial: PersistedSnapshot | null = null) {
    this.snapshot = initial
  }

  isAvailable(): boolean {
    return true
  }

  async load(): Promise<PersistedSnapshot | null> {
    return this.snapshot ? structuredClone(this.snapshot) : null
  }

  async save(snapshot: PersistedSnapshot): Promise<void> {
    this.snapshot = structuredClone(snapshot)
  }

  async clear(): Promise<void> {
    this.snapshot = null
  }
}
