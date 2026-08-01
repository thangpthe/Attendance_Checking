import { Router } from 'express'
import { readDb } from '../lib/db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// Tính ngày hôm nay theo timezone VN (UTC+7)
function todayVN(): string {
  return new Date(Date.now() + 7 * 3600000).toISOString().split('T')[0]
}

// GET /api/attendance/today-stats
router.get('/today-stats', authMiddleware, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Không đủ quyền' })

  const db = await readDb()
  const today = todayVN()
  const employees = db.users.filter((u: any) => u.role === 'EMPLOYEE' && u.status === 'ACTIVE')
  const logs = db.attendanceLogs.filter((l: any) => l.date === today)

  res.json({
    total: employees.length,
    checkedIn: logs.filter((l: any) => l.checkinAt).length,
    onTime: logs.filter((l: any) => l.status === 'ON_TIME').length,
    late: logs.filter((l: any) => l.status === 'LATE').length,
    absent: logs.filter((l: any) => l.status === 'ABSENT').length,
    notYet: employees.length - logs.filter((l: any) => l.checkinAt).length,
  })
})

// GET /api/attendance/history?userId=&date=&status=
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  const db = await readDb()
  const { userId, date, status } = req.query as Record<string, string>

  // Employee chỉ được xem của mình
  const effectiveUserId = req.user?.role === 'EMPLOYEE' ? req.user.id : userId

  let logs = [...db.attendanceLogs] as any[]
  if (effectiveUserId) logs = logs.filter(l => l.userId === effectiveUserId)
  if (date) logs = logs.filter(l => l.date === date)
  if (status && status !== 'ALL') logs = logs.filter(l => l.status === status)

  const enriched = logs
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(l => ({
      ...l,
      user: (() => {
        const u = db.users.find((u: any) => u.id === l.userId) as any
        if (!u) return null
        const { passwordHash: _ph, faceDescriptor: _fd, ...safe } = u
        return safe
      })(),
      location: db.locations.find((loc: any) => loc.id === l.locationId),
      shift: db.shifts.find((s: any) => s.id === l.shiftId),
    }))

  res.json({ logs: enriched })
})

export default router
