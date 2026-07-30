import crypto from 'crypto'

const SECRET = process.env.QR_SECRET || 'dev-secret'
const TTL_MS = 10_000

export function generateQrToken(locationId: string) {
  const ts = Date.now()
  const nonce = crypto.randomUUID()
  const payload = `${locationId}.${ts}.${nonce}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  const token = Buffer.from(`${payload}.${sig}`).toString('base64url')
  return { token, expiresAt: ts + TTL_MS }
}

export function verifyQrToken(token: string): { locationId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [locationId, ts, nonce, sig] = decoded.split('.')
    const payload = `${locationId}.${ts}.${nonce}`
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
    if (sig !== expected) return null
    if (Date.now() - Number(ts) > TTL_MS) return null
    return { locationId }
  } catch {
    return null
  }
}