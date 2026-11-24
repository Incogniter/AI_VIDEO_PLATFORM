import { Button } from '@mui/material'
import { LockKeyhole } from 'lucide-react'
import { useAuthDialog } from '../../auth/AuthDialogProvider'
import { APP_ROUTES } from '../../constants/app'
import './AuthRequired.css'

export default function AuthRequired() {
  const { requestAuth } = useAuthDialog()

  return (
    <section className="auth-required-page">
      <span className="auth-required-icon"><LockKeyhole size={22} /></span>
      <p className="eyebrow">ACCOUNT REQUIRED</p>
      <h1>Sign in to open your inbox</h1>
      <p>Your messages and shared videos are available after you sign in or create an account.</p>
      <Button variant="contained" onClick={() => requestAuth(APP_ROUTES.inbox)}>Sign in or register</Button>
    </section>
  )
}
