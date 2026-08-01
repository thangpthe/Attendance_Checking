import { useRef, useState, useEffect } from 'react'
import Button from '@/components/common/Button'
import { MdCameraAlt } from 'react-icons/md'

interface Props {
  onCapture: (blob: Blob) => void
  disabled?: boolean
}

export default function FaceCapture({ onCapture, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Dùng ref để track stream — tránh stale closure trong cleanup
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(s => {
        if (cancelled) {
          // Component unmount trước khi camera start xong → dừng ngay
          s.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
        setReady(true)
      })
      .catch(() => setError('Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt.'))

    return () => {
      cancelled = true
      // Dùng ref.current để đảm bảo luôn stop đúng stream
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  function capture() {
    const video = videoRef.current
    if (!video || !ready) return
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
        <Button size="lg" onClick={capture} disabled={disabled || !ready}>
          <MdCameraAlt size={18} /> Chụp khuôn mặt
        </Button>
      </div>
    </div>
  )
}