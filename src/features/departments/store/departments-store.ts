/**
 * Departments Store
 * Zustand state management for departments
 */
import { create } from 'zustand'
import type {
  Department,
  DepartmentsFilters,
  DepartmentsPagination,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '../types/departments.types'
import { departmentsApi } from '../api/departments-api'

interface DepartmentsState {
  // State
  items: Department[]
  selectedItem: Department | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: DepartmentsFilters
  pagination: DepartmentsPagination

  // Actions
  fetchDepartments: (params?: DepartmentsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateDepartmentPayload) => Promise<void>
  update: (id: number, payload: UpdateDepartmentPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<DepartmentsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: DepartmentsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: DepartmentsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useDepartmentsStore = create<DepartmentsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchDepartments: async (params?: DepartmentsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await departmentsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch departments'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await departmentsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch department'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateDepartmentPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await departmentsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchDepartments()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create department'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateDepartmentPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await departmentsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchDepartments()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update department'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await departmentsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchDepartments()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete department'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await departmentsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchDepartments()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete departments'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<DepartmentsFilters>) => {
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
