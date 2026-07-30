import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  value: number | string
  color?: string
  subtext?: string
  loading?: boolean
}

export default function StatCard({ icon, label, value, color = 'var(--accent)', subtext, loading }: Props) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-card-top">
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color,
        }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value" style={{ color }}>
        {loading ? '—' : value}
      </div>
      <div className="stat-card-label">{label}</div>
      {subtext && <div className="stat-card-sub">{subtext}</div>}
    </div>
  )
}
