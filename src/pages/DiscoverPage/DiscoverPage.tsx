import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Skeleton } from '@mui/material'
import { ArrowRight, Bookmark, Heart, Play, Sparkles } from 'lucide-react'
import { categories, videos } from '../../data/videos'
import { ApiError } from '../../api/client'
import { useVideos } from '../../hooks/useVideos'
import { formatRelativeAge } from '../../utils/formatRelativeAge'
import VideoGridSkeleton from '../../components/VideoGridSkeleton/VideoGridSkeleton'
import { useAuth } from '../../auth/AuthProvider'
import { getDisplayName } from '../../auth/profile'
import { formatToday, getGreeting } from '../../utils/greeting'
import './DiscoverPage.css'

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [liked, setLiked] = useState<string[]>([])
  const [searchParams] = useSearchParams()
  const videosQuery = useVideos()
  const { user } = useAuth()
  const displayName = getDisplayName(user)
  const feed = videosQuery.data?.items ?? videos
  const featuredVideo = feed.find((video) => video.featured) ?? feed[0]
  const search = (searchParams.get('q') || '').toLowerCase()
  const filteredVideos = useMemo(() => feed.filter((video) => {
    const categoryMatch = activeCategory === 'All' || activeCategory === 'For you' || video.category === activeCategory
    const searchMatch = !search || `${video.title} ${video.creator} ${video.category} ${video.description}`.toLowerCase().includes(search)
    return categoryMatch && searchMatch
  }), [feed, activeCategory, search])

  function toggleLike(id: string) {
    setLiked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <div className="discover-page">
      <div className="welcome-row">
        <div><p className="eyebrow">{formatToday()}</p><h1>{getGreeting()}, {displayName}</h1></div>
      </div>

      <div className="category-row" role="tablist" aria-label="Video categories">
        {categories.map((category) => <button key={category} role="tab" aria-selected={activeCategory === category} className={`category-chip${activeCategory === category ? ' selected' : ''}`} onClick={() => setActiveCategory(category)}>{category}</button>)}
      </div>

      {videosQuery.isError && <div className="api-notice" role="status">{videosQuery.error instanceof ApiError ? videosQuery.error.message : 'The video feed is unavailable.'} Showing sample videos for now.</div>}
      {videosQuery.data?.source === 'sample' && <div className="api-notice" role="status">The backend is online, but its video feed endpoint is not available yet. Showing sample videos.</div>}

      <section className="featured-section">
        <div className="section-heading"><div><p className="eyebrow">FEATURED · STREAMLINE ORIGINAL</p><h2>Find something worth your time.</h2></div><span className="quality-pill">4K <span>•</span> CC</span></div>
        {videosQuery.isLoading ? <div className="hero-card hero-loading" aria-label="Loading featured video" aria-busy="true">
          <Skeleton variant="rectangular" animation="wave" className="hero-loading-art" />
          <div className="hero-loading-copy"><Skeleton animation="wave" width="42%" /><Skeleton animation="wave" width="78%" height={32} /><Skeleton animation="wave" width="88%" height={18} /><Skeleton animation="wave" width="58%" height={18} /></div>
        </div> : featuredVideo && <article className="hero-card">
          <div className={`hero-art ${featuredVideo.cover}`}><div className="hero-art-glow" /><span className="art-kicker">THE NEXT FRONTIER</span><div className="architecture-lines"><i /><i /><i /><i /><i /></div><div className="hero-play"><Play size={22} fill="currentColor" /></div><span className="duration">{featuredVideo.duration}</span></div>
          <div className="hero-copy"><div className="content-tags"><span>STREAMLINE ORIGINAL</span><span>{featuredVideo.category.toUpperCase()}</span></div><h3>{featuredVideo.title}</h3><p>{featuredVideo.description}</p><div className="creator-line"><span className="avatar avatar-north">{featuredVideo.creator.slice(0, 1)}</span><span><strong>{featuredVideo.creator}</strong><small>{featuredVideo.views} <span>·</span> {formatRelativeAge(featuredVideo.uploadedAt)}</small></span><button className="subscribe-button">Subscribe</button></div><div className="hero-actions"><button onClick={() => toggleLike(featuredVideo.id)} className={liked.includes(featuredVideo.id) ? 'is-liked' : ''}><Heart size={18} fill={liked.includes(featuredVideo.id) ? 'currentColor' : 'none'} /> 2.4K</button><button><ArrowRight size={17} /> Share</button><button><Bookmark size={17} /> Save</button></div></div>
        </article>}
      </section>

      <section className="ai-banner"><div className="ai-icon"><Sparkles size={18} /></div><div className="ai-copy"><strong>Make every video more useful</strong><span>Ask questions, explore key moments and discover ideas across your library.</span></div><button>Explore AI features <ArrowRight size={16} /></button></section>

      <section className="trending-section">
        <div className="section-heading compact"><div><p className="eyebrow">CURATED FOR YOU</p><h2>{search ? `Results for “${searchParams.get('q')}”` : 'Trending this week'}</h2></div><button className="view-all">View all <ArrowRight size={16} /></button></div>
        {videosQuery.isLoading ? <VideoGridSkeleton count={3} /> : filteredVideos.length ? <div className="video-grid">{filteredVideos.map((video) => <article className="video-card" key={video.id}>
          <button className={`video-cover ${video.cover}`} aria-label={`Play ${video.title}`}><span className="cover-label">{video.featured ? 'FEATURED' : video.category.toUpperCase()}</span><span className="cover-title">{video.id === 'ocean' ? 'FIELD NOTES' : video.id === 'film' ? 'STILL / MOVING' : 'THE NEXT FRONTIER'}</span><span className="cover-play"><Play size={16} fill="currentColor" /></span><span className="duration">{video.duration}</span></button>
          <div className="video-card-info"><span className={`avatar ${video.id === 'ocean' ? 'avatar-ocean' : video.id === 'film' ? 'avatar-film' : 'avatar-north'}`}>{video.creator.slice(0, 1)}</span><div className="video-card-text"><h3>{video.title}</h3><p>{video.creator}</p><small>{video.views} <span>·</span> {formatRelativeAge(video.uploadedAt)}</small></div><button className={`card-save${liked.includes(video.id) ? ' is-liked' : ''}`} aria-label={`Save ${video.title}`} onClick={() => toggleLike(video.id)}><Bookmark size={17} fill={liked.includes(video.id) ? 'currentColor' : 'none'} /></button></div>
        </article>)}</div> : <div className="empty-state">No videos match that search yet. Try a creator, topic, or another phrase.</div>}
      </section>
    </div>
  )
}
