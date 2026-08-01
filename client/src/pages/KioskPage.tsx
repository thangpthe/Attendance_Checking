import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import QrDisplay from '@/components/features/qr/QrDisplay'
import { useQrPoller } from '@/hooks/useQrPoller'
import { LOCATIONS } from '@/lib/api'
import Button from '@/components/common/Button'
import { MdQrCode2, MdRefresh, MdLocationOn, MdLock, MdFormatListNumbered, MdFace } from 'react-icons/md'

export default function KioskPage() {
  const [selectedId, setSelectedId] = useState(LOCATIONS[0].id)
  const { qrUrl, countdown, error, refreshNow } = useQrPoller(selectedId)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const selectedLoc = LOCATIONS.find(l => l.id === selectedId)

  return (
    <Layout>
      <div className="page-wrapper fade-in">
        {/* Header */}
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Màn hình QR Kiosk</h1>
            <p className="page-subtitle">QR tự động đổi mỗi 10 giây — chống gian lận</p>
          </div>
          <Button variant="secondary" size="sm" onClick={refreshNow}>
            <MdRefresh size={16} /> Làm mới QR
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* QR Card */}
          <div className="card card-p" style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 480, gap: 0,
            background: 'linear-gradient(135deg,rgba(99,102,241,.06),rgba(168,85,247,.04))',
          }}>
            <QrDisplay
              qrValue={qrUrl}
              countdown={countdown}
              locationName={selectedLoc?.name || ''}
              totalSeconds={10}
              error={error}
            />
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Clock */}
            <div className="card card-p" style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 42, fontWeight: 900, fontVariantNumeric: 'tabular-nums',
                letterSpacing: 2, color: 'var(--text-primary)', lineHeight: 1,
                marginBottom: 6,
              }}>
                {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {time.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>

            {/* Location selector */}
            <div className="card card-p">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em', display:'flex', alignItems:'center', gap:6 }}>
                <MdLocationOn size={15} /> Địa điểm
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedId(loc.id)}
                    style={{
                      padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${selectedId === loc.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: selectedId === loc.id
                        ? 'rgba(99,102,241,.12)' : 'rgba(255,255,255,.03)',
                      color: selectedId === loc.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                      fontWeight: selectedId === loc.id ? 700 : 500,
                      fontSize: 14, textAlign: 'left', transition: 'all .2s',
                    }}
                  >
                    {selectedId === loc.id ? '✓ ' : ''}{loc.name}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
                      {loc.address}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="card card-p">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em', display:'flex', alignItems:'center', gap:6 }}>
                <MdFormatListNumbered size={15} /> Hướng dẫn
              </div>
              {/* Face checkin flow */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <MdFace size={14} color="var(--accent)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)' }}>Chấm công bằng khuôn mặt</span>
                </div>
                {[
                  'Dùng camera điện thoại quét QR',
                  'Cho phép truy cập vị trí GPS',
                  'Nhìn thẳng vào camera → Chụp',
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,var(--accent),var(--purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: '#fff',
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              {/* QR+GPS flow */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Chấm công qua app (đã đăng nhập)
                </div>
                {[
                  'Đăng nhập tại ChamCong.vn',
                  'Vào trang Chấm công',
                  'Nhấn "Quét QR" → quét màn hình này',
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security badge */}
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.15)',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <MdLock size={18} color="var(--success)" />
              <div style={{ fontSize: 12, color: 'var(--success)' }}>
                <div style={{ fontWeight: 600 }}>Mã QR động — bảo mật cao</div>
                <div style={{ opacity: .7 }}>Mỗi mã chỉ có hiệu lực 10 giây</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
