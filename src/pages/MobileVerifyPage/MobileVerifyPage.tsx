import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { approveDeviceLoginRequest } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { AUTH_CALLBACK_COPY } from '../../constants/app'
import './MobileVerifyPage.css'

type CallbackStatus = 'confirming' | 'confirmed' | 'failed'

export default function MobileVerifyPage() {
  const [params] = useSearchParams()
  const { user, isAuthLoading, signOutLocal } = useAuth()
  const [callbackStatus, setCallbackStatus] = useState<CallbackStatus>('confirming')
  const started = useRef(false)
  const requestId = params.get('deviceLoginRequestId')

  useEffect(() => {
    if (isAuthLoading || started.current) return
    started.current = true
    let active = true
    async function approve() {
      if (!requestId || !user) {
        if (active) {
          setCallbackStatus('failed')
        }
        return
      }
      try {
        await approveDeviceLoginRequest(requestId)
        try { await signOutLocal() } catch { /* Approval already succeeded; keep the confirmation message accurate. */ }
        if (active) setCallbackStatus('confirmed')
      } catch {
        try { await signOutLocal() } catch { /* Keep callback errors private from the UI. */ }
        if (active) {
          setCallbackStatus('failed')
        }
      }
    }
    void approve()
    return () => { active = false }
  }, [isAuthLoading, requestId, signOutLocal, user])

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
