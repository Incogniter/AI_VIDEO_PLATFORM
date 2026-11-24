import { lazy, Suspense, useState, type FormEvent } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, Compass, House, Menu, MessageCircle, Plus, Search, UserRound, X } from 'lucide-react'
import { useApiHealth } from '../../hooks/useApiHealth'
import PageSkeleton from '../PageSkeleton/PageSkeleton'
import './AppShell.css'

const UploadDialog = lazy(() => import('../UploadDialog/UploadDialog'))

const links: { label: string; to?: string; icon: typeof House; badge?: string }[] = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Explore', to: '/explore', icon: Compass },
  { label: 'Upload', icon: Plus },
  { label: 'Inbox', to: '/inbox', icon: MessageCircle, badge: '2' },
  { label: 'You', to: '/you', icon: UserRound },
]

export default function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const apiHealth = useApiHealth()
  const apiIsHealthy = apiHealth.data?.status === 'healthy'

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Streamline home">
          <span className="brand-mark"><span /></span><span>streamline</span>
        </NavLink>
        <div className="nav-label">YOUR SPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map(({ label, to, icon: Icon, badge }) => (
            label === 'Upload'
              ? <button key={label} type="button" className="nav-item nav-button" onClick={() => setUploadOpen(true)}><Icon size={19} strokeWidth={1.8} /><span>{label}</span></button>
              : <NavLink key={label} to={to!} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
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
            <button type="button" className="text-link upload-cta" onClick={() => setUploadOpen(true)}>Upload video <span>↗</span></button>
          </div>
          <button className="profile-row" onClick={() => navigate('/you')}>
            <span className="avatar avatar-user">AR</span>
            <span className="profile-meta"><strong>Abino Robilin</strong><small>Personal account</small></span>
            <span className="profile-more">···</span>
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSearchOpen(!searchOpen)}>
            {searchOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <NavLink to="/" className="mobile-brand"><span className="brand-mark"><span /></span>streamline</NavLink>
          <form className={`search-box${searchOpen ? ' search-box-open' : ''}`} onSubmit={submitSearch}>
            <Search size={18} />
            <input aria-label="Search videos, creators, topics" placeholder="Search videos, creators, topics..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <kbd>⌘ K</kbd>
          </form>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <button className="avatar avatar-user top-avatar" aria-label="Your profile" onClick={() => navigate('/you')}>AR</button>
          </div>
        </header>
        <main className="page-content"><Suspense fallback={<PageSkeleton />}><Outlet /></Suspense></main>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(({ label, to, icon: Icon }) => label === 'Upload'
            ? <button key={label} type="button" className="mobile-nav-item mobile-nav-button" onClick={() => setUploadOpen(true)}><Icon size={20} /><span>{label}</span></button>
            : <NavLink key={label} to={to!} end={to === '/'} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}><Icon size={20} /><span>{label}</span></NavLink>)}
        </nav>
      </div>
      {uploadOpen && <Suspense fallback={null}><UploadDialog open onClose={() => setUploadOpen(false)} /></Suspense>}
    </div>
  )
}
