import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { useAuthDialog } from '../../auth/AuthDialogProvider'
import { APP_ROUTES } from '../../constants/app'
import UploadDialog from '../../components/UploadDialog/UploadDialog'
import PageSkeleton from '../../components/PageSkeleton/PageSkeleton'

export default function UploadPage() {
  const { user, isAuthLoading } = useAuth()
  const { requestAuth } = useAuthDialog()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthLoading && !user) requestAuth(APP_ROUTES.upload)
  }, [isAuthLoading, user])

  if (isAuthLoading || !user) return <PageSkeleton />
  return <UploadDialog open onClose={() => navigate(APP_ROUTES.home)} />
}
