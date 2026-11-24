import { apiClient } from './client'
import type { Video } from '../data/videos'

export async function getVideos() {
  const response = await apiClient.get<Video[]>('/videos')
  return response.data
}
