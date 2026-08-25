import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

export interface User {
  id: number
  name: string
  email: string
  role_id: number
}

export interface Company {
  id: number
  name: string
}

interface AuthState {
  user: User | null
  privileges: string[]
  currentCompany: Company | null
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setCurrentCompany: (company: Company | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      privileges: [],
      currentCompany: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Get CSRF cookie first (Sanctum requirement)
        await apiClient.get('/admin/sanctum/csrf-cookie')

        // Login
        const { data } = await apiClient.post('/admin/login', {
          email,
          password,
        })

        // Response format: { success, data: { user: {...}, message } }
        const userData = data.data.user

        set({
          user: userData,
          privileges: userData.privileges || [],
          currentCompany: userData.current_company || null,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        try {
          await apiClient.post('/admin/logout')
        } finally {
          set({ user: null, privileges: [], currentCompany: null, isAuthenticated: false })
        }
      },

      fetchUser: async () => {
        try {
          const { data } = await apiClient.get('/admin/me')

          set({
            user: data.user,
            privileges: data.privileges || [],
            currentCompany: data.current_company || null,
            isAuthenticated: true,
          })
        } catch {
          set({ user: null, privileges: [], currentCompany: null, isAuthenticated: false })
        }
      },

      setCurrentCompany: (company: Company | null) => {
        set({ currentCompany: company })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        privileges: state.privileges,
        currentCompany: state.currentCompany,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
