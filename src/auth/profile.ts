import type { User } from '@supabase/supabase-js'
import { GUEST_NAME } from '../constants/app'

export function getDisplayName(user: User | null) {
  if (!user) return GUEST_NAME
  const metadata = user.user_metadata ?? {}
  const displayName = metadata.display_name || metadata.full_name || metadata.name
  if (typeof displayName === 'string' && displayName.trim()) return displayName.trim()
  return user.email?.split('@')[0] || GUEST_NAME
}

export function getAvatarUrl(user: User | null) {
  if (!user) return null
  const metadata = user.user_metadata ?? {}
  const avatar = metadata.avatar_url || metadata.picture || metadata.avatar
  return typeof avatar === 'string' && avatar.trim() ? avatar : null
}

export function getAvatarInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'G'
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('')
}
