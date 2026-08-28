/**
 * Stock Card Store
 * Zustand state management for stock card
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

export interface StockMovement {
  id: number
  date: string
  type: string
  qty: number
  unit_cost: number
  total_cost: number
  balance_qty: number
  balance_value: number
  description: string
  reference: string | null
}

export interface StockCardData {
  product: {
    id: number
    code: string
    name: string
    unit: string
  }
  warehouse: {
    id: number
    name: string
  }
  beginning_qty: number
  beginning_value: number
  movements: StockMovement[]
  ending_qty: number
  ending_value: number
  avg_cost: number
}

export interface Product {
  id: number
  code: string
  name: string
}

export interface Warehouse {
  id: number
  name: string
}

interface StockCardFilters {
  product_id?: number
  warehouse_id?: number
  start_date?: string
  end_date?: string
}

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
  setFilters: (filters: StockCardFilters) => void
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
    try {
      const { data } = await apiClient.get('/admin/products?per_page=100')
      set({ products: data.data || [] })
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  },

  fetchWarehouses: async () => {
    try {
      const { data } = await apiClient.get('/admin/warehouses')
      set({ warehouses: data.data || [] })
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    }
  },

  fetchStockCard: async () => {
    const { filters } = get()
    if (!filters.product_id || !filters.warehouse_id) return

    set({ isLoadingData: true, error: null })

    try {
      const params = new URLSearchParams()
      params.set('product_id', String(filters.product_id))
      params.set('warehouse_id', String(filters.warehouse_id))
      if (filters.start_date) params.set('start_date', filters.start_date)
      if (filters.end_date) params.set('end_date', filters.end_date)

      const { data } = await apiClient.get(`/admin/inventory/stock-card?${params}`)
      set({ data: data.data || null, isLoadingData: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stock card'
      set({ error: message, isLoadingData: false })
    }
  },

  setFilters: (filters: StockCardFilters) => {
    set({ filters })
    if (filters.product_id && filters.warehouse_id) {
      get().fetchStockCard()
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
