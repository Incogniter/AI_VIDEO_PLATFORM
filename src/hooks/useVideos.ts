import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { getVideos } from '../api/videos'
import { videos as sampleVideos } from '../data/videos'

export function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      try {
        return { items: await getVideos(), source: 'api' as const }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return { items: sampleVideos, source: 'sample' as const }
        }
        throw error
      }
    },
    retry: false,
    staleTime: 30_000,
  })
}
