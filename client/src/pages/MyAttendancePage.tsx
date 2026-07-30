import { useState, useEffect } from 'react'
import FaceCapture from '@/components/features/face/FaceCapture'
import { getFaceSessionToken, saveFaceSession, clearFaceSession } from '@/lib/faceSessionClient'

interface MyLog { id: string; date: string; checkinAt: string | null; checkoutAt: string | null; status: string; valid: boolean }

export default function MyAttendancePage() {
  const [needAuth, setNeedAuth] = useState(!getFaceSessionToken())
  const [logs, setLogs] = useState<MyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [complainFor, setComplainFor] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState<File | null>(null)

  async function loadLogs() {
    const token = getFaceSessionToken()
    if (!token) { setNeedAuth(true); return }
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/my-attendance`, {
        headers: { 'x-face-session': token },
      })
      const data = await res.json()
      if (data.needFaceAuth) { clearFaceSession(); setNeedAuth(true); return }
      setLogs(data.logs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (!needAuth) loadLogs() }, [needAuth]) // eslint-disable-line

  async function handleReidentify(blob: Blob) {
    const form = new FormData()
    form.append('face', blob, 'face.jpg')
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/face/identify`, { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    saveFaceSession(data.faceSessionToken)
    setNeedAuth(false)
  }

  async function submitComplaint() {
    const token = getFaceSessionToken()
    if (!token || !complainFor || !reason) return
    const form = new FormData()
    form.append('attendanceLogId', complainFor)
    form.append('reason', reason)
    if (evidence) form.append('evidence', evidence)
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/my-attendance/complaints`, {
      method: 'POST', headers: { 'x-face-session': token }, body: form,
    })
    const data = await res.json()
    if (res.ok) { alert(data.message); setComplainFor(null); setReason(''); setEvidence(null) }
    else alert(data.error)
  }

  if (needAuth) {
    return (
      <div className="page-wrapper" style={{ maxWidth: 420, margin: '40px auto' }}>
        <div className="card card-p" style={{ textAlign: 'center' }}>
          <h2 className="page-title">Xác thực khuôn mặt để xem lịch sử của bạn</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <FaceCapture onCapture={handleReidentify} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 className="page-title">📋 Lịch sử chấm công của tôi (7 ngày gần nhất)</h1>
      {loading ? <p>Đang tải...</p> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Ngày</th><th>Check-in</th><th>Check-out</th><th>Trạng thái</th><th>Hợp lệ</th><th></th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>{l.checkinAt ? new Date(l.checkinAt).toLocaleTimeString('vi-VN') : '--'}</td>
                  <td>{l.checkoutAt ? new Date(l.checkoutAt).toLocaleTimeString('vi-VN') : '--'}</td>
                  <td>{l.status}</td>
                  <td>{l.valid ? '✅ Hợp lệ' : '⚠️ Chưa chấm công'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setComplainFor(l.id)}>Khiếu nại</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {complainFor && (
        <div className="card card-p" style={{ marginTop: 20 }}>
          <h3>Gửi khiếu nại</h3>
          <textarea className="form-input" placeholder="Lý do khiếu nại..." value={reason} onChange={e => setReason(e.target.value)} />
          <input type="file" accept="image/*" onChange={e => setEvidence(e.target.files?.[0] || null)} style={{ marginTop: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={submitComplaint}>Gửi</button>
            <button className="btn btn-ghost" onClick={() => setComplainFor(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  )
}