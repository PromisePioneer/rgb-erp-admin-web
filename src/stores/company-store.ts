/**
 * Company Store
 * Manages current company selection (session-based)
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { companyApi } from '@/features/companies/api/companies-api'

export interface Company {
  id: number
  name: string
  code?: string
}

interface CompanyState {
  currentCompany: Company | null
  companies: Company[]
  isLoading: boolean

  setCurrentCompany: (company: Company | null) => void
  fetchCompanies: () => Promise<void>
  switchCompany: (companyId: number) => Promise<void>
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      currentCompany: null,
      companies: [],
      isLoading: false,

      setCurrentCompany: (company: Company | null) => {
        set({ currentCompany: company })
      },

      fetchCompanies: async () => {
        set({ isLoading: true })
        try {
          const response = await companyApi.getSelectOptions()
          const companies = response.map((c) => ({ id: c.id, name: c.name }))
          set({ companies, isLoading: false })

          // Set first company as current if not set
          if (!get().currentCompany && companies.length > 0) {
            get().setCurrentCompany(companies[0])
          }
        } catch {
          set({ isLoading: false })
        }
      },

      switchCompany: async (companyId: number) => {
        try {
          await companyApi.switchCompany(companyId)
          const company = get().companies.find((c) => c.id === companyId)
          if (company) {
            get().setCurrentCompany(company)
          }
          // Reload page to refresh all data
          window.location.reload()
        } catch (error) {
          console.error('Failed to switch company:', error)
          throw error
        }
      },
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({
        currentCompany: state.currentCompany,
      }),
    }
  )
)
