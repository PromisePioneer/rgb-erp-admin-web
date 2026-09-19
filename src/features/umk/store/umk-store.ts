/**
 * UMK Store
 * Zustand state management for Upah Minimum Kota
 */
import { create } from 'zustand'
import type {
  UMK,
  UMKFilters,
  UMKPagination,
  CreateUMKPayload,
  UpdateUMKPayload,
} from '../types/umk.types'
import { umkApi } from '../api/umk-api'

interface UMKState {
  items: UMK[]
  selectedItem: UMK | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: UMKFilters
  pagination: UMKPagination

  fetchItems: (params?: UMKFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateUMKPayload) => Promise<void>
  update: (id: number, payload: UpdateUMKPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<UMKFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: UMKFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: UMKPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useUmkStore = create<UMKState>((set, get) => ({
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  fetchItems: async (params?: UMKFilters) => {
    set({ isLoading: true, error: null })
    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await umkApi.getList(currentFilters)
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
      const response = await umkApi.getById(id)
      set({ selectedItem: response.data, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch', isLoading: false })
    }
  },

  create: async (payload: CreateUMKPayload) => {
    set({ isSubmitting: true, error: null })
    try {
      await umkApi.create(payload)
      set({ isSubmitting: false })
      await get().fetchItems()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create', isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateUMKPayload) => {
    set({ isSubmitting: true, error: null })
    try {
      await umkApi.update(id, payload)
      set({ isSubmitting: false })
      await get().fetchItems()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update', isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await umkApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchItems()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete', isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })
    try {
      await umkApi.bulkDelete(ids)
      set({ isSubmitting: false })
      await get().fetchItems()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete', isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<UMKFilters>) => {
    const updated = { ...get().filters, ...newFilters }
    if (!('page' in newFilters)) updated.page = 1
    set({ filters: updated })
  },

  resetFilters: () => set({ filters: initialFilters }),

  resetForm: () => set({ selectedItem: null, error: null }),

  clearError: () => set({ error: null }),
}))
