import type {
  User, EnrichedUser, EnrichedLog, TodayStats,
  CheckinRequest, CheckinResponse,
} from '../types'
import { LOCATIONS, SHIFTS } from '../data/mockData'
import { useAuthStore } from '@/store/authStore'

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

function authHeader() {
  const token = useAuthStore.getState().token
  return { Authorization: `Bearer ${token}` }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...authHeader(), ...options?.headers } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data as T
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại')
  return data // { user, token }
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

export async function apiGetHistory(params: { date?: string; userId?: string; status?: string } = {}): Promise<EnrichedLog[]> {
  const qs = new URLSearchParams()
  if (params.date) qs.set('date', params.date)
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/my-attendance?${qs}`, {
    headers: authHeader(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Không tải được lịch sử')
  return data.logs
}



export async function apiCheckin(req: { qrToken: string; lat: number; lng: number }): Promise<CheckinResponse> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(req),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Điểm danh thất bại')
  return data
}
