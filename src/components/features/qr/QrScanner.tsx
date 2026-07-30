import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props { onScan: (token: string) => void; onClose: () => void }

export default function QrScanner({ onScan, onClose }: Props) {
  const [started, setStarted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-scanner-el')
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 240 },
      (text) => {
        scanner.stop().then(() => onScan(text)).catch(console.error)
      },
      () => {} // ignore errors
    ).then(() => setStarted(true)).catch(err => setError(err.message || 'Không thể truy cập camera'))

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(console.error)
      }
    }
  }, [onScan])

  return (
    <div className="qr-scanner-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div id="qr-scanner-el" style={{ width: 300, height: 300, background: 'black', borderRadius: 8, overflow: 'hidden' }} />
      {!started && !error && <div style={{ color: 'white', marginTop: 16 }}>Đang khởi động camera...</div>}
      {error && <div style={{ color: 'var(--danger)', marginTop: 16 }}>{error}</div>}
      <button onClick={onClose} style={{ marginTop: 24, padding: '8px 24px', background: 'white', color: 'black', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Đóng</button>
    </div>
  )
}
