// Sửa thành:
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '../../data/db.json')

export interface DbUser {
  id: string; email: string; name: string; role: 'ADMIN' | 'EMPLOYEE'
  avatar: string; locationId: string; shiftId: string
  phone: string; department: string; joinDate: string; status: 'ACTIVE' | 'INACTIVE'
  passwordHash?: string
  faceDescriptor?: number[]
}

export interface DbComplaint {
  id: string; userId: string; attendanceLogId: string
  reason: string; evidencePath: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export interface Db {
  users: DbUser[]
  locations: any[]
  shifts: any[]
  attendanceLogs: any[]
  complaints: DbComplaint[]
}

let writeLock = Promise.resolve()

export async function readDb(): Promise<Db> {
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

export async function writeDb(data: Db): Promise<void> {
  writeLock = writeLock.then(() =>
    fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
  )
  return writeLock
}