/**
 * Inventory Items Store
 * Zustand state management for inventory barcode tracking
 */
import { create } from 'zustand'
import type {
  InventoryItem,
  InventoryItemSummary,
  InventoryFilters,
  InventoryPagination,
  MoveItemPayload,
  ReturnItemPayload,
  UpdateStatusPayload,
} from '../types/inventory-items.types'
import { inventoryApi } from '../api/inventory-items-api'

interface InventoryState {
  // State
  items: InventoryItem[]
  selectedItem: InventoryItem | null
  scannedItem: InventoryItem | null
  summary: InventoryItemSummary | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: InventoryFilters
  pagination: InventoryPagination

  // Actions
  fetchItems: (params?: InventoryFilters) => Promise<void>
  scanBarcode: (barcode: string) => Promise<InventoryItem | null>
  moveItem: (payload: MoveItemPayload) => Promise<void>
  returnItem: (payload: ReturnItemPayload) => Promise<void>
  updateStatus: (payload: UpdateStatusPayload) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  fetchSummary: (productId?: number) => Promise<void>
  setFilters: (filters: Partial<InventoryFilters>) => void
  resetFilters: () => void
  clearScannedItem: () => void
  clearError: () => void
}

const initialFilters: InventoryFilters = {
  page: 1,
  per_page: 50,
}

const initialPagination: InventoryPagination = {
  current_page: 1,
  per_page: 50,
  total: 0,
  last_page: 1,
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  scannedItem: null,
  summary: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchItems: async (params?: InventoryFilters) => {
    set({ isLoading: true, error: null })
    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await inventoryApi.getList(currentFilters)
      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch items'
      set({ error: message, isLoading: false })
    }
  },

  scanBarcode: async (barcode: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await inventoryApi.scan(barcode)
      set({ scannedItem: response.data, isLoading: false })
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Barcode not found'
      set({ error: message, isLoading: false })
      return null
    }
  },

  moveItem: async (payload: MoveItemPayload) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await inventoryApi.move(payload)
      set({
        scannedItem: response.data.item,
        isSubmitting: false,
      })
      // Refresh list
      await get().fetchItems()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move item'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  returnItem: async (payload: ReturnItemPayload) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await inventoryApi.return(payload)
      set({
        scannedItem: response.data.item,
        isSubmitting: false,
      })
      // Refresh list
      await get().fetchItems()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to return item'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  updateStatus: async (payload: UpdateStatusPayload) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await inventoryApi.updateStatus(payload)
      set({
        scannedItem: response.data.item,
        isSubmitting: false,
      })
      // Refresh list
      await get().fetchItems()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })
    try {
      await inventoryApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh list
      await get().fetchItems()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete items'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  fetchSummary: async (productId?: number) => {
    try {
      const response = await inventoryApi.getSummary({ product_id: productId })
      set({ summary: response.data })
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  },

  setFilters: (newFilters: Partial<InventoryFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  clearScannedItem: () => {
    set({ scannedItem: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
