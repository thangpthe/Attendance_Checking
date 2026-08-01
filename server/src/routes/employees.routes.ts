import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { UserModel } from '../models/User.js'

const router = Router()
router.use(authMiddleware, adminOnly)

router.get('/', async (_req, res) => {
  const users = await UserModel.find().populate('locationId').populate('shiftId')
  res.json({ data: users.map(u => u.toJSON()) })
})

router.post('/', async (req, res) => {
  const { password, ...rest } = req.body
  const passwordHash = await bcrypt.hash(password || '123456', 10)
  const user = await UserModel.create({ ...rest, passwordHash })
  res.json({ data: user.toJSON() })
})

router.put('/:id', async (req, res) => {
  const { password, ...rest } = req.body
  const update: any = { ...rest }
  if (password) update.passwordHash = await bcrypt.hash(password, 10)
  const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!user) return res.status(404).json({ error: 'Không tìm thấy nhân viên' })
  res.json({ data: user.toJSON() })
})

export default router