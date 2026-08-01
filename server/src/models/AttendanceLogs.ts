import mongoose, { Schema } from 'mongoose'
import { idTransform } from './idTransform.js'

const attendanceLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
  shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  checkinAt: Date,
  checkoutAt: Date,
  checkinLat: Number,
  checkinLng: Number,
  status: { type: String, enum: ['ON_TIME', 'LATE', 'ABSENT', 'PENDING'], default: 'PENDING' },
  note: String,
}, { toJSON: idTransform })


attendanceLogSchema.index({ userId: 1, date: 1 }, { unique: true })

export const AttendanceLogModel = mongoose.model('AttendanceLog', attendanceLogSchema)