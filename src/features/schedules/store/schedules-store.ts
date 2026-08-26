/**
 * Schedules Store
 * Zustand state management for schedules
 */
import { create } from 'zustand'
import type {
  Schedule,
  SchedulesFilters,
  SchedulesPagination,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '../types/schedules.types'
import { schedulesApi } from '../api/schedules-api'

interface SchedulesState {
  // State
  items: Schedule[]
  selectedItem: Schedule | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: SchedulesFilters
  pagination: SchedulesPagination

  // Actions
  fetchSchedules: (params?: SchedulesFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateSchedulePayload) => Promise<void>
  update: (id: number, payload: UpdateSchedulePayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<SchedulesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: SchedulesFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: SchedulesPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchSchedules: async (params?: SchedulesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await schedulesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch schedules'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await schedulesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch schedule'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateSchedulePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSchedules()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create schedule'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateSchedulePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSchedules()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update schedule'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSchedules()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete schedule'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSchedules()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete schedules'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<SchedulesFilters>) => {
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

  resetForm: () => {
    set({
      selectedItem: null,
      error: null,
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))
