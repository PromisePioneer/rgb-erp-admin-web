/**
 * Positions Store
 * Zustand state management for positions
 */
import { create } from 'zustand'
import type {
  Position,
  PositionsFilters,
  PositionsPagination,
  CreatePositionPayload,
  UpdatePositionPayload,
} from '../types/positions.types'
import { positionsApi } from '../api/positions-api'

interface PositionsState {
  // State
  items: Position[]
  selectedItem: Position | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: PositionsFilters
  pagination: PositionsPagination

  // Actions
  fetchPositions: (params?: PositionsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreatePositionPayload) => Promise<void>
  update: (id: number, payload: UpdatePositionPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<PositionsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: PositionsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: PositionsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const usePositionsStore = create<PositionsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchPositions: async (params?: PositionsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await positionsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch positions'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await positionsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch position'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreatePositionPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await positionsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPositions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create position'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdatePositionPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await positionsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPositions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update position'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await positionsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPositions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete position'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await positionsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPositions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete positions'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<PositionsFilters>) => {
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
