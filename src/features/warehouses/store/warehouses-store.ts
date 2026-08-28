/**
 * Warehouses Store
 * Zustand state management for warehouses
 */
import { create } from 'zustand'
import type {
  Warehouse,
  WarehousesFilters,
  WarehousesPagination,
  CreateWarehousePayload,
  UpdateWarehousePayload,
} from '../types/warehouses.types'
import { warehousesApi } from '../api/warehouses-api'

interface WarehousesState {
  // State
  items: Warehouse[]
  selectedItem: Warehouse | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: WarehousesFilters
  pagination: WarehousesPagination

  // Actions
  fetchWarehouses: (params?: WarehousesFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateWarehousePayload) => Promise<void>
  update: (id: number, payload: UpdateWarehousePayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<WarehousesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: WarehousesFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: WarehousesPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useWarehousesStore = create<WarehousesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchWarehouses: async (params?: WarehousesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await warehousesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch warehouses'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await warehousesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch warehouse'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateWarehousePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await warehousesApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchWarehouses()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create warehouse'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateWarehousePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await warehousesApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchWarehouses()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update warehouse'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await warehousesApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchWarehouses()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete warehouse'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await warehousesApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchWarehouses()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete warehouses'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<WarehousesFilters>) => {
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
