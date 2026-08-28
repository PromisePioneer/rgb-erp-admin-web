/**
 * Employees Store
 * Zustand state management for employees
 */
import { create } from 'zustand'
import type {
  Employee,
  EmployeeDetail,
  EmployeesFilters,
  EmployeesPagination,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from '../types/employees.types'
import { employeesApi } from '../api/employees-api'

interface EmployeesState {
  // State
  items: Employee[]
  selectedItem: EmployeeDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: EmployeesFilters
  pagination: EmployeesPagination

  // Actions
  fetchEmployees: (params?: EmployeesFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateEmployeePayload) => Promise<void>
  update: (id: number, payload: UpdateEmployeePayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<EmployeesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: EmployeesFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: EmployeesPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchEmployees: async (params?: EmployeesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await employeesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch employees'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await employeesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch employee'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateEmployeePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeesApi.create(payload)
      set({ isSubmitting: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create employee'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateEmployeePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeesApi.update(id, payload)
      set({ isSubmitting: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update employee'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeesApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchEmployees()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete employee'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await employeesApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchEmployees()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete employees'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<EmployeesFilters>) => {
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
