import { create } from 'zustand'
import type {
  DistributionRequest,
  DistributionRequestFull,
  DistributionRequestsFilters,
  CreateDistributionRequestPayload,
  UpdateDistributionRequestPayload,
  MarkDeliveredPayload,
  Pagination,
} from '../types/distribution-requests.types'
import { distributionRequestsApi } from '../api/distribution-requests-api'

interface DistributionRequestsState {
  // State
  items: DistributionRequest[]
  selectedItem: DistributionRequestFull | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: DistributionRequestsFilters
  pagination: Pagination

  // Actions
  fetchItems: (params?: DistributionRequestsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateDistributionRequestPayload) => Promise<DistributionRequest>
  update: (id: number, payload: UpdateDistributionRequestPayload) => Promise<DistributionRequest>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  submitForApproval: (id: number) => Promise<void>
  markAsDelivered: (id: number, payload: MarkDeliveredPayload) => Promise<void>
  setFilters: (filters: Partial<DistributionRequestsFilters>) => void
  resetFilters: () => void
  clearError: () => void
  clearSelectedItem: () => void
}

export const useDistributionRequestsStore = create<DistributionRequestsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: { page: 1, per_page: 15 },
  pagination: {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  },

  // Actions
  fetchItems: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await distributionRequestsApi.getList(currentFilters)
      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        filters: currentFilters,
        isLoading: false,
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await distributionRequestsApi.getById(id)
      set({ selectedItem: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  create: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await distributionRequestsApi.create(payload)
      set({ isSubmitting: false })
      return response.data
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false })
      throw error
    }
  },

  update: async (id, payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await distributionRequestsApi.update(id, payload)
      set({ isSubmitting: false })
      return response.data
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id) => {
    set({ isSubmitting: true, error: null })
    try {
      await distributionRequestsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh list
      get().fetchItems()
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids) => {
    set({ isSubmitting: true, error: null })
    try {
      await distributionRequestsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh list
      get().fetchItems()
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false })
      throw error
    }
  },

  submitForApproval: async (id) => {
    set({ isSubmitting: true, error: null })
    try {
      await distributionRequestsApi.submitForApproval(id)
      set({ isSubmitting: false })
      // Refresh item
      get().fetchById(id)
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false })
      throw error
    }
  },

  markAsDelivered: async (id, payload) => {
    set({ isSubmitting: true, error: null })
    try {
      await distributionRequestsApi.markAsDelivered(id, payload)
      set({ isSubmitting: false })
      // Refresh item
      get().fetchById(id)
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } })
  },

  resetFilters: () => {
    set({ filters: { page: 1, per_page: 15 } })
  },

  clearError: () => {
    set({ error: null })
  },

  clearSelectedItem: () => {
    set({ selectedItem: null })
  },
}))
