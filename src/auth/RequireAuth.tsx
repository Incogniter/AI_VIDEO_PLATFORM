import type { ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import AuthRequired from '../components/AuthRequired/AuthRequired'
import PageSkeleton from '../components/PageSkeleton/PageSkeleton'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth()
  if (isAuthLoading) return <PageSkeleton />
  if (!user) return <AuthRequired />
  return children
}
