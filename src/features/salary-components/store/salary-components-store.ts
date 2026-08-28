/**
 * Salary Components Store
 * Zustand state management for salary components
 */
import { create } from 'zustand'
import type {
  SalaryComponent,
  SalaryComponentsFilters,
  SalaryComponentsPagination,
  CreateSalaryComponentPayload,
  UpdateSalaryComponentPayload,
} from '../types/salary-components.types'
import { salaryComponentsApi } from '../api/salary-components-api'

interface SalaryComponentsState {
  // State
  items: SalaryComponent[]
  selectedItem: SalaryComponent | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: SalaryComponentsFilters
  pagination: SalaryComponentsPagination

  // Actions
  fetchSalaryComponents: (params?: SalaryComponentsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateSalaryComponentPayload) => Promise<void>
  update: (id: number, payload: UpdateSalaryComponentPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<SalaryComponentsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: SalaryComponentsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: SalaryComponentsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useSalaryComponentsStore = create<SalaryComponentsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchSalaryComponents: async (params?: SalaryComponentsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await salaryComponentsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch salary components'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await salaryComponentsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch salary component'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateSalaryComponentPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await salaryComponentsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSalaryComponents()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create salary component'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateSalaryComponentPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await salaryComponentsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSalaryComponents()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update salary component'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await salaryComponentsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSalaryComponents()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete salary component'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await salaryComponentsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchSalaryComponents()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete salary components'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<SalaryComponentsFilters>) => {
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
