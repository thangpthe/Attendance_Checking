import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectMongo } from '../lib/mongo.js'
import { LocationModel } from '../models/Location.js'
import { ShiftModel } from '../models/Shift.js'
import { UserModel } from '../models/User.js'
import mongoose from 'mongoose'

dotenv.config()

async function seed() {
  await connectMongo()
  await Promise.all([LocationModel.deleteMany({}), ShiftModel.deleteMany({}), UserModel.deleteMany({})])

  const loc = await LocationModel.create({
    name: 'Văn phòng Hà Nội', address: '123 Đường ABC, Hà Nội',
    lat: 21.0245, lng: 105.8412, radius: 20, status: 'ACTIVE',
  })

  const shift = await ShiftModel.create({
    name: 'Ca hành chính', startTime: '08:00', endTime: '17:30',
    checkinStart: '07:30', checkinEnd: '09:00', color: '#6366f1',
  })

  const adminHash = await bcrypt.hash('admin123', 10)
  await UserModel.create({
    email: 'admin@company.vn', name: 'Quản trị viên', role: 'ADMIN',
    avatar: '👤', locationId: loc.id, shiftId: shift.id,
    phone: '0900000000', department: 'Ban giám đốc', joinDate: '2024-01-01',
    status: 'ACTIVE', passwordHash: adminHash,
  })

  const empHash = await bcrypt.hash('123456', 10)
  await UserModel.create({
    email: 'nhanvien1@company.vn', name: 'Nguyễn Văn A', role: 'EMPLOYEE',
    avatar: '👤', locationId: loc.id, shiftId: shift.id,
    phone: '0911111111', department: 'Kinh doanh', joinDate: '2024-06-01',
    status: 'ACTIVE', passwordHash: empHash,
  })

  console.log('Đã seed xong: admin@company.vn/admin123, nhanvien1@company.vn/123456')
  await mongoose.disconnect()
}

seed()