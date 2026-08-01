import type {
  User, EnrichedUser, EnrichedLog, TodayStats,
  CheckinRequest, CheckinResponse,
} from '../types'
import { LOCATIONS, SHIFTS } from '../data/mockData'

export { LOCATIONS, SHIFTS }

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Token helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('jwt_token')
}

export function saveToken(token: string) {
  localStorage.setItem('jwt_token', token)
}

export function clearToken() {
  localStorage.removeItem('jwt_token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...authHeaders(), ...options?.headers } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data as T
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<User> {
  const data = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveToken(data.token)
  return data.user
}

// ─── Employees ───────────────────────────────────────────────────────────────

export async function apiGetEmployees(): Promise<EnrichedUser[]> {
  const data = await apiFetch<{ users: EnrichedUser[] }>('/api/employees')
  return data.users
}

// ─── Attendance Stats ─────────────────────────────────────────────────────────

export async function apiGetTodayStats(): Promise<TodayStats> {
  return apiFetch<TodayStats>('/api/attendance/today-stats')
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function apiGetHistory(params: {
  userId?: string
  date?: string
  status?: string
}): Promise<EnrichedLog[]> {
  const qs = new URLSearchParams()
  if (params.userId) qs.set('userId', params.userId)
  if (params.date)   qs.set('date', params.date)
  if (params.status && params.status !== 'ALL') qs.set('status', params.status)
  const data = await apiFetch<{ logs: EnrichedLog[] }>(`/api/attendance/history?${qs}`)
  return data.logs
}

// ─── Check-in (QR + GPS, JWT auth) ───────────────────────────────────────────

export async function apiCheckin(req: CheckinRequest): Promise<CheckinResponse> {
  return apiFetch<CheckinResponse>('/api/checkin/qr', {
    method: 'POST',
    body: JSON.stringify({ qrToken: req.qrToken, lat: req.lat, lng: req.lng }),
  })
}
