export const APP_ROUTES = {
  home: '/',
  explore: '/explore',
  upload: '/upload',
  inbox: '/inbox',
  profile: '/you',
  mobileVerify: '/auth/mobile-verify',
} as const

export const APP_BRAND = 'streamline'
export const GUEST_NAME = 'Guest'
export const API_BASE_URL = 'http://localhost:8000/Synapse'
export const API_RUNTIME_CONFIG_PATH = 'runtime-config.json'
export const API_ROUTES = {
  health: '/health',
  videos: '/videos',
  currentUser: '/auth/me',
  deviceLoginRequests: '/auth/device-login-requests',
} as const
export const DEVICE_LOGIN = { channelPrefix: 'device-login:' } as const
export const AUTH_CALLBACK_COPY = {
  confirmingTitle: 'Confirming your login',
  confirmingMessage: 'We are confirming this sign-in. Please keep this page open for a moment.',
  confirmedTitle: 'Sign-in confirmed',
  confirmedMessage: 'Your email is verified and this device is signed in. The device where you started should be signed in too. Open Streamline here, or return to that device.',
  failedTitle: 'Sign-in not confirmed',
  failedMessage: 'This sign-in request could not be confirmed. Return to your other device and request a new link.',
  missingSessionMessage: 'This sign-in link could not be confirmed. Request a new link and try again.',
} as const
export const AUTH_CALLBACK_SESSION_WAIT_MS = 15_000
export const PHONE_AUTH = {
  indiaCountryCode: '+91',
  e164Pattern: /^\+[1-9]\d{7,14}$/,
} as const
export const USER_FACING_ERRORS = {
  authSend: 'We could not send your sign-in message. Check your details and try again.',
  authVerify: 'We could not verify that code. Check it and try again.',
  authGoogle: 'Google sign-in could not be completed. Please try again.',
  authResend: 'We could not resend your sign-in message. Please wait a moment and try again.',
  profileUpdate: 'We could not update your profile. Please try again.',
  signOut: 'We could not sign you out. Please try again.',
  apiRequest: 'Something went wrong while contacting the service. Please try again.',
  upload: 'The video could not be uploaded. Please try again.',
} as const
export const AUTH_PENDING_ROUTE_KEY = 'streamline.auth.pending-route'
export const AUTH_DEVICE_LOGIN_REQUEST_KEY = 'streamline.auth.device-login-request'
export const UPLOAD_LIMITS = { title: 120, description: 2000 } as const
export const VIDEO_CATEGORIES = ['All', 'For you', 'Technology', 'Design', 'Science', 'Documentary', 'Gaming', 'Music'] as const
