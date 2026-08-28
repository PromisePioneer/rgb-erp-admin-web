/**
 * Areas Store
 * Zustand state management for areas
 */
import { create } from 'zustand'
import type {
  Area,
  AreaDetail,
  AreasFilters,
  AreasPagination,
  CreateAreaPayload,
  UpdateAreaPayload,
} from '../types/areas.types'
import { areasApi } from '../api/areas-api'

interface AreasState {
  // State
  items: Area[]
  selectedItem: AreaDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: AreasFilters
  pagination: AreasPagination

  // Actions
  fetchAreas: (params?: AreasFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateAreaPayload) => Promise<void>
  update: (id: number, payload: UpdateAreaPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<AreasFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: AreasFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: AreasPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useAreasStore = create<AreasState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchAreas: async (params?: AreasFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await areasApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch areas'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await areasApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch area'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateAreaPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await areasApi.create(payload)
      set({ isSubmitting: false })
      await get().fetchAreas()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create area'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateAreaPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await areasApi.update(id, payload)
      set({ isSubmitting: false })
      await get().fetchAreas()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update area'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await areasApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchAreas()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete area'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await areasApi.bulkDelete(ids)
      set({ isSubmitting: false })
      await get().fetchAreas()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete areas'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<AreasFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
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
