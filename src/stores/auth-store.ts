import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

export interface Role {
  id: number
  name: string
}

export interface Employee {
  id: number
  code: string
  name: string
  photo: string | null
  position: string | null
}

export interface User {
  id: number
  name: string
  email: string
  status: number
  role: Role | null
  department: { id: number; name: string } | null
  company: { id: number; name: string } | null
  employee: Employee | null
}

export interface Company {
  id: number
  name: string
}

interface AuthState {
  user: User | null
  privileges: string[]       // Web privileges (MenuName,Action format)
  mobilePrivileges: string[] // Mobile privileges (key format)
  currentCompany: Company | null
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setCurrentCompany: (company: Company | null) => void
  hasMobilePrivilege: (key: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      privileges: [],
      mobilePrivileges: [],
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
          mobilePrivileges: userData.mobile_privileges || [],
          currentCompany: userData.company || null,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        try {
          await apiClient.post('/admin/logout')
        } finally {
          set({
            user: null,
            privileges: [],
            mobilePrivileges: [],
            currentCompany: null,
            isAuthenticated: false
          })
        }
      },

      fetchUser: async () => {
        try {
          const { data } = await apiClient.get('/admin/me')

          set({
            user: data.data.user,
            privileges: data.data.user.privileges || [],
            mobilePrivileges: data.data.user.mobile_privileges || [],
            currentCompany: data.data.user.company || null,
            isAuthenticated: true,
          })
        } catch {
          set({
            user: null,
            privileges: [],
            mobilePrivileges: [],
            currentCompany: null,
            isAuthenticated: false
          })
        }
      },

      setCurrentCompany: (company: Company | null) => {
        set({ currentCompany: company })
      },

      /**
       * Check if user has a specific mobile privilege.
       * @param key - The mobile privilege key (e.g., 'patrol', 'leave')
       */
      hasMobilePrivilege: (key: string) => {
        return get().mobilePrivileges.includes(key)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        privileges: state.privileges,
        mobilePrivileges: state.mobilePrivileges,
        currentCompany: state.currentCompany,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
