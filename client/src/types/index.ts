export type Role             = 'ADMIN' | 'EMPLOYEE'
export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'PENDING'
export type UserStatus       = 'ACTIVE' | 'INACTIVE'

export interface User {
  id: string; email: string; name: string; role: Role
  avatar: string; locationId: string; shiftId: string
  phone: string; department: string; joinDate: string; status: UserStatus
}

export interface Location {
  id: string; name: string; address: string
  lat: number; lng: number; radius: number; status: 'ACTIVE' | 'INACTIVE'
}

export interface Shift {
  id: string; name: string; startTime: string; endTime: string
  checkinStart: string; checkinEnd: string; color: string
}

export interface AttendanceLog {
  id: string; userId: string; locationId: string; shiftId: string
  date: string; checkinAt: string | null; checkoutAt: string | null
  checkinLat: number | null; checkinLng: number | null
  status: AttendanceStatus; note: string
}

export interface EnrichedLog extends AttendanceLog {
  user: User; location: Location; shift: Shift
}

export interface EnrichedUser extends User {
  location?: Location; shift?: Shift
}

export interface TodayStats {
  total: number; checkedIn: number; onTime: number
  late: number; absent: number; notYet: number
}

export interface CheckinRequest {
  userId: string; qrToken: string; lat: number; lng: number
}

export interface CheckinResponse {
  success: boolean; type: 'CHECKIN' | 'CHECKOUT'; message: string
  status?: AttendanceStatus
}
