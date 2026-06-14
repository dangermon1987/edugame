import { create } from 'zustand'
import type { PublicAccount, SignUpInput } from './types'
import { LocalAuthProvider, AuthError, type AuthErrorCode } from './local'
import { useStore } from '@/state/store'

/** Swap this line to use a server-backed provider later. */
const provider = new LocalAuthProvider()

interface AuthStore {
  account: PublicAccount | null
  /** True once we've checked for an existing session on boot. */
  ready: boolean
  bootstrap: () => void
  listAccounts: () => PublicAccount[]
  signUp: (input: SignUpInput) => Promise<{ ok: boolean; code?: AuthErrorCode }>
  signIn: (username: string, password: string) => Promise<{ ok: boolean; code?: AuthErrorCode }>
  signInGoogle: () => Promise<{ ok: boolean; code?: AuthErrorCode }>
  signInGuest: () => void
  signOut: () => void
}

function activate(account: PublicAccount) {
  // Point the user-state store at this account's namespaced save.
  useStore.getState().loadAccount(account.id)
}

export const useAuth = create<AuthStore>((set) => ({
  account: null,
  ready: false,

  bootstrap: () => {
    const account = provider.current()
    if (account) activate(account)
    set({ account, ready: true })
  },

  listAccounts: () => provider.listAccounts(),

  signUp: async (input) => {
    try {
      const account = await provider.signUp(input)
      activate(account)
      set({ account })
      return { ok: true }
    } catch (e) {
      return { ok: false, code: e instanceof AuthError ? e.code : 'WRONG_CREDS' }
    }
  },

  signIn: async (username, password) => {
    try {
      const account = await provider.signIn(username, password)
      activate(account)
      set({ account })
      return { ok: true }
    } catch (e) {
      return { ok: false, code: e instanceof AuthError ? e.code : 'WRONG_CREDS' }
    }
  },

  signInGoogle: async () => {
    try {
      const account = await provider.signInWithGoogle()
      activate(account)
      set({ account })
      return { ok: true }
    } catch (e) {
      return { ok: false, code: e instanceof AuthError ? e.code : 'GOOGLE_FAILED' }
    }
  },

  signInGuest: () => {
    const account = provider.signInGuest()
    activate(account)
    set({ account })
  },

  signOut: () => {
    provider.setSession(null)
    set({ account: null })
  },
}))
