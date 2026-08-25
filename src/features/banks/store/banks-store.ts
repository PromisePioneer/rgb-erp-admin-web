/**
 * Banks Store
 * Zustand state management for banks
 */
import { create } from 'zustand'
import type {
  Bank,
  BanksFilters,
  BanksPagination,
  CreateBankPayload,
  UpdateBankPayload,
} from '../types/banks.types'
import { banksApi } from '../api/banks-api'

interface BanksState {
  // State
  items: Bank[]
  selectedItem: Bank | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: BanksFilters
  pagination: BanksPagination

  // Actions
  fetchBanks: (params?: BanksFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateBankPayload) => Promise<void>
  update: (id: number, payload: UpdateBankPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<BanksFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: BanksFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: BanksPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useBanksStore = create<BanksState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchBanks: async (params?: BanksFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await banksApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch banks'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await banksApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch bank'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateBankPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await banksApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBanks()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create bank'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateBankPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await banksApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBanks()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update bank'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await banksApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBanks()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete bank'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await banksApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBanks()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete banks'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<BanksFilters>) => {
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
