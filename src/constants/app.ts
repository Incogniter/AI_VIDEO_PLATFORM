export const APP_ROUTES = {
  home: '/',
  explore: '/explore',
  upload: '/upload',
  inbox: '/inbox',
  profile: '/you',
} as const

export const APP_BRAND = 'streamline'
export const GUEST_NAME = 'Guest'
export const API_BASE_URL = 'http://localhost:8000/Synapse'
export const API_ROUTES = { health: '/health', videos: '/videos', currentUser: '/auth/me' } as const
export const AUTH_PENDING_ROUTE_KEY = 'streamline.auth.pending-route'
export const UPLOAD_LIMITS = { title: 120, description: 2000 } as const
export const VIDEO_CATEGORIES = ['All', 'For you', 'Technology', 'Design', 'Science', 'Documentary', 'Gaming', 'Music'] as const
