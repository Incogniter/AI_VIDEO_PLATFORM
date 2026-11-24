import { API_BASE_URL, API_RUNTIME_CONFIG_PATH } from '../constants/app'

type RuntimeConfig = {
  apiBaseUrl?: string
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
    return typeof config.apiBaseUrl === 'string' && config.apiBaseUrl.trim()
      ? normalizeApiBaseUrl(config.apiBaseUrl)
      : fallbackUrl
  } catch {
    return fallbackUrl
  }
}

export function getApiBaseUrl(): Promise<string> {
  apiBaseUrlPromise ??= fetchRuntimeApiBaseUrl()
  return apiBaseUrlPromise
}
