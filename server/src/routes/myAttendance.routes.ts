import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuid } from 'uuid'
import { readDb, writeDb } from '../lib/db'
import { faceSessionAuth, FaceAuthRequest } from '../middleware/faceSessionAuth'

const router = Router()
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'evidence')

router.get('/', faceSessionAuth, async (req: FaceAuthRequest, res) => {
  const db = await readDb()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const logs = db.attendanceLogs
    .filter((l: any) => l.userId === req.faceUserId && l.date >= sevenDaysAgo)
    .sort((a: any, b: any) => b.date.localeCompare(a.date))
    .map((l: any) => ({
      id: l.id, date: l.date,
      checkinAt: l.checkinAt, checkoutAt: l.checkoutAt,
      status: l.status,
      valid: !!l.checkinAt,
    }))

  res.json({ logs })
})


const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
      cb(null, UPLOAD_DIR)
    },
    filename: (_req, file, cb) => cb(null, `${uuid()}-${file.originalname}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
})

router.post('/complaints', faceSessionAuth, upload.single('evidence'), async (req: FaceAuthRequest, res) => {
  const { attendanceLogId, reason } = req.body
  if (!reason || !attendanceLogId) return res.status(400).json({ error: 'Thiếu lý do khiếu nại hoặc bản ghi liên quan' })

  const db = await readDb()
  const log = db.attendanceLogs.find((l: any) => l.id === attendanceLogId && l.userId === req.faceUserId)
  if (!log) return res.status(404).json({ error: 'Không tìm thấy bản ghi chấm công của bạn' })

  db.complaints.push({
    id: uuid(),
    userId: req.faceUserId!,
    attendanceLogId,
    reason,
    evidencePath: req.file ? `/evidence/${req.file.filename}` : '',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  })
  await writeDb(db)
  res.json({ success: true, message: 'Đã gửi khiếu nại, quản lý sẽ xem xét sớm' })
})

export default router