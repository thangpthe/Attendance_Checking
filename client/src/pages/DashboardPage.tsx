import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/layout/Layout'
import StatCard from '@/components/common/StatCard'
import AttendanceTable from '@/components/features/attendance/AttendanceTable'
import Button from '@/components/common/Button'
import { apiGetTodayStats, apiGetHistory } from '@/lib/api'
import { getTodayStr, formatDateLong } from '@/lib/utils'
import type { TodayStats, EnrichedLog } from '@/types'
import {
  MdPeople, MdCheckCircle, MdAccessTime, MdWarning,
  MdCancel, MdHourglassEmpty, MdRefresh, MdBarChart,
} from 'react-icons/md'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats,   setStats]   = useState<TodayStats | null>(null)
  const [logs,    setLogs]    = useState<EnrichedLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN') navigate('/checkin')
  }, [user, navigate])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, l] = await Promise.all([
        apiGetTodayStats(),
        apiGetHistory({ date: getTodayStr() }),
      ])
      setStats(s); setLogs(l)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const t = setInterval(loadData, 30_000)
    return () => clearInterval(t)
  }, [loadData])

  const rate = stats && stats.total > 0
    ? Math.round((stats.checkedIn / stats.total) * 100) : 0

  return (
    <Layout>
      <div className="page-wrapper fade-in">
        {/* Header */}
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Tổng quan hôm nay</h1>
            <p className="page-subtitle">{formatDateLong(getTodayStr())}</p>
          </div>
          <Button variant="secondary" size="sm" loading={loading} onClick={loadData}>
            <MdRefresh size={16} />
            Làm mới
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid-stats" style={{ marginBottom: 24 }}>
          <StatCard icon={<MdPeople />}        label="Tổng nhân viên" value={stats?.total ?? 0}     color="var(--accent)"     loading={loading} />
          <StatCard icon={<MdCheckCircle />}   label="Đã chấm công"  value={stats?.checkedIn ?? 0} color="var(--success)"    loading={loading} />
          <StatCard icon={<MdAccessTime />}    label="Đúng giờ"      value={stats?.onTime ?? 0}    color="var(--success)"    loading={loading} />
          <StatCard icon={<MdWarning />}       label="Đi muộn"       value={stats?.late ?? 0}      color="var(--warning)"    loading={loading} />
          <StatCard icon={<MdCancel />}        label="Vắng mặt"      value={stats?.absent ?? 0}    color="var(--danger)"     loading={loading} />
          <StatCard icon={<MdHourglassEmpty />} label="Chưa chấm"   value={stats?.notYet ?? 0}    color="var(--text-muted)" loading={loading} />
        </div>

        {/* Progress card */}
        <div className="card card-p" style={{ marginBottom: 24 }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdBarChart size={20} color="var(--accent)" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Tỷ lệ chấm công</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {stats?.checkedIn ?? 0} / {stats?.total ?? 0} nhân viên
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 36, fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(135deg,var(--accent),var(--purple))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {rate}%
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${rate}%` }} />
          </div>
        </div>

        {/* Today table */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Chi tiết hôm nay
          </div>
          <AttendanceTable logs={logs} isAdmin loading={loading} />
        </div>
      </div>
    </Layout>
  )
}
