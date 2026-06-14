/**
 * Lightweight password hashing for local (offline, static-site) accounts.
 * Uses Web Crypto SHA-256 over a per-account random salt. This is NOT a
 * substitute for server-side auth — it keeps casual local profiles separated.
 * A real backend would replace AuthProvider entirely (the seam is designed for it).
 */
export function randomSalt(): string {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
