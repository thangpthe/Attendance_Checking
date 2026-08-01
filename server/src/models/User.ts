import mongoose, { Schema } from 'mongoose'
import { idTransform } from './idTransform.js'

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], required: true },
  avatar: String,
  locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
  shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
  phone: String,
  department: String,
  joinDate: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  passwordHash: { type: String, select: false },
  faceDescriptor: { type: [Number], select: false },
}, { toJSON: idTransform })

export const UserModel = mongoose.model('User', userSchema)