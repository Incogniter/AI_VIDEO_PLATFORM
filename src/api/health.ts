import { apiClient } from './client'

export type HealthStatus = {
  status: 'healthy' | string
  service?: string
}

export async function getHealthStatus() {
  const response = await apiClient.get<HealthStatus>('/health')
  return response.data
}
