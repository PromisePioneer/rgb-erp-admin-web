/**
 * Payroll Store
 * Zustand state management for payroll
 */
import { create } from 'zustand'
import type {
  PayrollDetail,
  PayrollFilters,
  PayrollItem,
  PayrollPagination,
} from '../types/payroll.types'
import { payrollApi } from '../api/payroll-api'

interface PayrollState {
  // List state
  items: PayrollItem[]
  pagination: PayrollPagination | null
  isLoading: boolean
  error: string | null

  // Detail state
  selectedPayroll: PayrollDetail | null
  isLoadingDetail: boolean
  detailError: string | null

  // Generate state
  isGenerating: boolean
  generateError: string | null

  // Filters
  filters: PayrollFilters

  // Actions
  fetchPayroll: () => Promise<void>
  fetchById: (id: number) => Promise<void>
  generatePayroll: (month: number, year: number) => Promise<void>
  generateThr: (year: number) => Promise<void>
  setFilters: (filters: Partial<PayrollFilters>) => void
  resetFilters: () => void
  clearError: () => void
  clearDetail: () => void
}

const defaultFilters: PayrollFilters = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  type: 'monthly',
  page: 1,
  per_page: 15,
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  // Initial state
  items: [],
  pagination: null,
  isLoading: false,
  error: null,
  selectedPayroll: null,
  isLoadingDetail: false,
  detailError: null,
  isGenerating: false,
  generateError: null,
  filters: defaultFilters,

  // Actions
  fetchPayroll: async () => {
    set({ isLoading: true, error: null })

    try {
      const { month, year, type, page, per_page } = get().filters
      const response = await payrollApi.getList({
        month,
        year,
        type,
        page,
        per_page,
      })

      set({
        items: response.data,
        pagination: response.meta,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch payroll'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoadingDetail: true, detailError: null, selectedPayroll: null })

    try {
      const response = await payrollApi.getById(id)
      set({
        selectedPayroll: response.data,
        isLoadingDetail: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch payroll detail'
      set({ detailError: message, isLoadingDetail: false })
    }
  },

  generatePayroll: async (month: number, year: number) => {
    set({ isGenerating: true, generateError: null })

    try {
      await payrollApi.generate({ month, year })
      set({ isGenerating: false })
      // Refresh list
      await get().fetchPayroll()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate payroll'
      set({ generateError: message, isGenerating: false })
      throw error
    }
  },

  generateThr: async (year: number) => {
    set({ isGenerating: true, generateError: null })

    try {
      await payrollApi.generateThr({ year })
      set({ isGenerating: false })
      // Refresh list
      await get().fetchPayroll()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate THR'
      set({ generateError: message, isGenerating: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<PayrollFilters>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }
    // Reset to page 1 when changing filters (except page itself)
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: defaultFilters })
  },

  clearError: () => {
    set({ error: null })
  },

  clearDetail: () => {
    set({ selectedPayroll: null, detailError: null })
  },
}))
