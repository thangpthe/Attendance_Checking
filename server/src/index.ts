import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

import checkinRoutes from './routes/checkin.routes'
import faceRoutes from './routes/face.routes'
import myAttendanceRoutes from './routes/myAttendance.routes'
import qrRoutes from './routes/qr.routes'
import { loadFaceModels } from './lib/faceRecognition'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use('/evidence', express.static(path.join(process.cwd(), 'data', 'evidence')))

app.use('/api/checkin', checkinRoutes)
app.use('/api/face', faceRoutes)
app.use('/api/my-attendance', myAttendanceRoutes)
app.use('/api/qr', qrRoutes)

const PORT = process.env.PORT || 3001
loadFaceModels().then(() => {
  app.listen(PORT, () => console.log(`Server chấm công chạy tại port ${PORT}`))
})