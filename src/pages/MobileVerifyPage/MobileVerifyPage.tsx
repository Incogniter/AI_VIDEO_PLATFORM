import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { approveDeviceLoginRequest } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { APP_ROUTES, AUTH_CALLBACK_COPY, AUTH_CALLBACK_SESSION_WAIT_MS, AUTH_PENDING_ROUTE_KEY } from '../../constants/app'
import './MobileVerifyPage.css'

type CallbackStatus = 'confirming' | 'confirmed' | 'failed'

export default function MobileVerifyPage() {
  const [params] = useSearchParams()
  const { user, isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [callbackStatus, setCallbackStatus] = useState<CallbackStatus>('confirming')
  const started = useRef(false)
  const requestId = params.get('deviceLoginRequestId')

  useEffect(() => {
    if (isAuthLoading || started.current) return
    if (!requestId) {
      started.current = true
      setCallbackStatus('failed')
      return
    }
    const deviceRequestId = requestId
    // Supabase may finish restoring the verified link session just after the
    // initial auth-loading state changes. Wait for that auth event before failing.
    if (!user) return

    started.current = true
    setCallbackStatus('confirming')
    async function approve() {
      try {
        await approveDeviceLoginRequest(deviceRequestId)
        setCallbackStatus('confirmed')
        const nextRoute = window.sessionStorage.getItem(AUTH_PENDING_ROUTE_KEY)
        const safeNextRoute = nextRoute?.startsWith('/') && !nextRoute.startsWith('//')
          ? nextRoute
          : APP_ROUTES.home
        window.sessionStorage.removeItem(AUTH_PENDING_ROUTE_KEY)
        navigate(safeNextRoute, { replace: true })
      } catch {
        setCallbackStatus('failed')
      }
    }
    void approve()
  }, [isAuthLoading, navigate, requestId, user])

  useEffect(() => {
    if (isAuthLoading || user || !requestId || started.current) return
    const timer = window.setTimeout(() => setCallbackStatus('failed'), AUTH_CALLBACK_SESSION_WAIT_MS)
    return () => window.clearTimeout(timer)
  }, [isAuthLoading, requestId, user])

  const failed = callbackStatus === 'failed'
  const title = callbackStatus === 'confirmed'
    ? AUTH_CALLBACK_COPY.confirmedTitle
    : failed
      ? AUTH_CALLBACK_COPY.failedTitle
      : AUTH_CALLBACK_COPY.confirmingTitle
  const message = callbackStatus === 'confirmed'
    ? AUTH_CALLBACK_COPY.confirmedMessage
    : failed
      ? AUTH_CALLBACK_COPY.failedMessage
      : AUTH_CALLBACK_COPY.confirmingMessage

  return (
    <main className="mobile-verify-page">
      <section className="mobile-verify-card" aria-live="polite">
        <div className="mobile-verify-main">
          <span className={`mobile-verify-mark${failed ? ' is-error' : callbackStatus === 'confirming' ? ' is-loading' : ''}`} aria-hidden="true">{failed ? '!' : callbackStatus === 'confirmed' ? '✓' : ''}</span>
          <p className="mobile-verify-brand">streamline</p>
          <h1>{title}</h1>
          <p className="mobile-verify-message">{message}</p>
        </div>
        <aside className="mobile-verify-next">
          <p className="mobile-verify-step">NEXT</p>
          <h2>{failed ? 'Request a fresh sign-in link' : callbackStatus === 'confirmed' ? 'Return to your other device' : 'Please wait a moment'}</h2>
          <p>{failed ? 'Go back to the device where you started and send a new sign-in link.' : callbackStatus === 'confirmed' ? 'The device where you requested the sign-in will finish logging in automatically.' : 'We are checking your sign-in request.'}</p>
          {callbackStatus === 'confirmed' && <p>You can close this page now.</p>}
        </aside>
      </section>
    </main>
  )
}
