import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { approveDeviceLoginRequest } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import './MobileVerifyPage.css'

export default function MobileVerifyPage() {
  const [params] = useSearchParams()
  const { user, isAuthLoading, signOutLocal } = useAuth()
  const [message, setMessage] = useState('Confirming your sign-in…')
  const [failed, setFailed] = useState(false)
  const started = useRef(false)
  const requestId = params.get('deviceLoginRequestId')

  useEffect(() => {
    if (isAuthLoading || started.current) return
    started.current = true
    let active = true
    async function approve() {
      if (!requestId || !user) {
        if (active) {
          setFailed(true)
          setMessage('This sign-in link could not be confirmed. Request a new link and try again.')
        }
        return
      }
      try {
        await approveDeviceLoginRequest(requestId)
        try { await signOutLocal() } catch { /* Approval already succeeded; keep the confirmation message accurate. */ }
        if (active) setMessage('Sign-in confirmed. Return to your other device; it should now be signed in.')
      } catch {
        try { await signOutLocal() } catch { /* Keep callback errors private from the UI. */ }
        if (active) {
          setFailed(true)
          setMessage('This sign-in request could not be confirmed. Return to your other device and request a new link.')
        }
      }
    }
    void approve()
    return () => { active = false }
  }, [isAuthLoading, requestId, signOutLocal, user])

  return (
    <main className="mobile-verify-page">
      <section className="mobile-verify-card" aria-live="polite">
        <div className="mobile-verify-main">
          <span className={`mobile-verify-mark${failed ? ' is-error' : ''}`}>{failed ? '!' : '✓'}</span>
          <p className="mobile-verify-brand">streamline</p>
          <h1>{failed ? 'Sign-in not confirmed' : 'Confirm your login'}</h1>
          <p className="mobile-verify-message">{message}</p>
        </div>
        <aside className="mobile-verify-next">
          <p className="mobile-verify-step">NEXT</p>
          <h2>{failed ? 'Request a fresh sign-in link' : 'Return to your other device'}</h2>
          <p>{failed ? 'Go back to the device where you started and send a new sign-in link.' : 'The device where you requested the sign-in will finish logging in automatically.'}</p>
          {!failed && <p>You can close this page after the confirmation above appears.</p>}
        </aside>
      </section>
    </main>
  )
}
