import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell/AppShell'

const DiscoverPage = lazy(() => import('./pages/DiscoverPage/DiscoverPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage/ExplorePage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage/PlaceholderPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DiscoverPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="upload" element={<Navigate to="/" replace />} />
        <Route path="inbox" element={<PlaceholderPage title="Your conversations" eyebrow="MESSAGES" description="Messages and shared videos will show up here." />} />
        <Route path="you" element={<PlaceholderPage title="Your space" eyebrow="LIBRARY" description="Pick up where you left off and find your saved videos." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
