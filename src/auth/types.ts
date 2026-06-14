export type AuthProviderKind = 'local' | 'google' | 'guest'

export interface Account {
  id: string
  username: string
  displayName: string
  avatar: string
  provider: AuthProviderKind
  email?: string
  /** Present only for local accounts. */
  passwordHash?: string
  salt?: string
  createdAt: number
}

/** Public view of an account (no secrets) for the UI. */
export interface PublicAccount {
  id: string
  username: string
  displayName: string
  avatar: string
  provider: AuthProviderKind
}

export interface SignUpInput {
  username: string
  password: string
  displayName: string
  avatar?: string
}

/**
 * The swappable authentication boundary. The app only depends on this; a real
 * server-backed provider can replace LocalAuthProvider without UI changes.
 */
export interface AuthProvider {
  listAccounts(): PublicAccount[]
  /** The account for the active session, or null. */
  current(): PublicAccount | null
  signUp(input: SignUpInput): Promise<PublicAccount>
  signIn(username: string, password: string): Promise<PublicAccount>
  signInWithGoogle(): Promise<PublicAccount>
  signInGuest(): PublicAccount
  getSession(): string | null
  setSession(id: string | null): void
}
