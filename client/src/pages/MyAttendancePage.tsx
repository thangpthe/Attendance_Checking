import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface MyLog { id: string; date: string; checkinAt: string | null; checkoutAt: string | null; status: string; valid: boolean }

export default function MyAttendancePage() {
  const token = useAuthStore(s => s.token)
  const [logs, setLogs] = useState<MyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [complainFor, setComplainFor] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState<File | null>(null)

  async function loadLogs() {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/my-attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(data.logs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLogs() }, []) // eslint-disable-line

  async function submitComplaint() {
    if (!complainFor || !reason) return
    const form = new FormData()
    form.append('attendanceLogId', complainFor)
    form.append('reason', reason)
    if (evidence) form.append('evidence', evidence)
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/my-attendance/complaints`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
    })
    const data = await res.json()
    if (res.ok) { alert(data.message); setComplainFor(null); setReason(''); setEvidence(null); loadLogs() }
    else alert(data.error)
  }

  return (
    <div className="page-wrapper fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 className="page-title">📋 Lịch sử điểm danh của tôi (7 ngày gần nhất)</h1>
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
                  <td>{l.valid ? '✅ Hợp lệ' : '⚠️ Chưa điểm danh'}</td>
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