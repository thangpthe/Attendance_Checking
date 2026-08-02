import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

import { connectMongo } from './lib/mongo.js'
import authRoutes from './routes/auth.routes.js'
import checkinRoutes from './routes/checkin.routes.js'
import myAttendanceRoutes from './routes/myAttendance.routes.js'
import qrRoutes from './routes/qr.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import employeesRoutes from './routes/employees.routes.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use('/evidence', express.static(path.join(process.cwd(), 'data', 'evidence')))

app.use('/api/auth', authRoutes)
app.use('/api/checkin', checkinRoutes)
app.use('/api/my-attendance', myAttendanceRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/employees', employeesRoutes)

const PORT = process.env.PORT || 3001

async function bootstrap() {
  await connectMongo()
  app.listen(PORT, () => console.log(`Server điểm danh chạy tại port ${PORT} (không dùng nhận diện khuôn mặt)`))
}
bootstrap()