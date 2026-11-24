import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { APP_ROUTES } from './constants/app'
import RequireAuth from './auth/RequireAuth'
import AppShell from './components/AppShell/AppShell'

const DiscoverPage = lazy(() => import('./pages/DiscoverPage/DiscoverPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage/ExplorePage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage/PlaceholderPage'))
const UploadPage = lazy(() => import('./pages/UploadPage/UploadPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'))

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DiscoverPage />} />
        <Route path={APP_ROUTES.explore.slice(1)} element={<ExplorePage />} />
        <Route path={APP_ROUTES.upload.slice(1)} element={<UploadPage />} />
        <Route path={APP_ROUTES.inbox.slice(1)} element={<RequireAuth><PlaceholderPage title="Your conversations" eyebrow="MESSAGES" description="Messages and shared videos will show up here." /></RequireAuth>} />
        <Route path={APP_ROUTES.profile.slice(1)} element={<ProfilePage />} />
        <Route path="*" element={<Navigate to={APP_ROUTES.home} replace />} />
      </Route>
    </Routes>
  )
}
