import { Skeleton } from '@mui/material'
import VideoGridSkeleton from '../VideoGridSkeleton/VideoGridSkeleton'
import './PageSkeleton.css'

export default function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-label="Loading page" aria-busy="true" role="status">
      <Skeleton variant="text" animation="wave" className="page-skeleton-eyebrow" />
      <Skeleton variant="text" animation="wave" className="page-skeleton-title" />
      <Skeleton variant="rounded" animation="wave" className="page-skeleton-categories" />
      <VideoGridSkeleton count={3} />
    </div>
  )
}
