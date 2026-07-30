import type { EnrichedLog } from '@/types'
import Badge from '@/components/common/Badge'
import { formatDate, formatTime, calcHours, getStatusLabel, getStatusVariant } from '@/lib/utils'

interface Props { logs: EnrichedLog[]; isAdmin?: boolean; loading?: boolean }

export default function AttendanceTable({ logs, isAdmin, loading }: Props) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>⏳ Đang tải...</div>
  if (!logs.length) return <div style={{ padding: 40, textAlign: 'center' }}>📭 Chưa có dữ liệu</div>

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Ngày</th>
            {isAdmin && <th>Nhân viên</th>}
            <th>Ca làm việc</th>
            <th>Địa điểm</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Số giờ</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{formatDate(log.date)}</td>
              {isAdmin && (
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar avatar-sm">{log.user?.avatar}</div>
                    <span>{log.user?.name}</span>
                  </div>
                </td>
              )}
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: log.shift?.color }} />
                  {log.shift?.name}
                </span>
              </td>
              <td>{log.location?.name}</td>
              <td>{formatTime(log.checkinAt)}</td>
              <td>{formatTime(log.checkoutAt)}</td>
              <td>{calcHours(log.checkinAt, log.checkoutAt)}</td>
              <td>
                <Badge variant={getStatusVariant(log.status)}>{getStatusLabel(log.status)}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
