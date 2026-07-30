import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import QrDisplay from '@/components/features/qr/QrDisplay'
import { useQrPoller } from '@/hooks/useQrPoller'
import { LOCATIONS } from '@/lib/api'
import Button from '@/components/common/Button'
import { MdQrCode2, MdRefresh, MdLocationOn, MdLock, MdFormatListNumbered } from 'react-icons/md'

export default function KioskPage() {
  const [selectedId, setSelectedId] = useState(LOCATIONS[0].id)
  const { token, countdown, refreshNow } = useQrPoller(selectedId)
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
              token={token}
              countdown={countdown}
              locationName={selectedLoc?.name || ''}
              totalSeconds={10}
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
              {[
                { n: '1', text: 'Mở ChamCong.vn trên điện thoại' },
                { n: '2', text: 'Đăng nhập tài khoản nhân viên' },
                { n: '3', text: 'Nhấn "Quét QR để Check-in"' },
                { n: '4', text: 'Đưa camera quét mã QR này' },
                { n: '5', text: 'Xác nhận vị trí và chấm công' },
              ].map(item => (
                <div key={item.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,var(--accent),var(--purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                  }}>{item.n}</div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
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
