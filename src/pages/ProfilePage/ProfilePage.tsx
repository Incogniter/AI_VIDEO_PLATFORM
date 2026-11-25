import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getCurrentBackendUser } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { useAuthDialog } from '../../auth/AuthDialogProvider'
import { getDisplayName } from '../../auth/profile'
import { APP_ROUTES, USER_FACING_ERRORS } from '../../constants/app'
import UserAvatar from '../../components/UserAvatar/UserAvatar'
import PageSkeleton from '../../components/PageSkeleton/PageSkeleton'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, isAuthLoading, isSupabaseConfigured, updateDisplayName, signOut } = useAuth()
  const { requestAuth } = useAuthDialog()
  const [name, setName] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const backendUser = useQuery({
    queryKey: ['auth', 'me', user?.id],
    queryFn: getCurrentBackendUser,
    enabled: Boolean(user),
    retry: false,
  })

  useEffect(() => setName(getDisplayName(user)), [user])

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setNotice('')
    setError('')
    try {
      await updateDisplayName(name)
      setNotice('Your profile name has been updated.')
    } catch {
      setError(USER_FACING_ERRORS.profileUpdate)
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setBusy(true)
    setError('')
    try {
      await signOut()
    } catch {
      setError(USER_FACING_ERRORS.signOut)
    } finally {
      setBusy(false)
    }
  }

  if (isAuthLoading) return <PageSkeleton />

  if (!user) {
    return (
      <section className="profile-page">
        <p className="eyebrow">YOUR SPACE</p>
        <h1>Guest profile</h1>
        <p className="profile-subtitle">Sign in to personalize your profile and sync it across devices.</p>
        <Button variant="contained" disabled={!isSupabaseConfigured} onClick={() => requestAuth(APP_ROUTES.profile)}>Sign in or register</Button>
        {!isSupabaseConfigured && <p className="profile-error">Configure Supabase to enable sign-in.</p>}
      </section>
    )
  }

  return (
    <section className="profile-page">
      <p className="eyebrow">ACCOUNT SETTINGS</p>
      <h1>Your profile</h1>
      <p className="profile-subtitle">Your Google profile photo is used automatically. You can change the name shown in Streamline.</p>
      <div className="profile-card">
        <UserAvatar user={user} name={getDisplayName(user)} size="large" />
        <div className="profile-identity"><strong>{getDisplayName(user)}</strong><span>{user.email || user.phone}</span></div>
        <p className={`backend-auth-status ${backendUser.isSuccess ? 'verified' : backendUser.isError ? 'failed' : ''}`} role="status">
          {backendUser.isLoading ? 'Verifying your session with the backend…' : backendUser.isSuccess ? 'Session verified by the backend' : backendUser.isError ? 'Backend session verification is unavailable' : ''}
        </p>
        <form className="profile-edit-form" onSubmit={saveProfile}>
          <label className="form-field"><span>Display name</span><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></label>
          {notice && <p className="profile-success" role="status">{notice}</p>}
          {error && <p className="profile-error" role="alert">{error}</p>}
          <div className="profile-actions"><Button type="submit" variant="contained" disabled={!name.trim() || busy}>{busy ? 'Saving…' : 'Save profile'}</Button><Button type="button" color="inherit" onClick={handleSignOut} disabled={busy}>Sign out</Button></div>
        </form>
      </div>
    </section>
  )
}
