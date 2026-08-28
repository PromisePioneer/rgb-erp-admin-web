/**
 * Accounting Periods Store
 * Zustand state management for accounting periods
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

export interface AccountingPeriod {
  id: number
  year: number
  month: number
  label: string
  start_date: string
  end_date: string
  status: 'open' | 'closed' | 'locked'
  closed_at: string | null
  closed_by: number | null
}

interface AccountingPeriodsState {
  // State
  items: AccountingPeriod[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  fetchPeriods: () => Promise<void>
  closePeriod: (id: number) => Promise<void>
  reopenPeriod: (id: number) => Promise<void>
  clearError: () => void
}

export const useAccountingPeriodsStore = create<AccountingPeriodsState>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  // Actions
  fetchPeriods: async () => {
    set({ isLoading: true, error: null })

    try {
      const { data } = await apiClient.get('/admin/accounting-periods')
      const periods: AccountingPeriod[] = data.data || []
      set({ items: periods, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch periods'
      set({ error: message, isLoading: false })
    }
  },

  closePeriod: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post(`/admin/accounting-periods/${id}/close`)
      await get().fetchPeriods()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to close period'
      set({ error: message, isSubmitting: false })
      throw error
    }
    set({ isSubmitting: false })
  },

  reopenPeriod: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post(`/admin/accounting-periods/${id}/reopen`)
      await get().fetchPeriods()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reopen period'
      set({ error: message, isSubmitting: false })
      throw error
    }
    set({ isSubmitting: false })
  },

  clearError: () => {
    set({ error: null })
  },
}))
