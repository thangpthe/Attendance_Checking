import { Router } from 'express'
import { readDb, writeDb } from '../lib/db.js'
import { verifyQrToken } from '../lib/qr.js'
import { isWithinRadius } from '../lib/gps.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { v4 as uuid } from 'uuid'

const router = Router()

// Tính ngày hôm nay theo timezone VN (UTC+7)
function todayVN(): string {
  return new Date(Date.now() + 7 * 3600000).toISOString().split('T')[0]
}

// POST /api/checkin/qr — check-in bằng QR + GPS (không cần face, cần đăng nhập)
router.post('/qr', authMiddleware, async (req: AuthRequest, res) => {
  const { qrToken, lat, lng } = req.body
  const userId = req.user!.id

  // 1. Xác thực QR token (server-side)
  if (!qrToken) return res.status(400).json({ error: 'Thiếu mã QR' })
  const qrPayload = verifyQrToken(qrToken)
  if (!qrPayload) return res.status(400).json({ error: 'QR Code đã hết hạn! Vui lòng quét mã mới trên màn hình kiosk.' })

  // 2. Xác thực tọa độ GPS
  const userLat = Number(lat)
  const userLng = Number(lng)
  if (isNaN(userLat) || isNaN(userLng)) return res.status(400).json({ error: 'Tọa độ GPS không hợp lệ' })

  const db = await readDb()
  const user = db.users.find((u: any) => u.id === userId) as any
  if (!user || user.status === 'INACTIVE') return res.status(403).json({ error: 'Tài khoản không hợp lệ' })

  // 3. Tìm địa điểm từ QR
  const location = db.locations.find((l: any) => l.id === qrPayload.locationId) as any
  if (!location) return res.status(400).json({ error: 'Địa điểm trong QR không tồn tại' })

  // 4. Kiểm tra GPS geofence (server-side — không thể bypass)
  const within = isWithinRadius(userLat, userLng, location.lat, location.lng, location.radius)
  if (!within) {
    // TODO: GPS spoofing detection
    return res.status(400).json({
      error: `Bạn đang ngoài phạm vi cho phép (${location.radius}m) của ${location.name}. Hãy đảm bảo bạn đang ở văn phòng.`
    })
  }

  // 5. Tìm ca làm việc của nhân viên
  const shift = db.shifts.find((s: any) => s.id === user.shiftId) as any
  if (!shift) return res.status(400).json({ error: 'Chưa được phân ca làm việc' })

  const today = todayVN()
  const now = new Date()
  const existing = db.attendanceLogs.find((l: any) => l.userId === userId && l.date === today) as any

  if (existing) {
    if (existing.checkoutAt) {
      return res.status(400).json({ error: 'Bạn đã hoàn thành chấm công cho hôm nay rồi!' })
    }
    // Check-out
    existing.checkoutAt = now.toISOString()
    await writeDb(db)
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    return res.json({
      success: true, type: 'CHECKOUT',
      message: `✅ Check-out thành công lúc ${timeStr}`,
    })
  }

  // 6. Xác định trạng thái: đúng giờ / muộn
  const [h, m] = shift.checkinEnd.split(':').map(Number)
  const deadline = new Date(now)
  deadline.setHours(h, m, 0, 0)
  const status = now > deadline ? 'LATE' : 'ON_TIME'

  // 7. Ghi log check-in
  db.attendanceLogs.push({
    id: uuid(),
    userId,
    locationId: location.id,
    shiftId: shift.id,
    date: today,
    checkinAt: now.toISOString(),
    checkoutAt: null,
    checkinLat: userLat,
    checkinLng: userLng,
    status,
    note: status === 'LATE' ? 'Đi muộn' : '',
  })
  await writeDb(db)

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return res.json({
    success: true, type: 'CHECKIN', status,
    message: status === 'ON_TIME'
      ? `✅ Check-in đúng giờ lúc ${timeStr}!`
      : `⚠️ Check-in muộn lúc ${timeStr} (sau ${shift.checkinEnd})`,
  })
})

export { router as checkinQrRouter }
