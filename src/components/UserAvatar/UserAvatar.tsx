import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getAvatarInitials, getAvatarUrl } from '../../auth/profile'
import './UserAvatar.css'

type Props = { user: User | null; name: string; className?: string; size?: 'small' | 'large' }

export default function UserAvatar({ user, name, className = '', size = 'small' }: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getAvatarUrl(user)

  return (
    <span className={`avatar user-avatar user-avatar-${size} ${className}`} aria-label={`${name} profile picture`}>
      {imageUrl && !imageFailed
        ? <img src={imageUrl} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
        : getAvatarInitials(name)}
    </span>
  )
}
