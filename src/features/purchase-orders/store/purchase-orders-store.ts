/**
 * Purchase Orders Store
 * Zustand state management for purchase orders
 */
import { create } from 'zustand'
import type {
  PurchaseOrder,
  PurchaseOrderFull,
  PurchaseOrdersFilters,
  PurchaseOrdersPagination,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
} from '../types/purchase-orders.types'
import { purchaseOrdersApi } from '../api/purchase-orders-api'

interface PurchaseOrdersState {
  // State
  items: PurchaseOrder[]
  selectedItem: PurchaseOrderFull | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: PurchaseOrdersFilters
  pagination: PurchaseOrdersPagination

  // Actions
  fetchPurchaseOrders: (params?: PurchaseOrdersFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreatePurchaseOrderPayload) => Promise<void>
  update: (id: number, payload: UpdatePurchaseOrderPayload) => Promise<void>
  submitForApproval: (id: number) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<PurchaseOrdersFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: PurchaseOrdersFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: PurchaseOrdersPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const usePurchaseOrdersStore = create<PurchaseOrdersState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchPurchaseOrders: async (params?: PurchaseOrdersFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await purchaseOrdersApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch purchase orders'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await purchaseOrdersApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch purchase order'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreatePurchaseOrderPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseOrdersApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseOrders()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create purchase order'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdatePurchaseOrderPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseOrdersApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseOrders()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update purchase order'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  submitForApproval: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseOrdersApi.submitForApproval(id)
      set({ isSubmitting: false })
      // Refresh the list and selected item
      await get().fetchPurchaseOrders()
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
      await purchaseOrdersApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseOrders()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete purchase order'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await purchaseOrdersApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchPurchaseOrders()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete purchase orders'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<PurchaseOrdersFilters>) => {
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
