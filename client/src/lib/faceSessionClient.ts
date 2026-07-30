const KEY = 'face_session'

export function saveFaceSession(token: string) {
  localStorage.setItem(KEY, JSON.stringify({ token, savedAt: Date.now() }))
}

export function getFaceSessionToken(): string | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  const { token, savedAt } = JSON.parse(raw)
  // phòng hờ client-side, backend vẫn là nơi verify thật (JWT tự hết hạn sau 30 phút)
  if (Date.now() - savedAt > 30 * 60 * 1000) {
    localStorage.removeItem(KEY)
    return null
  }
  return token
}

export function clearFaceSession() {
  localStorage.removeItem(KEY)
}