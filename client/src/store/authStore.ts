import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { saveToken, clearToken } from '../lib/api'

interface AuthState {
  user: User | null
  login:  (user: User, token?: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:   null,
      // token đã được saveToken() trong apiLogin() trước khi gọi login()
      login:  (user) => set({ user }),
      logout: () => { clearToken(); set({ user: null }) },
    }),
    { name: 'chamcong-auth' },
  ),
)
