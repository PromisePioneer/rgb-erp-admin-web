import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

export interface User {
  id: number
  name: string
  email: string
  role_id: number
}

interface AuthState {
  user: User | null
  privileges: string[]
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      privileges: [],
      isAuthenticated: false,

      login: async (email, password) => {
        // Get CSRF cookie first (Sanctum requirement)
        await apiClient.get('/sanctum/csrf-cookie')

        // Login
        const { data } = await apiClient.post('/api/admin/login', {
          email,
          password,
        })

        set({
          user: data.user,
          privileges: data.privileges || [],
          isAuthenticated: true,
        })
      },

      logout: async () => {
        try {
          await apiClient.post('/api/admin/logout')
        } finally {
          set({ user: null, privileges: [], isAuthenticated: false })
        }
      },

      fetchUser: async () => {
        try {
          const { data } = await apiClient.get('/api/admin/me')
          set({
            user: data.user,
            privileges: data.privileges || [],
            isAuthenticated: true,
          })
        } catch {
          set({ user: null, privileges: [], isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        privileges: state.privileges,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
