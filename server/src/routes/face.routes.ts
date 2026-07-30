import { Router } from 'express'
import multer from 'multer'
import { readDb, writeDb } from '../lib/db.js'
import { extractFaceDescriptor, findBestMatch } from '../lib/faceRecognition.js'
import { issueFaceSession } from '../lib/faceSession.js'
import { authMiddleware, adminOnly } from '../middleware/auth'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const router = Router()

router.post('/identify', upload.single('face'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Thiếu ảnh khuôn mặt' })
  const db = await readDb()
  const descriptor = await extractFaceDescriptor(req.file.buffer)
  if (!descriptor) return res.status(400).json({ error: 'Không phát hiện khuôn mặt, vui lòng thử lại' })
  const match = findBestMatch(descriptor, db.users)
  if (!match) return res.status(401).json({ error: 'Không nhận diện được, vui lòng thử lại hoặc liên hệ quản lý' })
  const faceSessionToken = issueFaceSession(match.userId)
  res.json({ success: true, faceSessionToken })
})


router.post('/enroll/:userId', authMiddleware, adminOnly, upload.single('face'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Thiếu ảnh khuôn mặt' })
  const descriptor = await extractFaceDescriptor(req.file.buffer)
  if (!descriptor) return res.status(400).json({ error: 'Không phát hiện khuôn mặt trong ảnh' })

  const db = await readDb()
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ error: 'Không tìm thấy nhân viên' })
  user.faceDescriptor = Array.from(descriptor)
  await writeDb(db)
  res.json({ success: true, message: `Đã đăng ký khuôn mặt cho ${user.name}` })
})

export default router