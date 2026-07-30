import { Request, Response, NextFunction } from 'express'
import { verifyFaceSession } from '../lib/faceSession'

export interface FaceAuthRequest extends Request { faceUserId?: string }

export function faceSessionAuth(req: FaceAuthRequest, res: Response, next: NextFunction) {
  const token = req.headers['x-face-session'] as string | undefined
  if (!token) return res.status(401).json({ error: 'Cần xác thực khuôn mặt', needFaceAuth: true })
  const result = verifyFaceSession(token)
  if (!result) return res.status(401).json({ error: 'Phiên xác thực đã hết hạn', needFaceAuth: true })
  req.faceUserId = result.userId
  next()
}