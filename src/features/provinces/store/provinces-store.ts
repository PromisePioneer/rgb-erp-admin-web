/**
 * Provinces Store
 * Zustand state management
 */
import { create } from 'zustand'
import type {
  Province,
  ProvincesFilters,
  ProvincesPagination,
  CreateProvincePayload,
  UpdateProvincePayload,
} from '../types/provinces.types'
import { provincesApi } from '../api/provinces-api'

interface ProvincesState {
  items: Province[]
  selectedItem: Province | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: ProvincesFilters
  pagination: ProvincesPagination

  fetchProvinces: (params?: ProvincesFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateProvincePayload) => Promise<void>
  update: (id: number, payload: UpdateProvincePayload) => Promise<void>
  remove: (id: number) => Promise<void>
  setFilters: (filters: Partial<ProvincesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: ProvincesFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: ProvincesPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useProvincesStore = create<ProvincesState>((set, get) => ({
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  fetchProvinces: async (params?: ProvincesFilters) => {
    set({ isLoading: true, error: null })
    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await provincesApi.getList(currentFilters)
      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch', isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })
    try {
      const response = await provincesApi.getById(id)
      set({ selectedItem: response.data, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch', isLoading: false })
    }
  },

  create: async (payload: CreateProvincePayload) => {
    set({ isSubmitting: true, error: null })
    try {
      await provincesApi.create(payload)
      set({ isSubmitting: false })
      await get().fetchProvinces()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create', isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateProvincePayload) => {
    set({ isSubmitting: true, error: null })
    try {
      await provincesApi.update(id, payload)
      set({ isSubmitting: false })
      await get().fetchProvinces()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update', isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await provincesApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchProvinces()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete', isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ProvincesFilters>) => {
    const updated = { ...get().filters, ...newFilters }
    if (!('page' in newFilters)) updated.page = 1
    set({ filters: updated })
  },

  resetFilters: () => set({ filters: initialFilters }),

  resetForm: () => set({ selectedItem: null, error: null }),

  clearError: () => set({ error: null }),
}))
