import { Router } from 'express'
import { generateQrToken } from '../lib/qr'

const store = new Map<string, { token: string; expiresAt: number }>()
const router = Router()

router.get('/current/:locationId', (req, res) => {
  const { locationId } = req.params
  const existing = store.get(locationId)
  if (existing && existing.expiresAt > Date.now()) return res.json(existing)
  const fresh = generateQrToken(locationId)
  store.set(locationId, fresh)
  res.json(fresh)
})

export default router