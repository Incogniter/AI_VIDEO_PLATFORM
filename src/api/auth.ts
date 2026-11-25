import { apiClient } from './client'
import { API_ROUTES } from '../constants/app'

export type BackendUser = {
  id: string
  email: string | null
  phone: string | null
  user_metadata: Record<string, unknown>
}

export type DeviceLoginRequest = {
  request_id: string
  request_secret: string
  expires_at: string
}

export async function createDeviceLoginRequest(email: string) {
  const response = await apiClient.post<DeviceLoginRequest>(API_ROUTES.deviceLoginRequests, { email })
  return response.data
}

export async function approveDeviceLoginRequest(requestId: string) {
  const response = await apiClient.post<{ status: 'approved' }>(`${API_ROUTES.deviceLoginRequests}/${requestId}/approve`)
  return response.data
}

export async function exchangeDeviceLoginRequest(requestId: string, requestSecret: string) {
  const response = await apiClient.post<{ token_hash: string; type: 'magiclink' }>(`${API_ROUTES.deviceLoginRequests}/${requestId}/exchange`, { request_secret: requestSecret })
  return response.data
}

export async function getCurrentBackendUser() {
  const response = await apiClient.get<BackendUser>(API_ROUTES.currentUser)
  return response.data
}
