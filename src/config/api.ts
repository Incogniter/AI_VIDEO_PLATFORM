import { API_BASE_URL, API_RUNTIME_CONFIG_PATH } from '../constants/app'

type RuntimeConfig = {
  apiBaseUrl?: string
  development?: { apiBaseUrl?: string }
  production?: { apiBaseUrl?: string }
}

let apiBaseUrlPromise: Promise<string> | undefined

function normalizeApiBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, '')
}

async function fetchRuntimeApiBaseUrl(): Promise<string> {
  const fallbackUrl = normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL?.trim() || API_BASE_URL,
  )

  try {
    const runtimeConfigUrl = new URL(
      `${import.meta.env.BASE_URL}${API_RUNTIME_CONFIG_PATH}`,
      window.location.origin,
    )
    const response = await fetch(runtimeConfigUrl, { cache: 'no-store' })
    if (!response.ok) return fallbackUrl

    const config = await response.json() as RuntimeConfig
    const modeConfig = import.meta.env.DEV ? config.development : config.production
    const runtimeApiBaseUrl = modeConfig?.apiBaseUrl || config.apiBaseUrl
    return typeof runtimeApiBaseUrl === 'string' && runtimeApiBaseUrl.trim()
      ? normalizeApiBaseUrl(runtimeApiBaseUrl)
      : fallbackUrl
  } catch {
    return fallbackUrl
  }
}

export function getApiBaseUrl(): Promise<string> {
  apiBaseUrlPromise ??= fetchRuntimeApiBaseUrl()
  return apiBaseUrlPromise
}
