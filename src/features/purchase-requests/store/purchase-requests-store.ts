/**
 * Purchase Requests Store
 * Zustand state management for purchase requests
 */
import { create } from 'zustand'
import type {
  PurchaseRequest,
  PurchaseRequestFull,
  PurchaseRequestsFilters,
  PurchaseRequestsPagination,
  CreatePurchaseRequestPayload,
  UpdatePurchaseRequestPayload,
} from '../types/purchase-requests.types'
import { purchaseRequestsApi } from '../api/purchase-requests-api'

interface PurchaseRequestsState {
  // State
  items: PurchaseRequest[]
  selectedItem: PurchaseRequestFull | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: PurchaseRequestsFilters
  pagination: PurchaseRequestsPagination

  // Actions
  fetchPurchaseRequests: (params?: PurchaseRequestsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreatePurchaseRequestPayload) => Promise<void>
  update: (id: number, payload: UpdatePurchaseRequestPayload) => Promise<void>
  submitForApproval: (id: number) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<PurchaseRequestsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: PurchaseRequestsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: PurchaseRequestsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const usePurchaseRequestsStore = create<PurchaseRequestsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchPurchaseRequests: async (params?: PurchaseRequestsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await purchaseRequestsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch purchase requests'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await purchaseRequestsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch purchase request'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreatePurchaseRequestPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseRequestsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseRequests()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create purchase request'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdatePurchaseRequestPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseRequestsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseRequests()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update purchase request'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  submitForApproval: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseRequestsApi.submitForApproval(id)
      set({ isSubmitting: false })
      // Refresh the list and selected item
      await get().fetchPurchaseRequests()
      await get().fetchById(id)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit for approval'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseRequestsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseRequests()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete purchase request'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseRequestsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseRequests()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete purchase requests'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<PurchaseRequestsFilters>) => {
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
