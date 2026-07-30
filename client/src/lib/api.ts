import type {
  User, EnrichedUser, EnrichedLog, TodayStats,
  CheckinRequest, CheckinResponse, AttendanceStatus,
} from '../types'
import { USERS, PASSWORDS, LOCATIONS, SHIFTS, ATTENDANCE_LOGS } from '../data/mockData'
import { verifyToken } from './qr'
import { isWithinRadius } from './gps'
import { getTodayStr } from './utils'

export { LOCATIONS, SHIFTS }

const delay = (ms = 350) => new Promise<void>(r => setTimeout(r, ms))

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<User> {
  await delay()
  const user = USERS.find(u => u.email === email)
  if (!user || PASSWORDS[email] !== password) {
    throw new Error('Email hoặc mật khẩu không đúng')
  }
  if (user.status === 'INACTIVE') throw new Error('Tài khoản đã bị vô hiệu hóa')
  return user
}

// ─── Employees ───────────────────────────────────────────────────────────────

export async function apiGetEmployees(): Promise<EnrichedUser[]> {
  await delay(250)
  return USERS.map(u => ({
    ...u,
    location: LOCATIONS.find(l => l.id === u.locationId),
    shift:    SHIFTS.find(s => s.id === u.shiftId),
  }))
}

// ─── Attendance Stats ─────────────────────────────────────────────────────────

export async function apiGetTodayStats(): Promise<TodayStats> {
  await delay(200)
  const today    = getTodayStr()
  const logs     = ATTENDANCE_LOGS.filter(l => l.date === today)
  const employees = USERS.filter(u => u.role === 'EMPLOYEE' && u.status === 'ACTIVE')
  return {
    total:     employees.length,
    checkedIn: logs.filter(l => l.checkinAt).length,
    onTime:    logs.filter(l => l.status === 'ON_TIME').length,
    late:      logs.filter(l => l.status === 'LATE').length,
    absent:    logs.filter(l => l.status === 'ABSENT').length,
    notYet:    employees.length - logs.length,
  }
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function apiGetHistory(params: {
  userId?: string
  date?: string
  status?: string
}): Promise<EnrichedLog[]> {
  await delay(300)
  let logs = [...ATTENDANCE_LOGS]
  if (params.userId) logs = logs.filter(l => l.userId === params.userId)
  if (params.date)   logs = logs.filter(l => l.date   === params.date)
  if (params.status && params.status !== 'ALL') {
    logs = logs.filter(l => l.status === params.status)
  }

  return logs
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(l => ({
      ...l,
      user:     USERS.find(u => u.id === l.userId)!,
      location: LOCATIONS.find(loc => loc.id === l.locationId)!,
      shift:    SHIFTS.find(s => s.id === l.shiftId)!,
    }))
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export async function apiCheckin(req: CheckinRequest): Promise<CheckinResponse> {
  await delay(500)
  const { userId, qrToken, lat, lng } = req

  // 1. Verify QR
  const payload = verifyToken(qrToken)
  if (!payload) throw new Error('QR Code đã hết hạn! Vui lòng quét mã mới trên màn hình kiosk.')

  // 2. Find user
  const user = USERS.find(u => u.id === userId)
  if (!user || user.status === 'INACTIVE') throw new Error('Tài khoản không hợp lệ')

  // 3. Find location
  const location = LOCATIONS.find(l => l.id === payload.locationId)
  if (!location) throw new Error('Địa điểm trong QR không tồn tại')

  // 4. GPS check
  const within = isWithinRadius(location.lat, location.lng, location.radius, lat, lng)
  if (!within) {
    const dist = Math.round(
      ((lat - location.lat) ** 2 + (lng - location.lng) ** 2) ** 0.5 * 111_000
    )
    throw new Error(
      `Bạn đang ngoài phạm vi cho phép (${location.radius}m) của ${location.name}. Khoảng cách ước tính: ~${dist}m`
    )
  }

  // 5. Find shift
  const shift = SHIFTS.find(s => s.id === user.shiftId)
  if (!shift) throw new Error('Chưa được phân ca làm việc')

  const today = getTodayStr()
  const now   = new Date()

  // 6. Check existing log
  const existing = ATTENDANCE_LOGS.find(l => l.userId === userId && l.date === today)

  if (existing) {
    if (existing.checkoutAt) {
      throw new Error('Bạn đã hoàn thành chấm công cho hôm nay rồi!')
    }
    // Checkout
    existing.checkoutAt = now.toISOString()
    return {
      success: true, type: 'CHECKOUT',
      message: `✅ Check-out thành công lúc ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
    }
  }

  // 7. Determine status
  const [h, m] = shift.checkinEnd.split(':').map(Number)
  const deadline = new Date(now)
  deadline.setHours(h, m, 0, 0)
  const status: AttendanceStatus = now > deadline ? 'LATE' : 'ON_TIME'

  // 8. Record log
  ATTENDANCE_LOGS.push({
    id: `log_${Date.now()}`,
    userId, locationId: location.id, shiftId: shift.id,
    date: today,
    checkinAt:  now.toISOString(),
    checkoutAt: null,
    checkinLat: lat, checkinLng: lng,
    status, note: status === 'LATE' ? 'Đi muộn' : '',
  })

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return {
    success: true, type: 'CHECKIN', status,
    message: status === 'ON_TIME'
      ? `✅ Check-in đúng giờ lúc ${timeStr}!`
      : `⚠️ Check-in muộn lúc ${timeStr} (sau ${shift.checkinEnd})`,
  }
}
