import type { SubjectColor } from '@/domain/types'

/** Light tint behind a subject icon, keyed by palette slot. */
export const SUBJECT_BG: Record<SubjectColor, string> = {
  english: '#EDE7FF',
  math: '#FFE8E8',
  science: '#E0F8F8',
  art: '#FFF2E5',
  music: '#FFE8F0',
  coding: '#E8F0FF',
}

/** CSS variable for a subject's accent color. */
export function subjectVar(color: SubjectColor): string {
  return `var(--color-${color})`
}

export function bgFor(color: SubjectColor | undefined): string {
  return SUBJECT_BG[color ?? 'english']
}
