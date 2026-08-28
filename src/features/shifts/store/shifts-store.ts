/**
 * Shifts Store
 * Zustand state management for shifts
 */
import { create } from 'zustand'
import type {
  Shift,
  ShiftsFilters,
  ShiftsPagination,
  CreateShiftPayload,
  UpdateShiftPayload,
} from '../types/shifts.types'
import { shiftsApi } from '../api/shifts-api'

interface ShiftsState {
  // State
  items: Shift[]
  selectedItem: Shift | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: ShiftsFilters
  pagination: ShiftsPagination

  // Actions
  fetchShifts: (params?: ShiftsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateShiftPayload) => Promise<void>
  update: (id: number, payload: UpdateShiftPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<ShiftsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: ShiftsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: ShiftsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useShiftsStore = create<ShiftsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchShifts: async (params?: ShiftsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await shiftsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch shifts'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await shiftsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch shift'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateShiftPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await shiftsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchShifts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create shift'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateShiftPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await shiftsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchShifts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update shift'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await shiftsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchShifts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete shift'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await shiftsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchShifts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete shifts'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ShiftsFilters>) => {
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
