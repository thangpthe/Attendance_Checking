import * as faceapi from '@vladmandic/face-api'
import * as tf from '@tensorflow/tfjs'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MODEL_PATH = path.join(__dirname, '../../models')

let modelsLoaded = false

export async function loadFaceModels() {
  if (modelsLoaded) return
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH)
  modelsLoaded = true
  console.log('Đã tải xong model nhận diện khuôn mặt')
}


async function imageBufferToTensor(imageBuffer: Buffer): Promise<tf.Tensor3D> {
  const { data, info } = await sharp(imageBuffer)
    .removeAlpha() 
    .raw()
    .toBuffer({ resolveWithObject: true })

  return tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3])
}

export async function extractFaceDescriptor(imageBuffer: Buffer): Promise<Float32Array | null> {
  await loadFaceModels()
  

  const tensor = await imageBufferToTensor(imageBuffer)


  const detection = await faceapi
    .detectSingleFace(tensor as any)
    .withFaceLandmarks()
    .withFaceDescriptor()


  tensor.dispose()

  if (!detection) return null
  return detection.descriptor
}

export function descriptorDistance(a: number[], b: Float32Array): number {
  return faceapi.euclideanDistance(a, Array.from(b))
}

const THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD || 0.5)

export function findBestMatch(
  descriptor: Float32Array,
  users: { id: string; faceDescriptor?: number[] }[]
): { userId: string; distance: number } | null {
  let best: { userId: string; distance: number } | null = null
  for (const u of users) {
    if (!u.faceDescriptor) continue
    const dist = descriptorDistance(u.faceDescriptor, descriptor)
    if (dist < THRESHOLD && (!best || dist < best.distance)) {
      best = { userId: u.id, distance: dist }
    }
  }
  return best
}