import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  MdDashboard,
  MdQrCode2,
  MdHistory,
  MdPeople,
  MdCheckCircle,
  MdLogout,
  MdShield,
  MdPerson,
} from 'react-icons/md'
import type { IconType } from 'react-icons'

interface NavItem {
  to: string
  icon: IconType
  label: string
}

const ADMIN_NAV: NavItem[] = [
  { to: '/dashboard', icon: MdDashboard, label: 'Tổng quan' },
  { to: '/kiosk',     icon: MdQrCode2,  label: 'Màn hình QR' },
  { to: '/history',   icon: MdHistory,  label: 'Lịch sử chấm công' },
  { to: '/employees', icon: MdPeople,   label: 'Nhân viên' },
]

const EMPLOYEE_NAV: NavItem[] = [
  { to: '/checkin', icon: MdCheckCircle, label: 'Chấm công' },
  { to: '/history', icon: MdHistory,     label: 'Lịch sử của tôi' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems = user?.role === 'ADMIN' ? ADMIN_NAV : EMPLOYEE_NAV
  const isAdmin  = user?.role === 'ADMIN'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <MdQrCode2 size={22} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-text">ChamCong.vn</div>
          <div className="sidebar-logo-version">v1.0 · Demo</div>
        </div>
      </div>

      {/* ── Nav section label ── */}
      <div className="nav-section-label">
        {isAdmin ? 'Quản trị' : 'Nhân viên'}
      </div>

      {/* ── Nav links ── */}
      <nav style={{ flex: 1, padding: '0 0 8px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} className="nav-item-icon" style={{ flexShrink: 0 }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── User info + logout ── */}
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,var(--accent),var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            {user?.avatar}
          </div>
          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {isAdmin
                ? <MdShield size={11} color="var(--accent-light)" />
                : <MdPerson  size={11} color="var(--text-muted)" />
              }
              <span style={{ fontSize: 11, color: isAdmin ? 'var(--accent-light)' : 'var(--text-muted)', fontWeight: 600 }}>
                {isAdmin ? 'Quản trị viên' : 'Nhân viên'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="nav-item nav-logout"
          style={{ width: 'calc(100% - 16px)', margin: '0 8px' }}
        >
          <MdLogout size={17} style={{ flexShrink: 0 }} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
