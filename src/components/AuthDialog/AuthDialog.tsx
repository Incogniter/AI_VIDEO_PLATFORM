import { useState, type FormEvent } from 'react'
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { ArrowLeft, Mail, Phone, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { normalizePhoneNumber } from '../../auth/phone'
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
    setError('')
    const signInIdentifier = method === 'phone'
      ? normalizePhoneNumber(identifier)
      : identifier.trim()
    if (!signInIdentifier) {
      setError('Enter a 10-digit Indian mobile number or an international number with its country code, such as +919876543210.')
      return
    }

    setBusy(true)
    try {
      if (method === 'email') {
        await sendMagicLink(signInIdentifier)
        setStep('link-sent')
        setMessage(`We sent a sign-in link to ${signInIdentifier}. Open it on the device where you want to use Streamline.`)
      } else {
        setIdentifier(signInIdentifier)
        await sendPhoneOtp(signInIdentifier)
        setStep('code')
        setMessage(`We sent a one-time code to ${signInIdentifier}.`)
      }
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
      await verifyPhoneOtp(identifier.trim(), code.trim())
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

  async function resendSignIn() {
    if (!isSupabaseConfigured) return
    setBusy(true)
    setError('')
    try {
      if (method === 'email') {
        await sendMagicLink(identifier.trim())
        setMessage(`A new sign-in link was sent to ${identifier.trim()}. Open it on the device where you want to use Streamline.`)
      } else {
        const phone = normalizePhoneNumber(identifier)
        if (!phone) throw new Error('Enter a valid phone number with its country code.')
        await sendPhoneOtp(phone)
        setMessage(`A new one-time code was sent to ${phone}.`)
      }
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
          <div className="auth-divider"><span>or continue with email or phone</span></div>
          <div className="auth-method-toggle" role="tablist" aria-label="Choose email or phone">
            <button type="button" role="tab" aria-selected={method === 'email'} className={method === 'email' ? 'selected' : ''} onClick={() => { setMethod('email'); setError('') }}><Mail size={15} /> Email</button>
            <button type="button" role="tab" aria-selected={method === 'phone'} className={method === 'phone' ? 'selected' : ''} onClick={() => { setMethod('phone'); setError('') }}><Phone size={15} /> Phone</button>
          </div>
          <form className="auth-form" onSubmit={submitIdentifier}>
            <label className="form-field">
              <span>{method === 'email' ? 'Email address' : 'Phone number'}</span>
              <input type={method === 'email' ? 'email' : 'tel'} inputMode={method === 'email' ? 'email' : 'tel'} autoComplete={method === 'email' ? 'email' : 'tel'} placeholder={method === 'email' ? 'you@example.com' : '+91 98765 43210'} value={identifier} onChange={(event) => setIdentifier(event.target.value)} required disabled={!isSupabaseConfigured} />
              {method === 'phone' && <small>Enter 10 Indian mobile digits or a number with its country code. We format it for Supabase.</small>}
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
          {step === 'link-sent' && <p className="auth-link-instructions">Open the email and tap the sign-in link. Streamline will open and confirm your login in that browser.</p>}
          <button type="button" className="auth-resend" onClick={resendSignIn} disabled={!isSupabaseConfigured || busy}>{method === 'email' ? 'Resend sign-in link' : 'Resend code'}</button>
        </>}
        {!isSupabaseConfigured && <p className="auth-error" role="status">Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend environment to enable sign-in.</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-footnote">By continuing, you agree to Streamline’s terms and privacy policy.</p>
      </DialogContent>
    </Dialog>
  )
}
