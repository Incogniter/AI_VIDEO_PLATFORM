import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { ArrowLeft, Mail, Phone, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { normalizePhoneNumber } from '../../auth/phone'
import { createDeviceLoginRequest } from '../../api/auth'
import { listenForDeviceLogin } from '../../auth/deviceLogin'
import { AUTH_DEVICE_LOGIN_REQUEST_KEY, USER_FACING_ERRORS } from '../../constants/app'
import './AuthDialog.css'

type Props = { open: boolean; onClose: () => void; onAuthenticated: () => void }
type SignInMethod = 'email' | 'phone'
type AuthStep = 'identifier' | 'code' | 'link-sent'

export function AuthDialog({ open, onClose, onAuthenticated }: Props) {
  const { isSupabaseConfigured, signInWithGoogle, sendMagicLink, sendPhoneOtp, verifyPhoneOtp } = useAuth()
  const [method, setMethod] = useState<SignInMethod>('email')
  const [step, setStep] = useState<AuthStep>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const waitGeneration = useRef(0)
  const waitController = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) return
    waitGeneration.current += 1
    waitController.current?.abort()
    waitController.current = null
    window.sessionStorage.removeItem(AUTH_DEVICE_LOGIN_REQUEST_KEY)
    setMethod('email')
    setStep('identifier')
    setIdentifier('')
    setCode('')
    setMessage('')
    setError('')
  }, [open])

  function resetAndClose() {
    waitGeneration.current += 1
    waitController.current?.abort()
    setStep('identifier')
    setIdentifier('')
    setCode('')
    setMessage('')
    setError('')
    onClose()
  }

  async function sendEmailSignIn(email: string) {
    const loginRequest = await createDeviceLoginRequest(email)
    waitGeneration.current += 1
    waitController.current?.abort()

    window.sessionStorage.setItem(AUTH_DEVICE_LOGIN_REQUEST_KEY, JSON.stringify(loginRequest))
    const controller = new AbortController()
    waitController.current = controller
    const listener = listenForDeviceLogin(loginRequest, controller.signal)

    try {
      await listener.ready
      await sendMagicLink(email, loginRequest.request_id)
    } catch (error) {
      controller.abort()
      throw error
    }

    setStep('link-sent')
    setMessage(`We sent a sign-in link to ${email}. Open it on your other device. Keep this page open to finish signing in here.`)
    const generation = ++waitGeneration.current
    void listener.approved.then(() => {
      if (generation === waitGeneration.current) setMessage('You are signed in. Opening your account…')
    }).catch(() => {
      if (generation === waitGeneration.current) setError('We could not complete this sign-in. Request a new link and try again.')
    })
  }

  async function submitIdentifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isSupabaseConfigured) return
    setError('')
    const signInIdentifier = method === 'phone'
      ? normalizePhoneNumber(identifier)
      : identifier.trim()
    if (!signInIdentifier) {
      setError('Enter a number with its country code.' )
      return
    }

    setBusy(true)
    try {
      if (method === 'email') {
        await sendEmailSignIn(signInIdentifier)
      } else {
        setIdentifier(signInIdentifier)
        await sendPhoneOtp(signInIdentifier)
        setStep('code')
        setMessage(`We sent a one-time code to ${signInIdentifier}.`)
      }
    } catch {
      waitController.current?.abort()
      setError(USER_FACING_ERRORS.authSend)
    } finally {
      setBusy(false)
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isSupabaseConfigured) return
    setBusy(true)
    setError('')
    try {
      await verifyPhoneOtp(identifier.trim(), code.trim())
      onAuthenticated()
      setStep('identifier')
      setCode('')
      setMessage('')
    } catch {
      setError(USER_FACING_ERRORS.authVerify)
    } finally {
      setBusy(false)
    }
  }

  async function googleSignIn() {
    if (!isSupabaseConfigured) return
    setBusy(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch {
      setError(USER_FACING_ERRORS.authGoogle)
      setBusy(false)
    }
  }

  async function resendSignIn() {
    if (!isSupabaseConfigured) return
    setBusy(true)
    setError('')
    try {
      if (method === 'email') {
        await sendEmailSignIn(identifier.trim())
      } else {
        const phone = normalizePhoneNumber(identifier)
        if (!phone) throw new Error('Enter a valid phone number with its country code.')
        await sendPhoneOtp(phone)
        setMessage(`A new one-time code was sent to ${phone}.`)
      }
    } catch {
      waitController.current?.abort()
      setError(USER_FACING_ERRORS.authResend)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm" aria-labelledby="auth-dialog-title" PaperProps={{ className: 'auth-dialog-paper' }}>
      <DialogTitle className="auth-dialog-title" id="auth-dialog-title">
        <span className="auth-brand"><span className="brand-mark"><span /></span>streamline</span>
        <button type="button" className="icon-button" onClick={resetAndClose} aria-label="Close sign-in"><X size={19} /></button>
      </DialogTitle>
      <DialogContent className="auth-dialog-content">
        {step === 'identifier' ? <>
          <div className="auth-intro"><p className="eyebrow">WELCOME</p><h2>Sign in or create account</h2><p>Continue to your videos, messages, and creator space.</p></div>
          <Button className="google-auth-button" fullWidth variant="outlined" onClick={googleSignIn} disabled={!isSupabaseConfigured || busy}>
            <span className="google-g">G</span> Continue with Google
          </Button>
          <div className="auth-divider"><span>or continue with email or phone</span></div>
          <div className="auth-method-toggle" role="tablist" aria-label="Choose email or phone">
            <button type="button" role="tab" aria-selected={method === 'email'} className={method === 'email' ? 'selected' : ''} onClick={() => { setMethod('email'); setError('') }}><Mail size={15} /> Email</button>
            <button type="button" role="tab" aria-selected={method === 'phone'} className={method === 'phone' ? 'selected' : ''} onClick={() => { setMethod('phone'); setError('') }}><Phone size={15} /> Phone</button>
          </div>
          <form className="auth-form" onSubmit={submitIdentifier}>
            <label className="form-field">
              <span>{method === 'email' ? 'Email address' : 'Phone number'}</span>
              <input type={method === 'email' ? 'email' : 'tel'} inputMode={method === 'email' ? 'email' : 'tel'} autoComplete={method === 'email' ? 'email' : 'tel'} placeholder={method === 'email' ? 'you@example.com' : '+91 98765 43210'} value={identifier} onChange={(event) => setIdentifier(event.target.value)} required disabled={!isSupabaseConfigured} />
              {method === 'phone' && <small>Enter a number with its country code.</small>}
            </label>
            <Button type="submit" variant="contained" fullWidth disabled={!isSupabaseConfigured || !identifier.trim() || busy}>{busy ? 'Sending…' : method === 'email' ? 'Email me a sign-in link' : 'Send one-time code'}</Button>
          </form>
        </> : <>
          <button type="button" className="auth-back-button" onClick={() => { setStep('identifier'); setCode(''); setError('') }}><ArrowLeft size={15} /> Change {method === 'email' ? 'email' : 'phone'}</button>
          <div className="auth-intro"><p className="eyebrow">{step === 'link-sent' ? 'CONFIRM YOUR LOGIN' : 'VERIFY YOUR ACCOUNT'}</p><h2>{step === 'link-sent' ? 'Check your email' : 'Check your phone'}</h2><p>{step === 'link-sent' ? message : message || `Enter the code sent to ${identifier}.`}</p></div>
          {step === 'code' && <form className="auth-form" onSubmit={submitCode}>
            <label className="form-field">
              <span>One-time code</span>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={8} placeholder="Enter your code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} required disabled={!isSupabaseConfigured} />
            </label>
            <Button type="submit" variant="contained" fullWidth disabled={!isSupabaseConfigured || !code.trim() || busy}>{busy ? 'Verifying…' : 'Verify and continue'}</Button>
          </form>}
          {step === 'link-sent' && <p className="auth-link-instructions">Open the email on your other device and tap the sign-in link. This device will sign in automatically after you confirm.</p>}
          <button type="button" className="auth-resend" onClick={resendSignIn} disabled={!isSupabaseConfigured || busy}>{method === 'email' ? 'Resend sign-in link' : 'Resend code'}</button>
        </>}
        {!isSupabaseConfigured && <p className="auth-error" role="status">Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend environment to enable sign-in.</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-footnote">By continuing, you agree to Streamline’s terms and privacy policy.</p>
      </DialogContent>
    </Dialog>
  )
}
