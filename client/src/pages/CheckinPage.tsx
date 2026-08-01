import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import QrScanner from '@/components/features/qr/QrScanner'
import { apiGetHistory, apiCheckin } from '@/lib/api'
import { getTodayStr, formatDateLong, formatTime, getStatusVariant, getStatusLabel } from '@/lib/utils'
import { getCurrentPosition } from '@/lib/gps'
import type { EnrichedLog } from '@/types'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import {
  MdQrCodeScanner, MdMyLocation, MdCheckCircle,
  MdError, MdArrowBack, MdCelebration,
} from 'react-icons/md'

type Step = 'idle' | 'scanning' | 'gps' | 'confirm' | 'done'

const STEPS = ['Quét QR', 'Lấy GPS', 'Xác nhận', 'Kết quả'] as const

export default function CheckinPage() {
  const { user } = useAuthStore()
  const [step,    setStep]   = useState<Step>('idle')
  const [log,     setLog]    = useState<EnrichedLog | null>(null)
  const [token,   setToken]  = useState('')
  const [coords,  setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [time,    setTime]   = useState(new Date())
  const [message, setMessage]= useState('')
  const [error,   setError]  = useState('')
  const [loading, setLoading]= useState(false)

  /* live clock */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  /* load today's log */
  const refreshLog = async () => {
    if (!user) return
    // Server scopes tự động theo JWT — không cần gửi userId
    const res = await apiGetHistory({ date: getTodayStr() })
    setLog(res[0] ?? null)
  }
  useEffect(() => { refreshLog() }, [user]) // eslint-disable-line

  /* QR scanned → extract token (hỗ trợ cả raw token và URL deep link) → get GPS */
  const handleScan = async (scannedValue: string) => {
    // Kiosk encode URL dạng: http://host/face-checkin?t=<token>
    // CheckinPage chỉ cần lấy phần token
    let extractedToken = scannedValue
    try {
      const url = new URL(scannedValue)
      const t = url.searchParams.get('t')
      if (t) extractedToken = t
    } catch {
      // Không phải URL → dùng nguyên raw string
    }
    setToken(extractedToken)
    setStep('gps')
    try {
      const pos = await getCurrentPosition()
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    } catch {
      // Demo fallback: Hà Nội office area — xoá dòng này ở production
      setCoords({ lat: 21.0245, lng: 105.8412 })
    }
    setStep('confirm')
  }

  /* Submit checkin — userId diễn giải từ JWT phía server */
  const handleConfirm = async () => {
    if (!coords || !user) return
    setLoading(true)
    try {
      const res = await apiCheckin({ qrToken: token, lat: coords.lat, lng: coords.lng })
      setMessage(res.message)
      setError('')
      await refreshLog()
      setStep('done')
    } catch (err: unknown) {
      setError((err as Error).message)
      setStep('done')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setStep('idle'); setMessage(''); setError('') }

  const isCheckedIn  = !!log?.checkinAt
  const isCheckedOut = !!log?.checkoutAt
  const actionLabel  = isCheckedIn && !isCheckedOut ? 'Check-out' : 'Check-in'
  const stepIndex    = { idle: -1, scanning: 0, gps: 1, confirm: 2, done: 3 }[step]

  return (
    <Layout>
      <div className="page-wrapper fade-in">
        <div className="page-header">
          <h1 className="page-title">✅ Chấm công</h1>
          <p className="page-subtitle">{formatDateLong(getTodayStr())}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── Left: Info panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Clock */}
            <div className="card card-p" style={{ textAlign: 'center' }}>
              <div className="time-display" style={{ marginBottom: 4 }}>
                {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {time.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
              </div>
            </div>

            {/* User info */}
            <div className="card card-p">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,var(--accent),var(--purple))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>{user?.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.department}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Today status */}
            <div className="card card-p">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Trạng thái hôm nay
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="flex-between">
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Check-in</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15,
                    color: isCheckedIn ? 'var(--success)' : 'var(--text-muted)',
                  }}>
                    {isCheckedIn ? formatTime(log!.checkinAt) : '--:--'}
                  </span>
                </div>
                <div className="flex-between">
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Check-out</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15,
                    color: isCheckedOut ? 'var(--success)' : 'var(--text-muted)',
                  }}>
                    {isCheckedOut ? formatTime(log!.checkoutAt) : '--:--'}
                  </span>
                </div>
                {log?.status && log.status !== 'PENDING' && (
                  <div className="flex-between" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Trạng thái</span>
                    <Badge variant={getStatusVariant(log.status)}>{getStatusLabel(log.status)}</Badge>
                  </div>
                )}
                {isCheckedOut && (
                  <div style={{
                    padding: '10px 12px', borderRadius: 8, marginTop: 4,
                    background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)',
                    textAlign: 'center', fontSize: 13, color: 'var(--success)', fontWeight: 600,
                  }}>
                    🎉 Hoàn thành ca làm việc hôm nay!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Action panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Step indicator */}
            {step !== 'idle' && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                {STEPS.map((label, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                        background: i < stepIndex ? 'var(--success)'
                          : i === stepIndex ? 'linear-gradient(135deg,var(--accent),var(--purple))'
                          : 'var(--border)',
                        color: i <= stepIndex ? '#fff' : 'var(--text-muted)',
                        transition: 'all .3s',
                      }}>
                        {i < stepIndex ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 10, color: i <= stepIndex ? 'var(--text-secondary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        flex: 1, height: 2, margin: '0 6px', marginBottom: 16,
                        background: i < stepIndex ? 'var(--success)' : 'var(--border)',
                        transition: 'background .3s',
                      }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action card */}
            <div className="card card-p" style={{
              minHeight: 320, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20,
            }}>

              {/* IDLE */}
              {step === 'idle' && (
                <div style={{ textAlign: 'center' }}>
                  {isCheckedOut ? (
                    <>
                      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Hoàn thành ca!</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Bạn đã check-in và check-out hôm nay.</p>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: 96, height: 96, borderRadius: '50%', margin: '0 auto 24px',
                        background: 'linear-gradient(135deg,rgba(99,102,241,.15),rgba(168,85,247,.1))',
                        border: '2px solid rgba(99,102,241,.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <MdQrCodeScanner size={40} color="var(--accent)" />
                      </div>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: 18 }}>
                        {isCheckedIn ? 'Quét QR để Check-out' : 'Quét QR để Check-in'}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
                        Hướng camera vào màn hình kiosk để quét mã QR
                      </p>
                      <Button size="lg" onClick={() => setStep('scanning')}>
                        📸 Quét QR — {actionLabel}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* SCANNING */}
              {step === 'scanning' && (
                <QrScanner onScan={handleScan} onClose={() => setStep('idle')} />
              )}

              {/* GPS */}
              {step === 'gps' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                    background: 'rgba(99,102,241,.1)', border: '2px solid rgba(99,102,241,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'spin 1.5s linear infinite',
                  }}>
                    <MdMyLocation size={30} color="var(--accent)" />
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Đang lấy vị trí GPS...</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Vui lòng cho phép truy cập vị trí nếu được hỏi</p>
                </div>
              )}

              {/* CONFIRM */}
              {step === 'confirm' && (
                <div style={{ textAlign: 'center', width: '100%', maxWidth: 320 }}>
                  <MdCheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 20px', display: 'block' }} />
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>QR hợp lệ!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
                    GPS: {coords?.lat.toFixed(5)}, {coords?.lng.toFixed(5)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    <Button fullWidth loading={loading} onClick={handleConfirm}>
                      Xác nhận {actionLabel}
                    </Button>
                    <Button variant="ghost" fullWidth onClick={() => setStep('idle')}>Hủy</Button>
                  </div>
                </div>
              )}

              {/* DONE */}
              {step === 'done' && (
                <div style={{ textAlign: 'center', width: '100%', maxWidth: 320 }}>
                  {error ? (
                    <>
                      <MdError size={52} color="var(--danger)" style={{ margin: '0 auto 16px', display: 'block' }} />
                      <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>
                    </>
                  ) : (
                    <>
                      <MdCelebration size={52} color="var(--success)" style={{ margin: '0 auto 16px', display: 'block' }} />
                      <div className="alert alert-success" style={{ marginBottom: 20 }}>{message}</div>
                    </>
                  )}
                  <Button variant="secondary" fullWidth onClick={reset}>
                    <MdArrowBack size={16} /> Quay lại
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
