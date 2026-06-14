import { en, type Strings } from './en'
import { vi } from './vi'
import { zh } from './zh'
import { ja } from './ja'
import { useContentStore } from '@/content/runtime'

export type { Strings } from './en'

const DICTS: Record<string, Strings> = { en, vi, zh, ja }
export const LOCALES = Object.keys(DICTS)

/** Resolve a (possibly regioned) locale code to a dictionary, falling back to en. */
export function getStrings(locale: string | undefined): Strings {
  if (!locale) return en
  const base = locale.toLowerCase().split('-')[0]
  return DICTS[base] ?? en
}

/** Non-hook accessor for use in the store / plain functions. */
export function getT(): Strings {
  return getStrings(useContentStore.getState().content.meta.locale)
}

/** React hook: returns the string table for the active course's locale. */
export function useT(): Strings {
  return useContentStore((s) => getStrings(s.content.meta.locale))
}
