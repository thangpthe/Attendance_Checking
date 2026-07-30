import type { User, Location, Shift, AttendanceLog } from '../types'

export const USERS: User[] = [
  {
    id: 'u1', email: 'admin@company.vn', name: 'Nguyễn Văn Admin',
    role: 'ADMIN', avatar: '👑', locationId: 'loc1', shiftId: 'shift1',
    phone: '0912 345 678', department: 'Ban Giám Đốc',
    joinDate: '2023-01-01', status: 'ACTIVE',
  },
  {
    id: 'u2', email: 'nhanvien1@company.vn', name: 'Trần Thị Lan',
    role: 'EMPLOYEE', avatar: '👩', locationId: 'loc1', shiftId: 'shift1',
    phone: '0987 654 321', department: 'Kỹ Thuật',
    joinDate: '2023-03-15', status: 'ACTIVE',
  },
  {
    id: 'u3', email: 'nhanvien2@company.vn', name: 'Lê Minh Tuấn',
    role: 'EMPLOYEE', avatar: '👨', locationId: 'loc1', shiftId: 'shift1',
    phone: '0901 234 567', department: 'Kỹ Thuật',
    joinDate: '2023-05-10', status: 'ACTIVE',
  },
  {
    id: 'u4', email: 'nhanvien3@company.vn', name: 'Phạm Thu Hương',
    role: 'EMPLOYEE', avatar: '👩‍💼', locationId: 'loc2', shiftId: 'shift2',
    phone: '0934 567 890', department: 'Kinh Doanh',
    joinDate: '2023-07-20', status: 'ACTIVE',
  },
  {
    id: 'u5', email: 'nhanvien4@company.vn', name: 'Hoàng Văn Bình',
    role: 'EMPLOYEE', avatar: '🧑', locationId: 'loc2', shiftId: 'shift2',
    phone: '0923 456 789', department: 'Kinh Doanh',
    joinDate: '2024-01-05', status: 'ACTIVE',
  },
  {
    id: 'u6', email: 'nhanvien5@company.vn', name: 'Đỗ Thị Mai',
    role: 'EMPLOYEE', avatar: '👩‍🔬', locationId: 'loc1', shiftId: 'shift1',
    phone: '0945 678 901', department: 'Nhân Sự',
    joinDate: '2024-03-12', status: 'INACTIVE',
  },
]

export const PASSWORDS: Record<string, string> = {
  'admin@company.vn':      'admin123',
  'nhanvien1@company.vn':  '123456',
  'nhanvien2@company.vn':  '123456',
  'nhanvien3@company.vn':  '123456',
  'nhanvien4@company.vn':  '123456',
  'nhanvien5@company.vn':  '123456',
}

export const LOCATIONS: Location[] = [
  {
    id: 'loc1', name: 'Văn phòng Hà Nội',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    lat: 21.0245, lng: 105.8412, radius: 150,
    status: 'ACTIVE',
  },
  {
    id: 'loc2', name: 'Chi nhánh TP.HCM',
    address: '456 Nguyễn Thị Minh Khai, Q.3, TP.HCM',
    lat: 10.7769, lng: 106.6954, radius: 100,
    status: 'ACTIVE',
  },
]

export const SHIFTS: Shift[] = [
  {
    id: 'shift1', name: 'Ca Sáng',
    startTime: '08:00', endTime: '17:00',
    checkinStart: '07:30', checkinEnd: '08:15',
    color: '#6366f1',
  },
  {
    id: 'shift2', name: 'Ca Chiều',
    startTime: '13:00', endTime: '22:00',
    checkinStart: '12:30', checkinEnd: '13:15',
    color: '#a855f7',
  },
]

function todayStr(): string { return new Date().toISOString().split('T')[0] }
function yesterdayStr(): string {
  const d = new Date(); d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
function todayISO(hh: number, mm: number): string {
  const d = new Date()
  d.setHours(hh, mm, 0, 0)
  return d.toISOString()
}
function yesterdayISO(hh: number, mm: number): string {
  const d = new Date(); d.setDate(d.getDate() - 1)
  d.setHours(hh, mm, 0, 0)
  return d.toISOString()
}

export const ATTENDANCE_LOGS: AttendanceLog[] = [
  // Hôm nay
  {
    id: 'log1', userId: 'u2', locationId: 'loc1', shiftId: 'shift1',
    date: todayStr(), checkinAt: todayISO(7, 55), checkoutAt: null,
    checkinLat: 21.0246, checkinLng: 105.8413, status: 'ON_TIME', note: '',
  },
  {
    id: 'log2', userId: 'u3', locationId: 'loc1', shiftId: 'shift1',
    date: todayStr(), checkinAt: todayISO(8, 22), checkoutAt: null,
    checkinLat: 21.0244, checkinLng: 105.8411, status: 'LATE', note: 'Đi muộn 7 phút',
  },
  {
    id: 'log3', userId: 'u4', locationId: 'loc2', shiftId: 'shift2',
    date: todayStr(), checkinAt: null, checkoutAt: null,
    checkinLat: null, checkinLng: null, status: 'ABSENT', note: 'Không có lý do',
  },
  // Hôm qua
  {
    id: 'log4', userId: 'u2', locationId: 'loc1', shiftId: 'shift1',
    date: yesterdayStr(), checkinAt: yesterdayISO(7, 58), checkoutAt: yesterdayISO(17, 5),
    checkinLat: 21.0245, checkinLng: 105.8412, status: 'ON_TIME', note: '',
  },
  {
    id: 'log5', userId: 'u3', locationId: 'loc1', shiftId: 'shift1',
    date: yesterdayStr(), checkinAt: yesterdayISO(8, 10), checkoutAt: yesterdayISO(17, 15),
    checkinLat: 21.0244, checkinLng: 105.8411, status: 'ON_TIME', note: '',
  },
  {
    id: 'log6', userId: 'u4', locationId: 'loc2', shiftId: 'shift2',
    date: yesterdayStr(), checkinAt: yesterdayISO(13, 5), checkoutAt: yesterdayISO(22, 0),
    checkinLat: 10.7770, checkinLng: 106.6955, status: 'ON_TIME', note: '',
  },
]
