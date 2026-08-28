/**
 * Petty Cash Store
 * Zustand state management for petty cash
 */
import { create } from 'zustand'
import type {
  PettyCash,
  PettyCashFilters,
  PettyCashPagination,
  CreatePettyCashPayload,
  UpdatePettyCashPayload,
} from '../types/petty-cash.types'
import { pettyCashApi } from '../api/petty-cash-api'

interface PettyCashState {
  // State
  items: PettyCash[]
  selectedItem: PettyCash | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: PettyCashFilters
  pagination: PettyCashPagination

  // Actions
  fetchPettyCash: (params?: PettyCashFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreatePettyCashPayload) => Promise<void>
  update: (id: number, payload: UpdatePettyCashPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<PettyCashFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: PettyCashFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: PettyCashPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const usePettyCashStore = create<PettyCashState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchPettyCash: async (params?: PettyCashFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await pettyCashApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch petty cash'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await pettyCashApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch petty cash'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreatePettyCashPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await pettyCashApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPettyCash()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create petty cash'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdatePettyCashPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await pettyCashApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPettyCash()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update petty cash'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await pettyCashApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPettyCash()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete petty cash'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await pettyCashApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPettyCash()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete petty cash records'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<PettyCashFilters>) => {
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
