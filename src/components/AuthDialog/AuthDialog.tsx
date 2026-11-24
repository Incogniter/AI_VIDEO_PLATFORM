import { useState, type FormEvent } from 'react'
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { ArrowLeft, Mail, Phone, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import './AuthDialog.css'

type Props = { open: boolean; onClose: () => void; onAuthenticated: () => void }
type OtpMethod = 'email' | 'phone'

export function AuthDialog({ open, onClose, onAuthenticated }: Props) {
  const { isSupabaseConfigured, signInWithGoogle, sendOtp, verifyOtp } = useAuth()
  const [method, setMethod] = useState<OtpMethod>('email')
  const [step, setStep] = useState<'identifier' | 'code'>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function resetAndClose() {
    setStep('identifier')
    setIdentifier('')
    setCode('')
    setMessage('')
    setError('')
    onClose()
  }

  async function submitIdentifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isSupabaseConfigured) return
    setBusy(true)
    setError('')
    try {
      await sendOtp(identifier.trim(), method)
      setStep('code')
      setMessage(`We sent a one-time code to ${identifier.trim()}.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send a sign-in code.')
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
      await verifyOtp(identifier.trim(), method, code.trim())
      onAuthenticated()
      setStep('identifier')
      setCode('')
      setMessage('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That code could not be verified.')
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
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Google sign-in could not be started.')
      setBusy(false)
    }
  }

  async function resendCode() {
    if (!isSupabaseConfigured) return
    setBusy(true)
    setError('')
    try {
      await sendOtp(identifier.trim(), method)
      setMessage(`A new one-time code was sent to ${identifier.trim()}.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resend the sign-in code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="xs" aria-labelledby="auth-dialog-title" PaperProps={{ className: 'auth-dialog-paper' }}>
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
          <div className="auth-divider"><span>or continue with a one-time code</span></div>
          <div className="auth-method-toggle" role="tablist" aria-label="Choose email or phone">
            <button type="button" role="tab" aria-selected={method === 'email'} className={method === 'email' ? 'selected' : ''} onClick={() => { setMethod('email'); setError('') }}><Mail size={15} /> Email</button>
            <button type="button" role="tab" aria-selected={method === 'phone'} className={method === 'phone' ? 'selected' : ''} onClick={() => { setMethod('phone'); setError('') }}><Phone size={15} /> Phone</button>
          </div>
          <form className="auth-form" onSubmit={submitIdentifier}>
            <label className="form-field">
              <span>{method === 'email' ? 'Email address' : 'Phone number'}</span>
              <input type={method === 'email' ? 'email' : 'tel'} inputMode={method === 'email' ? 'email' : 'tel'} autoComplete={method === 'email' ? 'email' : 'tel'} placeholder={method === 'email' ? 'you@example.com' : '+1 415 555 0100'} value={identifier} onChange={(event) => setIdentifier(event.target.value)} required disabled={!isSupabaseConfigured} />
              {method === 'phone' && <small>Include your country calling code.</small>}
            </label>
            <Button type="submit" variant="contained" fullWidth disabled={!isSupabaseConfigured || !identifier.trim() || busy}>{busy ? 'Sending code…' : 'Send one-time code'}</Button>
          </form>
        </> : <>
          <button type="button" className="auth-back-button" onClick={() => { setStep('identifier'); setCode(''); setError('') }}><ArrowLeft size={15} /> Change {method}</button>
          <div className="auth-intro"><p className="eyebrow">VERIFY YOUR ACCOUNT</p><h2>Check your {method === 'email' ? 'email' : 'phone'}</h2><p>{message || `Enter the code sent to ${identifier}.`}</p></div>
          <form className="auth-form" onSubmit={submitCode}>
            <label className="form-field">
              <span>One-time code</span>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={8} placeholder="Enter your code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} required disabled={!isSupabaseConfigured} />
            </label>
            <Button type="submit" variant="contained" fullWidth disabled={!isSupabaseConfigured || !code.trim() || busy}>{busy ? 'Verifying…' : 'Verify and continue'}</Button>
          </form>
          <button type="button" className="auth-resend" onClick={resendCode} disabled={!isSupabaseConfigured || busy}>Resend code</button>
        </>}
        {!isSupabaseConfigured && <p className="auth-error" role="status">Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend environment to enable sign-in.</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-footnote">By continuing, you agree to Streamline’s terms and privacy policy.</p>
      </DialogContent>
    </Dialog>
  )
}
