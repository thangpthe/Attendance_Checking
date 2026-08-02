import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { AttendanceLogModel } from '../models/AttendanceLog.js'
import { ComplaintModel } from '../models/Complaint.js'

const router = Router()
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'evidence')

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { date } = req.query as { date?: string }
  const filter: any = { userId: req.user!.id }

  if (date) {
    filter.date = date // CheckinPage dùng để lấy đúng bản ghi hôm nay
  } else {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    filter.date = { $gte: sevenDaysAgo } // MyAttendancePage dùng mặc định 7 ngày
  }

  const logs = await AttendanceLogModel.find(filter).sort({ date: -1 }).lean()
  res.json({
    logs: logs.map(l => ({
      id: l._id.toString(), date: l.date,
      checkinAt: l.checkinAt, checkoutAt: l.checkoutAt,
      status: l.status, valid: !!l.checkinAt,
    })),
  })
})

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => { await fs.mkdir(UPLOAD_DIR, { recursive: true }); cb(null, UPLOAD_DIR) },
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
})

router.post('/complaints', authMiddleware, upload.single('evidence'), async (req: AuthRequest, res) => {
  const { attendanceLogId, reason } = req.body
  if (!reason || !attendanceLogId) return res.status(400).json({ error: 'Thiếu lý do khiếu nại hoặc bản ghi liên quan' })

  const log = await AttendanceLogModel.findOne({ _id: attendanceLogId, userId: req.user!.id })
  if (!log) return res.status(404).json({ error: 'Không tìm thấy bản ghi điểm danh của bạn' })

  await ComplaintModel.create({
    userId: req.user!.id, attendanceLogId,
    reason, evidencePath: req.file ? `/evidence/${req.file.filename}` : '',
  })
  res.json({ success: true, message: 'Đã gửi khiếu nại, quản lý sẽ xem xét sớm' })
})

export default router