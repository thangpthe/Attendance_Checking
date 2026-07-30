import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props { children: ReactNode; adminOnly?: boolean }

export default function ProtectedRoute({ children, adminOnly }: Props) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/checkin" replace />
  return <>{children}</>
}
