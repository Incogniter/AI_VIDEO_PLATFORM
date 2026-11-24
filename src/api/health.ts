import { apiClient } from './client'
import { API_ROUTES } from '../constants/app'

export type HealthStatus = {
  status: 'healthy' | string
  service?: string
}

export async function getHealthStatus() {
  const response = await apiClient.get<HealthStatus>(API_ROUTES.health)
  return response.data
}
