import { apiClient } from './client'
import { API_ROUTES } from '../constants/app'
import type { Video } from '../data/videos'

export async function getVideos() {
  const response = await apiClient.get<Video[]>(API_ROUTES.videos)
  return response.data
}
