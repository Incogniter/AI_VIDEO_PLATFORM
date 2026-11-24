import { apiClient } from './client'
import { API_ROUTES } from '../constants/app'

export type BackendUser = {
  id: string
  email: string | null
  phone: string | null
  user_metadata: Record<string, unknown>
}

export async function getCurrentBackendUser() {
  const response = await apiClient.get<BackendUser>(API_ROUTES.currentUser)
  return response.data
}
