import type { RealtimeChannel } from '@supabase/supabase-js'
import { exchangeDeviceLoginRequest, type DeviceLoginRequest } from '../api/auth'
import { AUTH_DEVICE_LOGIN_REQUEST_KEY, DEVICE_LOGIN } from '../constants/app'
import { supabase } from './supabase'

export type DeviceLoginListener = {
  ready: Promise<void>
  approved: Promise<void>
}

export function listenForDeviceLogin(
  request: DeviceLoginRequest,
  signal: AbortSignal,
): DeviceLoginListener {
  if (!supabase) throw new Error('Authentication unavailable')

  let channel: RealtimeChannel | null = null
  let settled = false
  let readySettled = false
  let expiryTimer = 0
  let resolveReady!: () => void
  let rejectReady!: (reason: Error) => void
  let resolveApproved!: () => void
  let rejectApproved!: (reason: Error) => void

  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })
  const approved = new Promise<void>((resolve, reject) => {
    resolveApproved = resolve
    rejectApproved = reject
  })
  // The caller may still be sending the email when a socket fails or expires.
  void approved.catch(() => undefined)

  const cleanup = () => {
    window.clearTimeout(expiryTimer)
    signal.removeEventListener('abort', onAbort)
    if (channel) void supabase?.removeChannel(channel)
  }

  const fail = (message: string) => {
    if (settled) return
    settled = true
    cleanup()
    const error = new Error(message)
    if (!readySettled) {
      readySettled = true
      rejectReady(error)
    }
    rejectApproved(error)
  }

  const onAbort = () => fail('Device sign-in was cancelled')

  const deviceChannel = supabase.channel(`${DEVICE_LOGIN.channelPrefix}${request.request_id}`, {
    config: { private: false, broadcast: { self: false } },
  })
    .on('broadcast', { event: 'approved' }, () => {
      if (settled) return
      settled = true
      cleanup()
      void (async () => {
        try {
          const oneTimeToken = await exchangeDeviceLoginRequest(request.request_id, request.request_secret)
          if (!supabase) throw new Error('Authentication unavailable')
          const { error } = await supabase.auth.verifyOtp({
            token_hash: oneTimeToken.token_hash,
            type: oneTimeToken.type,
          })
          if (error) throw error
          window.sessionStorage.removeItem(AUTH_DEVICE_LOGIN_REQUEST_KEY)
          resolveApproved()
        } catch {
          rejectApproved(new Error('The sign-in could not be completed'))
        }
      })()
    })
  channel = deviceChannel
  deviceChannel.subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        if (!readySettled) {
          readySettled = true
          resolveReady()
        }
        return
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        fail(error?.message || 'The sign-in connection was interrupted')
      }
  })

  signal.addEventListener('abort', onAbort, { once: true })
  expiryTimer = window.setTimeout(
    () => fail('The sign-in request expired'),
    Math.max(0, new Date(request.expires_at).getTime() - Date.now()),
  )
  if (signal.aborted) onAbort()

  return { ready, approved }
}
