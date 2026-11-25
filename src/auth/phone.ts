import { PHONE_AUTH } from '../constants/app'

export function normalizePhoneNumber(value: string): string | null {
  const compact = value.trim().replace(/[\s().-]/g, '')
  if (!/^\+?\d+$/.test(compact)) return null

  const digits = compact.replace(/\D/g, '')
  let normalized: string

  if (compact.startsWith('+')) {
    normalized = `+${digits}`
  } else if (digits.length === 10) {
    normalized = `${PHONE_AUTH.indiaCountryCode}${digits}`
  } else if (digits.length === 12 && digits.startsWith('91')) {
    normalized = `+${digits}`
  } else {
    return null
  }

  return PHONE_AUTH.e164Pattern.test(normalized) ? normalized : null
}
