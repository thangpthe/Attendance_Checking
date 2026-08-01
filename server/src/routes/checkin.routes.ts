import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { verifyQrToken } from '../lib/qr.js'
import { isWithinRadius } from '../lib/gps.js'
import { LocationModel } from '../models/Location.js'
import { UserModel } from '../models/User.js'
import { AttendanceLogModel } from '../models/AttendanceLogs.js'

const router = Router()
const GEOFENCE_RADIUS_M = Number(process.env.GEOFENCE_RADIUS_M || 20)

// Chỉ cần đăng nhập (JWT) — không cần ảnh khuôn mặt nữa
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { qrToken, lat, lng } = req.body
    if (!qrToken || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Thiếu mã QR hoặc vị trí GPS' })
    }

    const qrResult = verifyQrToken(qrToken)
    if (!qrResult) return res.status(400).json({ error: 'Mã QR đã hết hạn hoặc không hợp lệ, vui lòng quét lại' })

    const location = await LocationModel.findById(qrResult.locationId)
    if (!location) return res.status(400).json({ error: 'Không tìm thấy địa điểm' })

    const userLat = Number(lat), userLng = Number(lng)
    if (!isWithinRadius(userLat, userLng, location.lat, location.lng, GEOFENCE_RADIUS_M)) {
      return res.status(400).json({ error: `Bạn đang ở ngoài phạm vi cho phép (tối đa ${GEOFENCE_RADIUS_M}m)` })
    }

    const user = await UserModel.findById(req.user!.id)
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    if (user.status !== 'ACTIVE') return res.status(403).json({ error: 'Tài khoản không hoạt động' })

    const today = new Date().toISOString().split('T')[0]
    let log = await AttendanceLogModel.findOne({ userId: user.id, date: today })
    const now = new Date()
    let type: 'CHECKIN' | 'CHECKOUT'

    if (!log) {
      type = 'CHECKIN'
      log = await AttendanceLogModel.create({
        userId: user.id, locationId: location.id, shiftId: user.shiftId,
        date: today, checkinAt: now, checkinLat: userLat, checkinLng: userLng,
        status: 'ON_TIME',
      })
    } else if (!log.checkoutAt) {
      type = 'CHECKOUT'
      log.checkoutAt = now
      await log.save()
    } else {
      return res.status(400).json({ error: 'Bạn đã hoàn thành điểm danh hôm nay rồi' })
    }

    res.json({
      success: true, type,
      message: type === 'CHECKIN'
        ? `Check-in thành công lúc ${now.toLocaleTimeString('vi-VN')}`
        : `Check-out thành công lúc ${now.toLocaleTimeString('vi-VN')}`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi hệ thống khi xử lý điểm danh' })
  }
})

export default router