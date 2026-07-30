import { useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'

interface Props {
  token: string; countdown: number; locationName: string; totalSeconds?: number
}

export default function QrDisplay({ token, countdown, locationName, totalSeconds = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.style.opacity = '0.3'
    const t = setTimeout(() => { if (ref.current) ref.current.style.opacity = '1' }, 200)
    return () => clearTimeout(t)
  }, [token])

  const pct = ((countdown / totalSeconds) * 100).toFixed(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>📍 Địa điểm</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{locationName}</div>
      </div>

      <div ref={ref} className="qr-container" style={{ transition: 'opacity 0.2s' }}>
        <QRCode value={token || 'init'} size={220} level="M" />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>QR đổi sau</div>
        <div className={`kiosk-countdown ${countdown <= 3 ? 'countdown-urgent' : 'countdown-normal'}`}>
          {countdown}s
        </div>
      </div>

      <div className="qr-refresh-bar" style={{ width: 240 }}>
        <div className="qr-refresh-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        🔒 QR động — thay đổi mỗi {totalSeconds}s để chống gian lận
      </div>
    </div>
  )
}
