import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { readDb } from '../lib/db.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' })

  const db = await readDb()
  const user = db.users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
  if (user.status === 'INACTIVE') return res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa' })

  // Demo: plaintext password check (production dùng bcrypt)
  // Mật khẩu: admin@company.vn → admin123, nhân viên → 123456
  const DEMO_PASSWORDS: Record<string, string> = {
    'admin@company.vn': 'admin123',
  }
  const expected = DEMO_PASSWORDS[email] ?? '123456'
  if (password !== expected) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'change-me-in-prod',
    { expiresIn: '8h' }
  )

  // Trả về user object (không có passwordHash, faceDescriptor)
  const { passwordHash: _ph, faceDescriptor: _fd, ...safeUser } = user as any
  res.json({ token, user: safeUser })
})

export default router
