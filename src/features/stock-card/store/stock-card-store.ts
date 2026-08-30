/**
 * Stock Card Store
 * Zustand state management for stock card
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'
import type {
  StockCardData,
  StockCardFilters,
  Product,
  Warehouse,
  ApiResponse,
} from '../types/stock-card.types'

interface StockCardState {
  // State
  data: StockCardData | null
  products: Product[]
  warehouses: Warehouse[]
  isLoading: boolean
  isLoadingData: boolean
  error: string | null
  filters: StockCardFilters

  // Actions
  fetchProducts: () => Promise<void>
  fetchWarehouses: () => Promise<void>
  fetchStockCard: () => Promise<void>
  setFilters: (filters: Partial<StockCardFilters>) => void
  clearError: () => void
}

export const useStockCardStore = create<StockCardState>((set, get) => ({
  // Initial state
  data: null,
  products: [],
  warehouses: [],
  isLoading: false,
  isLoadingData: false,
  error: null,
  filters: {},

  // Actions
  fetchProducts: async () => {
    set({ isLoading: true })
    try {
      const { data } = await apiClient.get<ApiResponse<Product[]>>('/admin/products', {
        params: { per_page: 100 },
      })
      set({ products: data.data || [], isLoading: false })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      set({ isLoading: false })
    }
  },

  fetchWarehouses: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Warehouse[]>>('/admin/warehouses')
      set({ warehouses: data.data || [] })
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    }
  },

  fetchStockCard: async () => {
    const { filters } = get()
    if (!filters.product_id) return

    set({ isLoadingData: true, error: null })

    try {
      const params = new URLSearchParams()
      params.set('product_id', String(filters.product_id))
      if (filters.warehouse_id) params.set('warehouse_id', String(filters.warehouse_id))
      if (filters.start_date) params.set('start_date', filters.start_date)
      if (filters.end_date) params.set('end_date', filters.end_date)

      const { data } = await apiClient.get<ApiResponse<StockCardData>>(
        `/admin/inventory/stock-card?${params.toString()}`
      )
      set({ data: data.data || null, isLoadingData: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stock card'
      set({ error: message, isLoadingData: false })
    }
  },

  setFilters: (newFilters: Partial<StockCardFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    set({ filters: updatedFilters })

    if (updatedFilters.product_id) {
      get().fetchStockCard()
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
