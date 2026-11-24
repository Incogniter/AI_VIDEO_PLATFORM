import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import DiscoverPage from './pages/DiscoverPage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DiscoverPage />} />
        <Route path="explore" element={<DiscoverPage />} />
        <Route path="upload" element={<PlaceholderPage title="Create something" eyebrow="STUDIO" description="Upload a video and share your perspective." />} />
        <Route path="inbox" element={<PlaceholderPage title="Your conversations" eyebrow="MESSAGES" description="Messages and shared videos will show up here." />} />
        <Route path="you" element={<PlaceholderPage title="Your space" eyebrow="LIBRARY" description="Pick up where you left off and find your saved videos." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
