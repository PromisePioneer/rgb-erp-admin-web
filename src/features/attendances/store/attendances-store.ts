/**
 * Attendances Store
 * Zustand state management for attendances (READ-ONLY)
 */
import { create } from 'zustand'
import type {
  Attendance,
  AttendanceRecap,
  AttendanceStats,
  AttendancesFilters,
  AttendancesPagination,
} from '../types/attendances.types'
import { attendancesApi } from '../api/attendances-api'

interface AttendancesState {
  // State
  items: Attendance[]
  recapItems: AttendanceRecap[]
  selectedItem: Attendance | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: AttendancesFilters
  pagination: AttendancesPagination
  stats: AttendanceStats | null
  selectedMonth: string

  // Actions
  fetchAttendance: (params?: AttendancesFilters) => Promise<void>
  fetchRecap: (params?: AttendancesFilters) => Promise<void>
  setFilters: (filters: Partial<AttendancesFilters>) => void
  resetFilters: () => void
  reset: () => void
  clearError: () => void
}

const initialFilters: AttendancesFilters = {
  month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  page: 1,
  per_page: 24,
}

const initialPagination: AttendancesPagination = {
  current_page: 1,
  per_page: 24,
  total: 0,
  last_page: 1,
}

export const useAttendancesStore = create<AttendancesState>((set, get) => ({
  // Initial state
  items: [],
  recapItems: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  stats: null,
  selectedMonth: new Date().toISOString().slice(0, 7),

  // Actions
  fetchAttendance: async (params?: AttendancesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await attendancesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: {
          current_page: response.meta?.current_page ?? 1,
          per_page: response.meta?.per_page ?? 24,
          total: response.meta?.total ?? 0,
          last_page: response.meta?.last_page ?? 1,
        },
        stats: response.meta?.stats ?? null,
        selectedMonth: response.meta?.selected_month ?? get().selectedMonth,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch attendance records'
      set({ error: message, isLoading: false })
    }
  },

  fetchRecap: async (params?: AttendancesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await attendancesApi.getRecap(currentFilters)

      set({
        recapItems: response.data,
        pagination: {
          current_page: response.meta?.current_page ?? 1,
          per_page: response.meta?.per_page ?? 24,
          total: response.meta?.total ?? 0,
          last_page: response.meta?.last_page ?? 1,
        },
        selectedMonth: response.meta?.selected_month ?? get().selectedMonth,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch attendance recap'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (newFilters: Partial<AttendancesFilters>) => {
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

  reset: () => {
    set({
      items: [],
      recapItems: [],
      selectedItem: null,
      error: null,
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))
