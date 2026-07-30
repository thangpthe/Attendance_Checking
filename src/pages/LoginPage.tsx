import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiLogin } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/common/Button'
import { MdQrCode2, MdLogin, MdShield, MdPerson } from 'react-icons/md'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()
  const { user, login } = useAuthStore()

  useEffect(() => {
    if (user) navigate(user.role === 'ADMIN' ? '/dashboard' : '/checkin')
  }, [user, navigate])

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await apiLogin(email, password)
      login(res)
      navigate(res.role === 'ADMIN' ? '/dashboard' : '/checkin')
    } catch (err: unknown) {
      setError((err as Error).message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (e: string, p: string) => { setEmail(e); setPassword(p) }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,var(--accent),var(--purple))',
            borderRadius: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,.4)',
          }}>
            <MdQrCode2 size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>ChamCong.vn</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Hệ thống chấm công thông minh QR + GPS</p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="admin@company.vn"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 4 }}>
            <MdLogin size={18} />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        {/* Demo quickfill */}
        <div style={{ marginTop: 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 16,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Tài khoản demo</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => quickFill('admin@company.vn', 'admin123')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)',
                color: 'var(--accent-light)', fontSize: 13, fontWeight: 600,
                transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <MdShield size={15} /> Admin</button>
            <button
              onClick={() => quickFill('nhanvien1@company.vn', '123456')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.2)',
                color: 'var(--purple)', fontSize: 13, fontWeight: 600,
                transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <MdPerson size={15} /> Nhân viên</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            Click để điền nhanh → nhấn Đăng nhập
          </p>
        </div>
      </div>
    </div>
  )
}
