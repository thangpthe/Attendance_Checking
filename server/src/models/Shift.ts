import mongoose, { Schema } from 'mongoose'
import { idTransform } from './idTransform.js'

const shiftSchema = new Schema({
  name: String,
  startTime: String, endTime: String,
  checkinStart: String, checkinEnd: String,
  color: String,
}, { toJSON: idTransform })

export const ShiftModel = mongoose.model('Shift', shiftSchema)