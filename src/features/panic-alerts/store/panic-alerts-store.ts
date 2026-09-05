/**
 * Panic Alerts Store
 * Zustand state management for panic alerts (READ-ONLY)
 */
import { create } from 'zustand'
import type {
  PanicAlert,
  PanicAlertDetail,
  PanicAlertsFilters,
  PanicAlertsPagination,
} from '../types/panic-alerts.types'
import { panicAlertsApi } from '../api/panic-alerts-api'

interface PanicAlertsState {
  // State
  items: PanicAlert[]
  selectedItem: PanicAlertDetail | null
  isLoading: boolean
  error: string | null
  filters: PanicAlertsFilters
  pagination: PanicAlertsPagination

  // Actions
  fetchAlerts: (params?: PanicAlertsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  setFilters: (filters: Partial<PanicAlertsFilters>) => void
  resetFilters: () => void
  clearError: () => void
}

const initialFilters: PanicAlertsFilters = {
  page: 1,
  per_page: 100,
}

const initialPagination: PanicAlertsPagination = {
  current_page: 1,
  per_page: 100,
  total: 0,
  last_page: 1,
}

export const usePanicAlertsStore = create<PanicAlertsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchAlerts: async (params?: PanicAlertsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await panicAlertsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch panic alerts'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await panicAlertsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch panic alert'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (newFilters: Partial<PanicAlertsFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    // Reset to page 1 when changing filters (except page itself)
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  clearError: () => {
    set({ error: null })
  },
}))
