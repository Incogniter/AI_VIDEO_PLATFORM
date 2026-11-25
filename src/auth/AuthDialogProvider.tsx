import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthDialog } from '../components/AuthDialog/AuthDialog'
import { AUTH_PENDING_ROUTE_KEY } from '../constants/app'
import { useAuth } from './AuthProvider'

type AuthDialogContextValue = { requestAuth: (nextRoute?: string) => void }
const AuthDialogContext = createContext<AuthDialogContextValue | null>(null)

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthLoading } = useAuth()

  function requestAuth(nextRoute?: string) {
    if (nextRoute) window.sessionStorage.setItem(AUTH_PENDING_ROUTE_KEY, nextRoute)
    setOpen(true)
  }

  function onAuthenticated() {
    setOpen(false)
    const nextRoute = window.sessionStorage.getItem(AUTH_PENDING_ROUTE_KEY)
    window.sessionStorage.removeItem(AUTH_PENDING_ROUTE_KEY)
    if (nextRoute) navigate(nextRoute, { replace: true })
  }

  function closeAuth() {
    setOpen(false)
    window.sessionStorage.removeItem(AUTH_PENDING_ROUTE_KEY)
  }

  useEffect(() => {
    if (isAuthLoading || !user) return
    setOpen(false)
    const nextRoute = window.sessionStorage.getItem(AUTH_PENDING_ROUTE_KEY)
    if (!nextRoute) return
    window.sessionStorage.removeItem(AUTH_PENDING_ROUTE_KEY)
    setOpen(false)
    navigate(nextRoute, { replace: true })
  }, [user, isAuthLoading, navigate])

  return (
    <AuthDialogContext.Provider value={{ requestAuth }}>
      {children}
      <AuthDialog open={open} onClose={closeAuth} onAuthenticated={onAuthenticated} />
    </AuthDialogContext.Provider>
  )
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext)
  if (!context) throw new Error('useAuthDialog must be used within AuthDialogProvider.')
  return context
}
