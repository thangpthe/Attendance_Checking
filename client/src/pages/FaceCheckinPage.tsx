import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import FaceCapture from '@/components/features/face/FaceCapture'
import { saveFaceSession } from '@/lib/faceSessionClient'
import { MdMyLocation, MdCelebration, MdError } from 'react-icons/md'

type Step = 'gps' | 'face' | 'submitting' | 'done'

export default function FaceCheckinPage() {
  const [params] = useSearchParams()
  const qrToken = params.get('t') || ''
  const [step, setStep] = useState<Step>('gps')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ message: string; type: string } | null>(null)

  useEffect(() => {
    if (!qrToken) { setError('Thiếu mã QR, vui lòng quét lại từ màn hình kiosk'); return }
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setStep('face') },
      () => setError('Không thể lấy vị trí GPS. Vui lòng cấp quyền vị trí và thử lại.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [qrToken])

  async function handleCapture(blob: Blob) {
    if (!coords) return
    setStep('submitting')
    const form = new FormData()
    form.append('face', blob, 'face.jpg')
    form.append('qrToken', qrToken)
    form.append('lat', String(coords.lat))
    form.append('lng', String(coords.lng))

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkin/face`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      saveFaceSession(data.faceSessionToken)
      setResult({ message: `${data.employeeName}: ${data.message}`, type: data.type })
      setStep('done')
    } catch (err: any) {
      setError(err.message || 'Chấm công thất bại')
      setStep('done')
    }
  }

  return (
    <div className="page-wrapper fade-in" style={{ maxWidth: 420, margin: '40px auto' }}>
      <div className="card card-p" style={{ textAlign: 'center' }}>
        <h1 className="page-title" style={{ marginBottom: 20 }}>✅ Chấm công bằng khuôn mặt</h1>

        {error && step !== 'done' && <div className="alert alert-error">{error}</div>}

        {step === 'gps' && !error && (
          <div>
            <MdMyLocation size={40} color="var(--accent)" />
            <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Đang lấy vị trí GPS của bạn...</p>
          </div>
        )}

        {step === 'face' && <FaceCapture onCapture={handleCapture} />}

        {step === 'submitting' && <p style={{ color: 'var(--text-muted)' }}>Đang xác thực khuôn mặt và vị trí...</p>}

        {step === 'done' && (
          <div>
            {error ? (
              <>
                <MdError size={48} color="var(--danger)" />
                <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>
              </>
            ) : (
              <>
                <MdCelebration size={48} color="var(--success)" />
                <div className="alert alert-success" style={{ marginTop: 12 }}>{result?.message}</div>
              </>
            )}
            <a href="/my-attendance" style={{ display: 'inline-block', marginTop: 16 }}>Xem lịch sử chấm công của tôi →</a>
          </div>
        )}
      </div>
    </div>
  )
}