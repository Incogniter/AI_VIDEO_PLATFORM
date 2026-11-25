import axios from 'axios'
import { API_BASE_URL } from '../constants/app'
import { getApiBaseUrl } from '../config/api'
import { supabase } from '../auth/supabase'
import { USER_FACING_ERRORS } from '../constants/app'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
})

export class ApiError extends Error {
  status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

apiClient.interceptors.request.use(async (config) => {
  config.headers.set('Accept', 'application/json')
  config.baseURL = await getApiBaseUrl()

  let token: string | null = null
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      token = data.session?.access_token ?? null
    }
  } catch {
    // A failed session lookup leaves this request unauthenticated.
  }

  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(new ApiError(USER_FACING_ERRORS.apiRequest, error.response?.status))
    }

    return Promise.reject(new ApiError(USER_FACING_ERRORS.apiRequest))
  },
)
