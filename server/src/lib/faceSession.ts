import jwt from 'jsonwebtoken'

const SECRET = process.env.FACE_SESSION_SECRET || 'face-session-secret'
const SESSION_TTL = '30m'

export function issueFaceSession(userId: string): string {
  return jwt.sign({ userId, type: 'face-session' }, SECRET, { expiresIn: SESSION_TTL })
}

export function verifyFaceSession(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as any
    if (payload.type !== 'face-session') return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}