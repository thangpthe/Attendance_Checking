import { useState, useEffect, useRef } from 'react'
import { getCurrentToken, getSecondsLeft, generateToken } from '../lib/qr'

const REFRESH_SEC = 10

export function useQrPoller(locationId: string) {
  const [token,     setToken]     = useState('')
  const [countdown, setCountdown] = useState(REFRESH_SEC)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function refresh(id: string) {
    const { token: t } = getCurrentToken(id)
    setToken(t)
    setCountdown(getSecondsLeft(id) || REFRESH_SEC)
  }

  const refreshNow = () => {
    generateToken(locationId)
    refresh(locationId)
  }

  useEffect(() => {
    refresh(locationId)
    timerRef.current = setInterval(() => refresh(locationId), REFRESH_SEC * 1000)
    countRef.current = setInterval(() => setCountdown(getSecondsLeft(locationId)), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (countRef.current) clearInterval(countRef.current)
    }
  }, [locationId])

  return { token, countdown, refreshNow }
}
