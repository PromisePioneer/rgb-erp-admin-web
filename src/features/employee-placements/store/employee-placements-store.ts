/**
 * Employee Placements Store
 * Zustand state management for employee placements
 */
import { create } from 'zustand'
import type {
  EmployeePlacement,
  EmployeePlacementDetail,
  EmployeePlacementsFilters,
  EmployeePlacementsPagination,
  CreateEmployeePlacementPayload,
  UpdateEmployeePlacementPayload,
} from '../types/employee-placements.types'
import { employeePlacementsApi } from '../api/employee-placements-api'

interface EmployeePlacementsState {
  // State
  items: EmployeePlacement[]
  selectedItem: EmployeePlacementDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: EmployeePlacementsFilters
  pagination: EmployeePlacementsPagination

  // Actions
  fetchPlacements: (params?: EmployeePlacementsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateEmployeePlacementPayload) => Promise<void>
  update: (id: number, payload: UpdateEmployeePlacementPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<EmployeePlacementsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: EmployeePlacementsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: EmployeePlacementsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useEmployeePlacementsStore = create<EmployeePlacementsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchPlacements: async (params?: EmployeePlacementsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await employeePlacementsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch employee placements'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await employeePlacementsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch employee placement'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateEmployeePlacementPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeePlacementsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPlacements()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create employee placement'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateEmployeePlacementPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeePlacementsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPlacements()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update employee placement'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeePlacementsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPlacements()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete employee placement'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeePlacementsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPlacements()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete employee placements'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<EmployeePlacementsFilters>) => {
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
