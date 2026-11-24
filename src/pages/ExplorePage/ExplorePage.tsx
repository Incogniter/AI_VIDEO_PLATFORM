import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bookmark, Play } from 'lucide-react'
import { ApiError } from '../../api/client'
import { useVideos } from '../../hooks/useVideos'
import { categories, videos } from '../../data/videos'
import { formatRelativeAge } from '../../utils/formatRelativeAge'
import VideoGridSkeleton from '../../components/VideoGridSkeleton/VideoGridSkeleton'
import './ExplorePage.css'

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [saved, setSaved] = useState<string[]>([])
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').trim()
  const normalizedQuery = query.toLowerCase()
  const videosQuery = useVideos()
  const feed = videosQuery.data?.items ?? videos
  const filteredVideos = useMemo(() => feed.filter((video) => {
    const categoryMatches = activeCategory === 'All' || activeCategory === 'For you' || video.category === activeCategory
    const queryMatches = !normalizedQuery || `${video.title} ${video.creator} ${video.category} ${video.description}`.toLowerCase().includes(normalizedQuery)
    return categoryMatches && queryMatches
  }), [feed, activeCategory, normalizedQuery])

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id])
  }

  return (
    <div className="explore-page">
      <div className="explore-heading">
        <p className="eyebrow">DISCOVER</p>
        <h1>{query ? `Results for “${query}”` : 'Explore videos'}</h1>
        <p className="explore-subtitle">Find ideas, creators, and stories worth your time.</p>
      </div>

      <div className="category-row" role="tablist" aria-label="Video categories">
        {categories.map((category) => <button key={category} role="tab" aria-selected={activeCategory === category} className={`category-chip${activeCategory === category ? ' selected' : ''}`} onClick={() => setActiveCategory(category)}>{category}</button>)}
      </div>

      {videosQuery.isError && <div className="api-notice" role="status">{videosQuery.error instanceof ApiError ? videosQuery.error.message : 'The video feed is unavailable.'} Showing sample videos for now.</div>}
      {videosQuery.data?.source === 'sample' && <div className="api-notice" role="status">The backend is online, but its video feed endpoint is not available yet. Showing sample videos.</div>}

      {videosQuery.isLoading ? <VideoGridSkeleton count={6} className="explore-video-grid" /> : filteredVideos.length ? <div className="video-grid explore-video-grid">
        {filteredVideos.map((video) => <article className="video-card" key={video.id}>
          <button className={`video-cover ${video.cover}`} aria-label={`Play ${video.title}`}>
            <span className="cover-label">{video.category.toUpperCase()}</span>
            <span className="cover-title">{video.creator.toUpperCase()}</span>
            <span className="cover-play"><Play size={16} fill="currentColor" /></span>
            <span className="duration">{video.duration}</span>
          </button>
          <div className="video-card-info">
            <span className={`avatar ${video.id === 'ocean' ? 'avatar-ocean' : video.id === 'film' ? 'avatar-film' : 'avatar-north'}`}>{video.creator.slice(0, 1)}</span>
            <div className="video-card-text">
              <h3>{video.title}</h3>
              <p>{video.creator}</p>
              <small>{video.views} <span>·</span> {formatRelativeAge(video.uploadedAt)}</small>
            </div>
            <button className={`card-save${saved.includes(video.id) ? ' is-liked' : ''}`} aria-label={`${saved.includes(video.id) ? 'Remove saved' : 'Save'} ${video.title}`} onClick={() => toggleSaved(video.id)}><Bookmark size={17} fill={saved.includes(video.id) ? 'currentColor' : 'none'} /></button>
          </div>
        </article>)}
      </div> : <div className="empty-state">No videos match. Try another search or category.</div>}
    </div>
  )
}
