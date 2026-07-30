import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import AttendanceTable from '@/components/features/attendance/AttendanceTable'
import StatCard from '@/components/common/StatCard'
import { apiGetHistory } from '@/lib/api'
import type { EnrichedLog } from '@/types'
import Button from '@/components/common/Button'
import {
  MdCalendarToday, MdCheckCircle, MdWarning,
  MdCancel, MdFilterList, MdClose,
} from 'react-icons/md'

export default function HistoryPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [logs,         setLogs]         = useState<EnrichedLog[]>([])
  const [loading,      setLoading]      = useState(true)
  const [filterDate,   setFilterDate]   = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await apiGetHistory({
        userId: isAdmin ? undefined : user?.id,
        date:   filterDate || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      })
      setLogs(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [filterDate, filterStatus, isAdmin, user?.id]) // eslint-disable-line

  const stats = {
    total:  logs.length,
    onTime: logs.filter(l => l.status === 'ON_TIME').length,
    late:   logs.filter(l => l.status === 'LATE').length,
    absent: logs.filter(l => l.status === 'ABSENT').length,
  }

  const hasFilter = filterDate || filterStatus !== 'ALL'

  return (
    <Layout>
      <div className="page-wrapper fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            {isAdmin ? 'Lịch sử chấm công' : 'Lịch sử của tôi'}
          </h1>
          <p className="page-subtitle">
            {isAdmin ? 'Xem lịch sử toàn bộ nhân viên' : 'Lịch sử chấm công cá nhân'}
          </p>
        </div>

        {/* Filter bar */}
        <div className="card card-p" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MdFilterList size={17} color="var(--text-muted)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Bộ lọc</span>
            {hasFilter && (
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 99,
                background: 'rgba(99,102,241,.15)', color: 'var(--accent-light)',
                fontWeight: 600,
              }}>Đang lọc</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 180, margin: 0 }}>
              <label className="form-label">
                <MdCalendarToday size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Ngày
              </label>
              <input
                type="date" className="form-input"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 180, margin: 0 }}>
              <label className="form-label">Trạng thái</label>
              <select
                className="form-input"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ON_TIME">Đúng giờ</option>
                <option value="LATE">Đi muộn</option>
                <option value="ABSENT">Vắng mặt</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 1 }}>
              {hasFilter && (
                <Button variant="ghost" size="sm"
                  onClick={() => { setFilterDate(''); setFilterStatus('ALL') }}>
                  <MdClose size={15} />
                  Xóa lọc
                </Button>
              )}
              <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{logs.length}</strong> bản ghi
              </span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
          <StatCard icon={<MdCalendarToday />} label="Tổng lượt"  value={stats.total}  loading={loading} />
          <StatCard icon={<MdCheckCircle />}   label="Đúng giờ"   value={stats.onTime} color="var(--success)" loading={loading} />
          <StatCard icon={<MdWarning />}       label="Đi muộn"    value={stats.late}   color="var(--warning)" loading={loading} />
          <StatCard icon={<MdCancel />}        label="Vắng mặt"   value={stats.absent} color="var(--danger)"  loading={loading} />
        </div>

        {/* Table */}
        <AttendanceTable logs={logs} isAdmin={isAdmin} loading={loading} />
      </div>
    </Layout>
  )
}
