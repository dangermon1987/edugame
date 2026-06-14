import type { Account, AuthProvider, PublicAccount, SignUpInput } from './types'
import { hashPassword, randomSalt } from '@/lib/password'
import { uuid } from '@/lib/id'

const ACCOUNTS_KEY = 'eduquest.accounts'
const SESSION_KEY = 'eduquest.session'

export type AuthErrorCode = 'WRONG_CREDS' | 'TAKEN' | 'TOO_SHORT' | 'NEED_NAME' | 'GOOGLE_FAILED'
export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code)
  }
}

const AVATARS = ['🦊', '🐱', '🐼', '🐯', '🐸', '🦁', '🐨', '🐧', '🦉', '🐢']

function publicView(a: Account): PublicAccount {
  return { id: a.id, username: a.username, displayName: a.displayName, avatar: a.avatar, provider: a.provider }
}

export class LocalAuthProvider implements AuthProvider {
  private read(): Account[] {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as Account[]
    } catch {
      return []
    }
  }
  private write(accounts: Account[]): void {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  }

  listAccounts(): PublicAccount[] {
    return this.read()
      .filter((a) => a.provider !== 'guest')
      .map(publicView)
  }

  async signUp({ username, password, displayName, avatar }: SignUpInput): Promise<PublicAccount> {
    const u = username.trim()
    if (u.length < 4 || password.length < 4) throw new AuthError('TOO_SHORT')
    if (!displayName.trim()) throw new AuthError('NEED_NAME')
    const accounts = this.read()
    if (accounts.some((a) => a.username.toLowerCase() === u.toLowerCase() && a.provider === 'local')) {
      throw new AuthError('TAKEN')
    }
    const salt = randomSalt()
    const account: Account = {
      id: uuid(),
      username: u,
      displayName: displayName.trim(),
      avatar: avatar || AVATARS[accounts.length % AVATARS.length],
      provider: 'local',
      passwordHash: await hashPassword(password, salt),
      salt,
      createdAt: Date.now(),
    }
    accounts.push(account)
    this.write(accounts)
    this.setSession(account.id)
    return publicView(account)
  }

  async signIn(username: string, password: string): Promise<PublicAccount> {
    const account = this.read().find(
      (a) => a.provider === 'local' && a.username.toLowerCase() === username.trim().toLowerCase(),
    )
    if (!account || !account.salt) throw new AuthError('WRONG_CREDS')
    const hash = await hashPassword(password, account.salt)
    if (hash !== account.passwordHash) throw new AuthError('WRONG_CREDS')
    this.setSession(account.id)
    return publicView(account)
  }

  async signInWithGoogle(): Promise<PublicAccount> {
    let profile: { id: string; name: string; email?: string; picture?: string }
    try {
      const { signInWithGoogle } = await import('@/lib/googleDrive')
      profile = await signInWithGoogle()
    } catch {
      throw new AuthError('GOOGLE_FAILED')
    }
    const accounts = this.read()
    const gid = `google:${profile.id}`
    let account = accounts.find((a) => a.id === gid)
    if (!account) {
      account = {
        id: gid,
        username: profile.email ?? profile.name,
        displayName: profile.name || 'Google user',
        avatar: '🧑',
        provider: 'google',
        email: profile.email,
        createdAt: Date.now(),
      }
      accounts.push(account)
      this.write(accounts)
    }
    this.setSession(account.id)
    return publicView(account)
  }

  signInGuest(): PublicAccount {
    const accounts = this.read()
    let guest = accounts.find((a) => a.id === 'guest')
    if (!guest) {
      guest = {
        id: 'guest',
        username: 'guest',
        displayName: 'Guest',
        avatar: '🙂',
        provider: 'guest',
        createdAt: Date.now(),
      }
      accounts.push(guest)
      this.write(accounts)
    }
    this.setSession('guest')
    return publicView(guest)
  }

  current(): PublicAccount | null {
    const id = this.getSession()
    if (!id) return null
    const account = this.read().find((a) => a.id === id)
    return account ? publicView(account) : null
  }

  getSession(): string | null {
    try {
      return localStorage.getItem(SESSION_KEY)
    } catch {
      return null
    }
  }
  setSession(id: string | null): void {
    try {
      if (id) localStorage.setItem(SESSION_KEY, id)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }
}
