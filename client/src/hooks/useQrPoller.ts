import { useState, useEffect, useRef, useCallback } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
// URL mà nhân viên sẽ mở khi scan QR bằng camera điện thoại (face-checkin flow)
const APP_ORIGIN = import.meta.env.VITE_APP_URL || window.location.origin

export function useQrPoller(locationId: string) {
  const [token,     setToken]     = useState('')
  const [qrUrl,     setQrUrl]     = useState('')   // URL encode vào QR cho face-checkin flow
  const [countdown, setCountdown] = useState(10)
  const [error,     setError]     = useState('')

  const expiresAtRef = useRef<number>(0)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchFromServer = useCallback(async (id: string) => {
    try {
      const res  = await fetch(`${BASE}/api/qr/current/${id}`)
      const data = await res.json() as { token: string; expiresAt: number }
      setToken(data.token)
      // Encode URL vào QR: điện thoại scan → mở face-checkin page với token
      setQrUrl(`${APP_ORIGIN}/face-checkin?t=${encodeURIComponent(data.token)}`)
      expiresAtRef.current = data.expiresAt
      setCountdown(Math.max(1, Math.ceil((data.expiresAt - Date.now()) / 1000)))
      setError('')
    } catch {
      setError('Không kết nối được server')
    }
  }, [])

  const refreshNow = useCallback(() => fetchFromServer(locationId), [locationId, fetchFromServer])

  useEffect(() => {
    fetchFromServer(locationId)

    // 1 interval duy nhất: đếm ngược, tự fetch khi hết hạn
    intervalRef.current = setInterval(() => {
      const left = Math.ceil((expiresAtRef.current - Date.now()) / 1000)
      if (left <= 0) {
        fetchFromServer(locationId)
      } else {
        setCountdown(left)
      }
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [locationId, fetchFromServer])

  return { token, qrUrl, countdown, error, refreshNow }
}
