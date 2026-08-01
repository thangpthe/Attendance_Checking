import { useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'

interface Props {
  /** URL hoặc token encode vào QR — dùng URL để phone scan mở face-checkin */
  qrValue: string
  countdown: number
  locationName: string
  totalSeconds?: number
  error?: string
}

export default function QrDisplay({ qrValue, countdown, locationName, totalSeconds = 10, error }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Fade animation mỗi khi QR đổi
  useEffect(() => {
    if (!ref.current) return
    ref.current.style.opacity = '0.2'
    const t = setTimeout(() => { if (ref.current) ref.current.style.opacity = '1' }, 250)
    return () => clearTimeout(t)
  }, [qrValue])

  const pct = Math.max(0, Math.min(100, (countdown / totalSeconds) * 100)).toFixed(0)
  const isUrgent = countdown <= 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>📍 Địa điểm</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{locationName}</div>
      </div>

      {error ? (
        <div style={{
          width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px dashed var(--danger)', borderRadius: 8,
          color: 'var(--danger)', fontSize: 13, textAlign: 'center', padding: 16,
        }}>
          ⚠️ {error}<br /><small style={{ opacity: .7 }}>Kiểm tra server</small>
        </div>
      ) : (
        <div ref={ref} className="qr-container" style={{ transition: 'opacity 0.25s ease' }}>
          <QRCode value={qrValue || 'loading'} size={220} level="M" />
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>QR đổi sau</div>
        <div className={`kiosk-countdown ${isUrgent ? 'countdown-urgent' : 'countdown-normal'}`}>
          {countdown}s
        </div>
      </div>

      <div className="qr-refresh-bar" style={{ width: 240 }}>
        <div className="qr-refresh-fill" style={{ width: `${pct}%`, transition: 'width 0.9s linear' }} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        🔒 QR động — thay đổi mỗi {totalSeconds}s để chống gian lận<br />
        <span style={{ opacity: .6 }}>Dùng camera điện thoại quét để chấm công</span>
      </div>
    </div>
  )
}
