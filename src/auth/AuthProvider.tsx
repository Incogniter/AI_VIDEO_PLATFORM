import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'

type OtpMethod = 'email' | 'phone'

type AuthContextValue = {
  user: User | null
  isAuthLoading: boolean
  isSupabaseConfigured: boolean
  signInWithGoogle: () => Promise<void>
  sendOtp: (identifier: string, method: OtpMethod) => Promise<void>
  verifyOtp: (identifier: string, method: OtpMethod, token: string) => Promise<void>
  updateDisplayName: (displayName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function requireSupabase() {
  if (!supabase) throw new Error('Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
  return supabase
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false)
      return
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (!error) setUser(data.session?.user ?? null)
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

  async function sendOtp(identifier: string, method: OtpMethod) {
    const client = requireSupabase()
    const result = method === 'email'
      ? await client.auth.signInWithOtp({ email: identifier, options: { shouldCreateUser: true } })
      : await client.auth.signInWithOtp({ phone: identifier, options: { shouldCreateUser: true } })
    if (result.error) throw result.error
  }

  async function verifyOtp(identifier: string, method: OtpMethod, token: string) {
    const client = requireSupabase()
    const result = method === 'email'
      ? await client.auth.verifyOtp({ email: identifier, token, type: 'email' })
      : await client.auth.verifyOtp({ phone: identifier, token, type: 'sms' })
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

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, isSupabaseConfigured, signInWithGoogle, sendOtp, verifyOtp, updateDisplayName, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
