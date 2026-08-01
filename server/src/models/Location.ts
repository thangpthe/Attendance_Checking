import mongoose, { Schema } from 'mongoose'
import { idTransform } from './idTransform.js'

const locationSchema = new Schema({
  name: { type: String, required: true },
  address: String,
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  radius: { type: Number, default: 20 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { toJSON: idTransform })

export const LocationModel = mongoose.model('Location', locationSchema)