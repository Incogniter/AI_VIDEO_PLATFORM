import { Skeleton } from '@mui/material'
import './VideoGridSkeleton.css'

type Props = { count?: number; className?: string }

export default function VideoGridSkeleton({ count = 3, className = '' }: Props) {
  return (
    <div className={`video-grid video-grid-skeleton ${className}`} aria-label="Loading videos" aria-busy="true" role="status">
      {Array.from({ length: count }, (_, index) => <article className="skeleton-video-card" key={index} aria-hidden="true">
        <Skeleton variant="rounded" animation="wave" className="skeleton-video-cover" />
        <div className="skeleton-video-info">
          <Skeleton variant="circular" animation="wave" className="skeleton-video-avatar" />
          <div className="skeleton-video-copy">
            <Skeleton variant="text" animation="wave" width="88%" height={18} />
            <Skeleton variant="text" animation="wave" width="55%" height={15} />
            <Skeleton variant="text" animation="wave" width="70%" height={13} />
          </div>
        </div>
      </article>)}
    </div>
  )
}
