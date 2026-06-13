import type { PersistedSnapshot, SnapshotPersistence } from './types'

/**
 * Minimal contract the Drive client must satisfy. Implemented by
 * `src/lib/googleDrive.ts` using Google Identity Services + the Drive REST API.
 * Kept as an interface so the persistence layer is testable without real OAuth.
 */
export interface DriveClient {
  isSignedIn(): boolean
  /** Read the contents of the app-data file, or null if it does not exist. */
  readAppDataFile(name: string): Promise<string | null>
  /** Create or overwrite the app-data file with the given text. */
  writeAppDataFile(name: string, contents: string): Promise<void>
  /** Delete the app-data file if present. */
  deleteAppDataFile(name: string): Promise<void>
}

/**
 * Long-term persistence to the user's Google Drive (hidden appDataFolder).
 * The file is invisible in the user's normal Drive view and only accessible by
 * this app — appropriate for per-user game saves.
 */
export class GoogleDrivePersistence implements SnapshotPersistence {
  readonly id = 'googleDrive'
  readonly label = 'Google Drive'
  private readonly fileName = 'eduquest-save.json'

  constructor(private readonly client: DriveClient) {}

  isAvailable(): boolean {
    return this.client.isSignedIn()
  }

  async load(): Promise<PersistedSnapshot | null> {
    const text = await this.client.readAppDataFile(this.fileName)
    if (!text) return null
    try {
      return JSON.parse(text) as PersistedSnapshot
    } catch {
      return null
    }
  }

  async save(snapshot: PersistedSnapshot): Promise<void> {
    await this.client.writeAppDataFile(this.fileName, JSON.stringify(snapshot))
  }

  async clear(): Promise<void> {
    await this.client.deleteAppDataFile(this.fileName)
  }
}
