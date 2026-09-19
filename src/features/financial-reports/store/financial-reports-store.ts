/**
 * Financial Reports Store
 * Zustand state management for financial reports
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

export interface AccountingPeriod {
  id: number
  year: number
  month: number
  label: string
  status?: string
}

export interface TrialBalanceRow {
  account_id: number
  account_code: string
  account_name: string
  type: string
  initial_debit: number
  initial_credit: number
  movement_debit: number
  movement_credit: number
  final_debit: number
  final_credit: number
}

export interface TrialBalanceData {
  period_id: number
  period_label: string
  start_date: string
  end_date: string
  rows: TrialBalanceRow[]
  totals: {
    initial_debit: number
    initial_credit: number
    movement_debit: number
    movement_credit: number
    final_debit: number
    final_credit: number
  }
}

interface FinancialReportsState {
  // State
  periods: AccountingPeriod[]
  trialBalance: TrialBalanceData | null
  isLoading: boolean
  isLoadingPeriods: boolean
  error: string | null
  selectedPeriodId: number | null

  // Actions
  fetchPeriods: () => Promise<void>
  fetchTrialBalance: (periodId: number) => Promise<void>
  setSelectedPeriodId: (id: number | null) => void
  clearError: () => void
}

export const useFinancialReportsStore = create<FinancialReportsState>((set, get) => ({
  // Initial state
  periods: [],
  trialBalance: null,
  isLoading: false,
  isLoadingPeriods: false,
  error: null,
  selectedPeriodId: null,

  // Actions
  fetchPeriods: async () => {
    set({ isLoadingPeriods: true })
    try {
      const { data } = await apiClient.get('/admin/accounting-periods')
      const periods: AccountingPeriod[] = data.data || []

      // Get current month and year
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      // Find current month period (matching year and month)
      const currentPeriod = periods.find(p => {
        return p.year === currentYear && p.month === currentMonth
      })

      // Fallback: first open period if current month not found
      const firstOpenPeriod = periods.find(p => p.status === 'open')

      const selectedPeriod = currentPeriod || firstOpenPeriod || periods[0]

      set({
        periods,
        selectedPeriodId: selectedPeriod?.id || null,
        isLoadingPeriods: false,
      })

      // Auto-fetch if we have a period
      if (selectedPeriod?.id) {
        await get().fetchTrialBalance(selectedPeriod.id)
      }
    } catch (error) {
      console.error('Failed to fetch periods:', error)
      set({ isLoadingPeriods: false })
    }
  },

  fetchTrialBalance: async (periodId: number) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await apiClient.get(`/admin/financial-reports/trial-balance?period_id=${periodId}`)
      set({ trialBalance: data.data || null, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trial balance'
      set({ error: message, isLoading: false })
    }
  },

  setSelectedPeriodId: (id: number | null) => {
    set({ selectedPeriodId: id })
    if (id) {
      get().fetchTrialBalance(id)
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
