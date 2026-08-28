/**
 * Finance Store
 * Zustand state management for finance reports
 */
import { create } from 'zustand'
import type {
  Account,
  JournalEntry,
  LedgerTransaction,
  BalanceSheetApiResponse,
  ProfitLossApiResponse,
} from '../types/finance.types'
import { financeApi } from '../api/finance-api'

interface JournalState {
  entries: JournalEntry[]
  isLoading: boolean
  error: string | null
  filters: {
    from: string
    to: string
  }
  fetchJournal: () => Promise<void>
  setFilters: (filters: Partial<{ from: string; to: string }>) => void
  clearError: () => void
}

interface LedgerState {
  accounts: Account[]
  selectedAccount: Account | null
  transactions: LedgerTransaction[]
  isLoading: boolean
  error: string | null
  filters: {
    account_id?: number
    from: string
    to: string
  }
  openingBalance: number
  closingBalance: number
  fetchAccounts: () => Promise<void>
  fetchLedger: () => Promise<void>
  setFilters: (filters: Partial<{ account_id?: number; from: string; to: string }>) => void
  clearError: () => void
}

interface BalanceSheetState {
  data: BalanceSheetApiResponse['data'] | null
  isLoading: boolean
  error: string | null
  filters: {
    as_of: string
  }
  fetchBalanceSheet: () => Promise<void>
  setFilters: (filters: Partial<{ as_of: string }>) => void
  clearError: () => void
}

interface ProfitLossState {
  data: ProfitLossApiResponse['data'] | null
  isLoading: boolean
  error: string | null
  filters: {
    from: string
    to: string
  }
  fetchProfitLoss: () => Promise<void>
  setFilters: (filters: Partial<{ from: string; to: string }>) => void
  clearError: () => void
}

// Helper to get default date range (current month)
function getDefaultDateRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    from: firstDay.toISOString().split('T')[0],
    to: lastDay.toISOString().split('T')[0],
  }
}

// Helper to get default year range
function getDefaultYearRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), 0, 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    from: firstDay.toISOString().split('T')[0],
    to: lastDay.toISOString().split('T')[0],
  }
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  filters: getDefaultDateRange(),

  fetchJournal: async () => {
    set({ isLoading: true, error: null })

    try {
      const { from, to } = get().filters
      const response = await financeApi.getJournal({ from, to })

      set({
        entries: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch journal entries'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (newFilters) => {
    const currentFilters = get().filters
    set({
      filters: { ...currentFilters, ...newFilters },
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))

export const useLedgerStore = create<LedgerState>((set, get) => ({
  accounts: [],
  selectedAccount: null,
  transactions: [],
  isLoading: false,
  error: null,
  filters: {
    ...getDefaultYearRange(),
  },
  openingBalance: 0,
  closingBalance: 0,

  fetchAccounts: async () => {
    try {
      const response = await financeApi.getAccounts()
      set({ accounts: response.data })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch accounts'
      set({ error: message })
    }
  },

  fetchLedger: async () => {
    set({ isLoading: true, error: null })

    try {
      const { account_id, from, to } = get().filters
      const response = await financeApi.getLedger({ account_id, from, to })

      set({
        accounts: response.data.accounts,
        selectedAccount: response.data.selected_account,
        transactions: response.data.transactions,
        openingBalance: response.data.opening_balance,
        closingBalance: response.data.closing_balance,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch ledger'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (newFilters) => {
    const currentFilters = get().filters
    set({
      filters: { ...currentFilters, ...newFilters },
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))

export const useBalanceSheetStore = create<BalanceSheetState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  filters: {
    as_of: new Date().toISOString().split('T')[0],
  },

  fetchBalanceSheet: async () => {
    set({ isLoading: true, error: null })

    try {
      const { as_of } = get().filters
      const response = await financeApi.getBalanceSheet({ as_of })

      set({
        data: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch balance sheet'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (newFilters) => {
    const currentFilters = get().filters
    set({
      filters: { ...currentFilters, ...newFilters },
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))

export const useProfitLossStore = create<ProfitLossState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  filters: getDefaultDateRange(),

  fetchProfitLoss: async () => {
    set({ isLoading: true, error: null })

    try {
      const { from, to } = get().filters
      const response = await financeApi.getProfitLoss({ from, to })

      set({
        data: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch profit & loss'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (newFilters) => {
    const currentFilters = get().filters
    set({
      filters: { ...currentFilters, ...newFilters },
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))
