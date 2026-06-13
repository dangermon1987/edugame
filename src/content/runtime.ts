import { create } from 'zustand'
import coreData from './core.package.json'
import {
  normalizeContentPackage,
  validateContentPackage,
  type ContentPackage,
  type LoadedContent,
} from './schema'

const ACTIVE_KEY = 'eduquest.content' // cached active package JSON
const STICKER_RARITY_LABEL = {
  common: '⬜ Common',
  rare: '🟦 Rare',
  epic: '🟪 Epic',
  shiny: '🌟 Shiny',
} as const
export const RARITY_LABEL = STICKER_RARITY_LABEL

/** Built-in package, always available (bundled). Source of truth fallback. */
export const CORE_PACKAGE = coreData as unknown as ContentPackage

export interface ManifestEntry {
  id: string
  name: string
  description: string
  cover: string
  file: string
}

interface ContentStore {
  content: LoadedContent
  activeId: string
  status: 'ready' | 'loading' | 'error'
  error: string | null
  manifest: ManifestEntry[]
  /** Validate + normalize + activate + cache a raw package object. */
  setPackage: (pkg: unknown) => { ok: boolean; errors: string[] }
  /** Fetch the manifest of installable packages from the static /content folder. */
  refreshManifest: () => Promise<void>
  /** Switch to a package by manifest id (fetches its file). */
  switchTo: (id: string) => Promise<{ ok: boolean; errors: string[] }>
  /** Import a package from uploaded file text. */
  uploadPackage: (text: string) => { ok: boolean; errors: string[] }
  /** Reset to the built-in core package. */
  resetToCore: () => void
}

function base(): string {
  return import.meta.env.BASE_URL || '/'
}

function cacheActive(pkg: ContentPackage): void {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(pkg))
  } catch {
    /* ignore quota errors */
  }
}

/** Synchronous boot: use the cached active package if valid, else built-in core. */
function bootContent(): { content: LoadedContent; activeId: string } {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (raw) {
      const pkg = JSON.parse(raw) as ContentPackage
      if (validateContentPackage(pkg).ok) {
        return { content: normalizeContentPackage(pkg), activeId: pkg.meta.id }
      }
    }
  } catch {
    /* fall through to core */
  }
  return { content: normalizeContentPackage(CORE_PACKAGE), activeId: CORE_PACKAGE.meta.id }
}

const boot = bootContent()

export const useContentStore = create<ContentStore>((set, get) => ({
  content: boot.content,
  activeId: boot.activeId,
  status: 'ready',
  error: null,
  manifest: [],

  setPackage: (input) => {
    const result = validateContentPackage(input)
    if (!result.ok) {
      set({ status: 'error', error: result.errors.join('; ') })
      return { ok: false, errors: result.errors }
    }
    const pkg = input as ContentPackage
    cacheActive(pkg)
    set({
      content: normalizeContentPackage(pkg),
      activeId: pkg.meta.id,
      status: 'ready',
      error: null,
    })
    return { ok: true, errors: [] }
  },

  refreshManifest: async () => {
    try {
      const res = await fetch(`${base()}content/index.json`)
      if (!res.ok) return
      const data = (await res.json()) as { packages?: ManifestEntry[] }
      if (Array.isArray(data.packages)) set({ manifest: data.packages })
    } catch {
      /* offline — keep whatever we have */
    }
  },

  switchTo: async (id) => {
    if (id === 'core') {
      get().resetToCore()
      return { ok: true, errors: [] }
    }
    const entry = get().manifest.find((m) => m.id === id)
    if (!entry) return { ok: false, errors: [`Unknown package "${id}"`] }
    set({ status: 'loading', error: null })
    try {
      const res = await fetch(`${base()}content/${entry.file}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const pkg = await res.json()
      return get().setPackage(pkg)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      set({ status: 'error', error: msg })
      return { ok: false, errors: [msg] }
    }
  },

  uploadPackage: (text) => {
    try {
      return get().setPackage(JSON.parse(text))
    } catch {
      return { ok: false, errors: ['File is not valid JSON'] }
    }
  },

  resetToCore: () => {
    cacheActive(CORE_PACKAGE)
    set({
      content: normalizeContentPackage(CORE_PACKAGE),
      activeId: CORE_PACKAGE.meta.id,
      status: 'ready',
      error: null,
    })
  },
}))

/** Non-hook accessor for use in stores / plain functions. */
export function getContent(): LoadedContent {
  return useContentStore.getState().content
}

/** Returns the currently-active raw package (for export / Drive upload). */
export function getActivePackageJson(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) ?? JSON.stringify(CORE_PACKAGE)
  } catch {
    return JSON.stringify(CORE_PACKAGE)
  }
}

/** Convenience hook: select a slice of the loaded content. */
export function useContent<T>(selector: (c: LoadedContent) => T): T {
  return useContentStore((s) => selector(s.content))
}

const DRIVE_CONTENT_FILE = 'eduquest-content.json'

/** Save the active course package to Google Drive (requires Drive connected). */
export async function saveContentToDrive(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { createDriveClient } = await import('@/lib/googleDrive')
    const client = await createDriveClient()
    if (!client.isSignedIn()) return { ok: false, error: 'Connect Google Drive first' }
    await client.writeAppDataFile(DRIVE_CONTENT_FILE, getActivePackageJson())
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Load a course package previously saved to Google Drive. */
export async function loadContentFromDrive(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { createDriveClient } = await import('@/lib/googleDrive')
    const client = await createDriveClient()
    if (!client.isSignedIn()) return { ok: false, error: 'Connect Google Drive first' }
    const text = await client.readAppDataFile(DRIVE_CONTENT_FILE)
    if (!text) return { ok: false, error: 'No course found in Drive' }
    const result = useContentStore.getState().setPackage(JSON.parse(text))
    return result.ok ? { ok: true } : { ok: false, error: result.errors.join('; ') }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
