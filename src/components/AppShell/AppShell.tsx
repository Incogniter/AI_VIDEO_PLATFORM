import { Suspense, useState, type FormEvent, type MouseEvent } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, Compass, House, Menu, MessageCircle, Plus, Search, UserRound, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { useAuthDialog } from '../../auth/AuthDialogProvider'
import { getDisplayName } from '../../auth/profile'
import { APP_BRAND, APP_ROUTES } from '../../constants/app'
import { useApiHealth } from '../../hooks/useApiHealth'
import PageSkeleton from '../PageSkeleton/PageSkeleton'
import UserAvatar from '../UserAvatar/UserAvatar'
import './AppShell.css'

const links: { label: string; to?: string; icon: typeof House; badge?: string }[] = [
  { label: 'Home', to: APP_ROUTES.home, icon: House },
  { label: 'Explore', to: APP_ROUTES.explore, icon: Compass },
  { label: 'Upload', icon: Plus },
  { label: 'Inbox', to: APP_ROUTES.inbox, icon: MessageCircle, badge: '2' },
  { label: 'You', to: APP_ROUTES.profile, icon: UserRound },
]

export default function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { requestAuth } = useAuthDialog()
  const displayName = getDisplayName(user)
  const apiHealth = useApiHealth()
  const apiIsHealthy = apiHealth.data?.status === 'healthy'

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (query.trim()) navigate(`${APP_ROUTES.explore}?q=${encodeURIComponent(query.trim())}`)
  }

  function requestUpload() {
    if (user) navigate(APP_ROUTES.upload)
    else requestAuth(APP_ROUTES.upload)
  }

  function handlePrivateNavigation(event: MouseEvent<HTMLAnchorElement>, path: string) {
    if (!user && path === APP_ROUTES.inbox) {
      event.preventDefault()
      requestAuth(APP_ROUTES.inbox)
    }
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to={APP_ROUTES.home} className="brand" aria-label="Streamline home">
          <span className="brand-mark"><span /></span><span>{APP_BRAND}</span>
        </NavLink>
        <div className="nav-label">YOUR SPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map(({ label, to, icon: Icon, badge }) => (
            label === 'Upload'
              ? <button key={label} type="button" className="nav-item nav-button" onClick={requestUpload}><Icon size={19} strokeWidth={1.8} /><span>{label}</span></button>
              : <NavLink key={label} to={to!} end={to === APP_ROUTES.home} onClick={(event) => handlePrivateNavigation(event, to!)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{label}</span>
                  {badge && <span className="nav-badge">{badge}</span>}
                </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className={`api-status ${apiIsHealthy ? 'online' : apiHealth.isLoading ? 'connecting' : 'offline'}`} title={apiHealth.data?.service || apiHealth.error?.message || 'API connection status'}>
            <span className="api-status-dot" />
            {apiIsHealthy ? 'API connected' : apiHealth.isLoading ? 'Connecting to API' : 'API unavailable'}
          </div>
          <div className="creator-card">
            <div className="creator-card-icon"><Plus size={17} /></div>
            <strong>Create something</strong>
            <span>Upload a video and share your perspective.</span>
            <button type="button" className="text-link upload-cta" onClick={requestUpload}>Upload video <span>↗</span></button>
          </div>
          <button className="profile-row" onClick={() => navigate(APP_ROUTES.profile)}>
            <UserAvatar user={user} name={displayName} />
            <span className="profile-meta"><strong>{displayName}</strong><small>{user?.email || user?.phone || 'Guest account'}</small></span>
            <span className="profile-more">···</span>
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSearchOpen(!searchOpen)}>
            {searchOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <NavLink to={APP_ROUTES.home} className="mobile-brand"><span className="brand-mark"><span /></span>{APP_BRAND}</NavLink>
          <form className={`search-box${searchOpen ? ' search-box-open' : ''}`} onSubmit={submitSearch}>
            <Search size={18} />
            <input aria-label="Search videos, creators, topics" placeholder="Search videos, creators, topics..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <kbd>⌘ K</kbd>
          </form>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <button className="profile-avatar-button" aria-label="Your profile" onClick={() => navigate(APP_ROUTES.profile)}><UserAvatar user={user} name={displayName} className="top-avatar" /></button>
          </div>
        </header>
        <main className="page-content"><Suspense fallback={<PageSkeleton />}><Outlet /></Suspense></main>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(({ label, to, icon: Icon }) => label === 'Upload'
            ? <button key={label} type="button" className="mobile-nav-item mobile-nav-button" onClick={requestUpload}><Icon size={20} /><span>{label}</span></button>
            : <NavLink key={label} to={to!} end={to === APP_ROUTES.home} onClick={(event) => handlePrivateNavigation(event, to!)} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}><Icon size={20} /><span>{label}</span></NavLink>)}
        </nav>
      </div>
    </div>
  )
}
