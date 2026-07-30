import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { apiGetEmployees } from '@/lib/api'
import type { EnrichedUser } from '@/types'
import Badge from '@/components/common/Badge'
import {
  MdSearch, MdPhone, MdLocationOn,
  MdBusiness, MdCalendarToday, MdPeople,
} from 'react-icons/md'

export default function EmployeesPage() {
  const [users,   setUsers]   = useState<EnrichedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [dept,    setDept]    = useState('ALL')

  useEffect(() => {
    apiGetEmployees().then(res => { setUsers(res); setLoading(false) })
  }, [])

  const departments = Array.from(new Set(users.map(u => u.department)))

  const filtered = users.filter(u => {
    const matchName = u.name.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase())
    return matchName && (dept === 'ALL' || u.department === dept)
  })

  return (
    <Layout>
      <div className="page-wrapper fade-in">
        {/* Header */}
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Quản lý nhân viên</h1>
            <p className="page-subtitle">
              {users.length} nhân viên · {users.filter(u => u.status === 'ACTIVE').length} đang hoạt động
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 99,
            background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)',
          }}>
            <MdPeople size={15} color="var(--accent-light)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)' }}>
              {filtered.length} kết quả
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="card card-p" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 2, minWidth: 220, margin: 0 }}>
              <label className="form-label">
                <MdSearch size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Tìm kiếm
              </label>
              <input
                type="text" className="form-input"
                placeholder="Tên hoặc email..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160, margin: 0 }}>
              <label className="form-label">
                <MdBusiness size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Phòng ban
              </label>
              <select className="form-input" value={dept} onChange={e => setDept(e.target.value)}>
                <option value="ALL">Tất cả phòng ban</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <MdSearch size={48} color="var(--text-muted)" style={{ marginBottom: 16, opacity: .4 }} />
            <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>Không tìm thấy nhân viên nào</div>
          </div>
        ) : (
          <div className="grid-cards">
            {filtered.map(u => (
              <div key={u.id} className="card card-p card-hoverable"
                style={{ opacity: u.status === 'INACTIVE' ? .6 : 1 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: u.status === 'ACTIVE'
                      ? 'linear-gradient(135deg,var(--accent),var(--purple))'
                      : 'var(--bg-card-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>{u.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </div>
                  </div>
                  <Badge variant={u.status === 'ACTIVE' ? 'success' : 'muted'} dot>
                    {u.status === 'ACTIVE' ? 'Active' : 'Nghỉ'}
                  </Badge>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '0 0 14px' }} />

                {/* Info rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {[
                    { icon: <MdBusiness size={14} />,     label: 'Phòng ban', value: u.department },
                    { icon: <MdLocationOn size={14} />,   label: 'Địa điểm',  value: u.location?.name ?? '—' },
                    { icon: <MdPhone size={14} />,        label: 'SĐT',       value: u.phone },
                    { icon: <MdCalendarToday size={14} />,label: 'Ngày vào',  value: u.joinDate },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {row.icon}
                        <span style={{ fontSize: 12 }}>{row.label}</span>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {/* Shift with color dot */}
                  {u.shift && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 11H7v-2h4V7h2v6z"/>
                        </svg>
                        <span style={{ fontSize: 12 }}>Ca làm</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: u.shift.color,
                          boxShadow: `0 0 6px ${u.shift.color}80`,
                        }} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {u.shift.name} ({u.shift.startTime}–{u.shift.endTime})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
