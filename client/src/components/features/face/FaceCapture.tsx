import { useRef, useState, useEffect } from 'react'
import Button from '@/components/common/Button'
import { MdCameraAlt } from 'react-icons/md'

interface Props {
  onCapture: (blob: Blob) => void
  disabled?: boolean
}

export default function FaceCapture({ onCapture, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(s => {
        if (!active) { s.getTracks().forEach(t => t.stop()); return }
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt.'))
    return () => {
      active = false
      stream?.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function capture() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    canvas.toBlob(blob => { if (blob) onCapture(blob) }, 'image/jpeg', 0.9)
  }

  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div style={{ textAlign: 'center' }}>
      <video
        ref={videoRef}
        autoPlay muted playsInline
        style={{ width: '100%', maxWidth: 320, borderRadius: 12, transform: 'scaleX(-1)' }}
      />
      <div style={{ marginTop: 16 }}>
        <Button size="lg" onClick={capture} disabled={disabled || !stream}>
          <MdCameraAlt size={18} /> Chụp khuôn mặt
        </Button>
      </div>
    </div>
  )
}