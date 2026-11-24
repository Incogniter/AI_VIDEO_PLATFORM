import axios from 'axios'
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
export const apiClient = axios.create({
  baseURL: (configuredBaseUrl || 'http://localhost:8000/Synapse').replace(/\/+$/, ''),
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

apiClient.interceptors.request.use((config) => {
  config.headers.set('Accept', 'application/json')

  let token: string | null = null
  try {
    token = typeof window !== 'undefined'
      ? window.localStorage.getItem('streamline_access_token')
      : null
  } catch {
    // Requests remain public until the authentication flow is configured.
  }

  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: string; message?: string }>(error)) {
      const message = error.response?.data?.detail
        || error.response?.data?.message
        || error.message
        || 'The API request failed.'
      return Promise.reject(new ApiError(message, error.response?.status))
    }

    return Promise.reject(new ApiError('An unexpected API error occurred.'))
  },
)
