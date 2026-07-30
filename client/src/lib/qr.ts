import { uuid } from './utils'

const TTL_MS = 10_000 // 10 giây

interface Payload {
  nonce: string
  locationId: string
  ts: number
}

const store = new Map<string, { token: string; expiresAt: number }>()

export function generateToken(locationId: string): { token: string; expiresAt: Date } {
  const payload: Payload = { nonce: uuid(), locationId, ts: Date.now() }
  const token = btoa(JSON.stringify(payload))
  const expiresAt = Date.now() + TTL_MS
  store.set(locationId, { token, expiresAt })
  return { token, expiresAt: new Date(expiresAt) }
}

export function getCurrentToken(locationId: string): { token: string; expiresAt: Date } {
  const e = store.get(locationId)
  if (e && e.expiresAt > Date.now()) {
    return { token: e.token, expiresAt: new Date(e.expiresAt) }
  }
  return generateToken(locationId)
}

export function verifyToken(token: string): Payload | null {
  try {
    const p = JSON.parse(atob(token)) as Payload
    if (Date.now() - p.ts > TTL_MS) return null
    return p
  } catch {
    return null
  }
}

export function getSecondsLeft(locationId: string): number {
  const e = store.get(locationId)
  if (!e) return 0
  return Math.max(0, Math.ceil((e.expiresAt - Date.now()) / 1000))
}
