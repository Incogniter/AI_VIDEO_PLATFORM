import { useQuery } from '@tanstack/react-query'
import { getHealthStatus } from '../api/health'

export function useApiHealth() {
  return useQuery({
    queryKey: ['api', 'health'],
    queryFn: getHealthStatus,
    retry: false,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}
