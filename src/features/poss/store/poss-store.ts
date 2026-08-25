/**
 * Poss Store
 * Zustand state management for poss
 */
import { create } from 'zustand'
import type {
  Pos,
  PosDetail,
  PossFilters,
  PossPagination,
  CreatePosPayload,
  UpdatePosPayload,
} from '../types/poss.types'
import { possApi } from '../api/poss-api'

interface PossState {
  // State
  items: Pos[]
  selectedItem: PosDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: PossFilters
  pagination: PossPagination

  // Actions
  fetchPoss: (params?: PossFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreatePosPayload) => Promise<void>
  update: (id: number, payload: UpdatePosPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<PossFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: PossFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: PossPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const usePossStore = create<PossState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchPoss: async (params?: PossFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await possApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch poss'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await possApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch pos'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreatePosPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await possApi.create(payload)
      set({ isSubmitting: false })
      await get().fetchPoss()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create pos'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdatePosPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await possApi.update(id, payload)
      set({ isSubmitting: false })
      await get().fetchPoss()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update pos'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await possApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchPoss()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete pos'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await possApi.bulkDelete(ids)
      set({ isSubmitting: false })
      await get().fetchPoss()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete poss'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<PossFilters>) => {
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
