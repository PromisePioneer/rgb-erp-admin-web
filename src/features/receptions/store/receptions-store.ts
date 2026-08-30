/**
 * Receptions Store
 * Zustand state management for receptions
 */
import { create } from 'zustand'
import type {
  Reception,
  ReceptionsFilters,
  ReceptionsPagination,
  CreateReceptionPayload,
  UpdateReceptionPayload,
} from '../types/receptions.types'
import { receptionsApi } from '../api/receptions-api'

interface ReceptionsState {
  // State
  items: Reception[]
  selectedItem: Reception | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: ReceptionsFilters
  pagination: ReceptionsPagination

  // Actions
  fetchReceptions: (params?: ReceptionsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateReceptionPayload) => Promise<void>
  update: (id: number, payload: UpdateReceptionPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<ReceptionsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: ReceptionsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: ReceptionsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useReceptionsStore = create<ReceptionsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchReceptions: async (params?: ReceptionsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await receptionsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch receptions'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await receptionsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch reception'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateReceptionPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await receptionsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchReceptions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create reception'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateReceptionPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await receptionsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchReceptions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update reception'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await receptionsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchReceptions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete reception'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await receptionsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchReceptions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete receptions'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ReceptionsFilters>) => {
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
