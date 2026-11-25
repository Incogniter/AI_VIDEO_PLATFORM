import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'
import { APP_ROUTES } from '../constants/app'

type AuthContextValue = {
  user: User | null
  isAuthLoading: boolean
  isSupabaseConfigured: boolean
  signInWithGoogle: () => Promise<void>
  sendMagicLink: (email: string, requestId: string) => Promise<void>
  sendPhoneOtp: (phone: string) => Promise<void>
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>
  updateDisplayName: (displayName: string) => Promise<void>
  signOut: () => Promise<void>
  signOutLocal: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function requireSupabase() {
  if (!supabase) throw new Error('Auth is not configured.')
  return supabase
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const authEventVersion = useRef(0)

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false)
      return
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventVersion.current += 1
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    const versionAtSessionLookup = authEventVersion.current
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (!error && authEventVersion.current === versionAtSessionLookup) {
        setUser(data.session?.user ?? null)
      }
      setIsAuthLoading(false)
    }).catch(() => {
      if (active) setIsAuthLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    const { error } = await requireSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function sendMagicLink(email: string, requestId: string) {
    const redirectUrl = new URL(APP_ROUTES.mobileVerify, window.location.origin)
    redirectUrl.searchParams.set('deviceLoginRequestId', requestId)
    const result = await requireSupabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl.toString(), shouldCreateUser: true },
    })
    if (result.error) throw result.error
  }

  async function sendPhoneOtp(phone: string) {
    const result = await requireSupabase().auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    })
    if (result.error) throw result.error
  }

  async function verifyPhoneOtp(phone: string, token: string) {
    const result = await requireSupabase().auth.verifyOtp({ phone, token, type: 'sms' })
    if (result.error) throw result.error
    setUser(result.data.user)
  }

  async function updateDisplayName(displayName: string) {
    const { data, error } = await requireSupabase().auth.updateUser({
      data: { display_name: displayName.trim() },
    })
    if (error) throw error
    setUser(data.user)
  }

  async function signOut() {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw error
    setUser(null)
  }

  async function signOutLocal() {
    const { error } = await requireSupabase().auth.signOut({ scope: 'local' })
    if (error) throw error
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, isSupabaseConfigured, signInWithGoogle, sendMagicLink, sendPhoneOtp, verifyPhoneOtp, updateDisplayName, signOut, signOutLocal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
