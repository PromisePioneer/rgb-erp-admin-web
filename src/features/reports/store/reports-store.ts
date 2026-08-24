/**
 * Reports Store
 * Zustand state management for field reports
 */
import { create } from 'zustand'
import type {
  FieldReport,
  ReportByArea,
  ReportsFilters,
  ReportsPagination,
  Client,
} from '../types/reports.types'
import { reportsApi } from '../api/reports-api'

interface ReportsState {
  // State
  items: FieldReport[]
  groupedAreas: ReportByArea[]
  clients: Client[]
  isLoading: boolean
  isLoadingClients: boolean
  error: string | null
  filters: ReportsFilters
  pagination: ReportsPagination

  // Actions
  fetchReports: (params?: ReportsFilters) => Promise<void>
  fetchByArea: (params?: ReportsFilters) => Promise<void>
  fetchClients: () => Promise<void>
  setFilters: (filters: Partial<ReportsFilters>) => void
  resetFilters: () => void
  reset: () => void
}

const initialFilters: ReportsFilters = {
  page: 1,
  limit: 15,
}

const initialPagination: ReportsPagination = {
  page: 1,
  limit: 15,
  total: 0,
  total_pages: 0,
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  // Initial state
  items: [],
  groupedAreas: [],
  clients: [],
  isLoading: false,
  isLoadingClients: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchReports: async (params?: ReportsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await reportsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch reports'
      set({ error: message, isLoading: false })
    }
  },

  fetchByArea: async (params?: ReportsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await reportsApi.getByArea(currentFilters)

      set({
        groupedAreas: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch reports by area'
      set({ error: message, isLoading: false })
    }
  },

  fetchClients: async () => {
    set({ isLoadingClients: true })

    try {
      const response = await reportsApi.getClients()
      set({
        clients: response.data,
        isLoadingClients: false,
      })
    } catch {
      // Use empty array on error, filter will still work without clients
      set({ clients: [], isLoadingClients: false })
    }
  },

  setFilters: (newFilters: Partial<ReportsFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    // Reset to page 1 when changing filters
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  reset: () => {
    set({
      items: [],
      groupedAreas: [],
      error: null,
      filters: initialFilters,
      pagination: initialPagination,
    })
  },
}))
