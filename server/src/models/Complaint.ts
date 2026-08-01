import mongoose, { Schema } from 'mongoose'
import { idTransform } from './idTransform.js'

const complaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attendanceLogId: { type: Schema.Types.ObjectId, ref: 'AttendanceLog', required: true },
  reason: String,
  evidencePath: String,
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: { createdAt: true, updatedAt: false }, toJSON: idTransform })

export const ComplaintModel = mongoose.model('Complaint', complaintSchema)