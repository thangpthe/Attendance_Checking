import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request { user?: { id: string; role: string } }

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Thiếu token' })
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as any
    next()
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ hoặc hết hạn' })
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Không đủ quyền' })
  next()
}