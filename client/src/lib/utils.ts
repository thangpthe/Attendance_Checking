import type { AttendanceStatus } from '../types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateLong(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function calcHours(checkin: string | null, checkout: string | null): string {
  if (!checkin || !checkout) return '--'
  const diff = (new Date(checkout).getTime() - new Date(checkin).getTime()) / 3_600_000
  return `${diff.toFixed(1)}h`
}

export function getTodayStr(): string {
  // Dùng UTC+7 offset để tránh ghi nhầm ngày lúc 23:xx giờ VN
  return new Date(Date.now() + 7 * 3600_000).toISOString().split('T')[0]
}

export function getStatusLabel(status: AttendanceStatus | string): string {
  const map: Record<string, string> = {
    ON_TIME: 'Đúng giờ', LATE: 'Đi muộn', ABSENT: 'Vắng mặt', PENDING: 'Chờ',
  }
  return map[status] ?? status
}

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted' | 'accent'

export function getStatusVariant(status: AttendanceStatus | string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    ON_TIME: 'success', LATE: 'warning', ABSENT: 'danger', PENDING: 'muted',
  }
  return map[status] ?? 'muted'
}

export function uuid(): string {
  return crypto.randomUUID()
}
