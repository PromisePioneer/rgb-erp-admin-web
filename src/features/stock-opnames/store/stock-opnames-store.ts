/**
 * Stock Opname Store
 * Zustand state management for stock opname
 */
import { create } from 'zustand'
import type {
  StockPosition,
  StockOpnameHistory,
  StockOpnameFilters,
  StockOpnamePagination,
  SubmitStockOpnamePayload,
  OpnameLineItem,
} from '../types/stock-opnames.types'
import { stockOpnamesApi } from '../api/stock-opnames-api'

interface StockOpnameState {
  // State - Stock Positions
  positions: StockPosition[]
  lineItems: OpnameLineItem[]
  selectedWarehouseId: number | null
  selectedWarehouseName: string | null
  opnameDate: string

  // State - History
  history: StockOpnameHistory[]
  historyPagination: StockOpnamePagination
  historyFilters: StockOpnameFilters

  // State - Loading
  isLoadingPositions: boolean
  isSubmitting: boolean
  isLoadingHistory: boolean
  error: string | null

  // Actions - Stock Positions
  fetchPositions: (warehouseId: number) => Promise<void>
  setLineItemActualQty: (productId: number, actualQty: number) => void
  setOpnameDate: (date: string) => void
  resetPositions: () => void
  submitOpname: () => Promise<{ success: boolean; message: string }>

  // Actions - History
  fetchHistory: (params?: StockOpnameFilters) => Promise<void>
  setHistoryFilters: (filters: Partial<StockOpnameFilters>) => void
  resetHistoryFilters: () => void

  // Common
  clearError: () => void
}

const initialHistoryFilters: StockOpnameFilters = {
  page: 1,
  per_page: 20,
}

const initialHistoryPagination: StockOpnamePagination = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
}

export const useStockOpnameStore = create<StockOpnameState>((set, get) => ({
  // Initial state - Stock Positions
  positions: [],
  lineItems: [],
  selectedWarehouseId: null,
  selectedWarehouseName: null,
  opnameDate: new Date().toISOString().split('T')[0],

  // Initial state - History
  history: [],
  historyPagination: initialHistoryPagination,
  historyFilters: initialHistoryFilters,

  // Initial state - Loading
  isLoadingPositions: false,
  isSubmitting: false,
  isLoadingHistory: false,
  error: null,

  // Actions - Stock Positions
  fetchPositions: async (warehouseId: number) => {
    set({ isLoadingPositions: true, error: null })

    try {
      const response = await stockOpnamesApi.getStockPositions(warehouseId)

      const positions = response.data.positions || []
      const warehouseName = response.data.warehouse_name

      // Transform positions to line items with actual_qty = system_qty
      const lineItems: OpnameLineItem[] = positions.map(pos => ({
        ...pos,
        actual_qty: pos.system_qty,
        variance: 0,
        variance_value: 0,
      }))

      set({
        positions,
        lineItems,
        selectedWarehouseId: warehouseId,
        selectedWarehouseName: warehouseName,
        isLoadingPositions: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch stock positions'
      set({ error: message, isLoadingPositions: false })
    }
  },

  setLineItemActualQty: (productId: number, actualQty: number) => {
    set(state => ({
      lineItems: state.lineItems.map(item => {
        if (item.product_id !== productId) return item

        const variance = actualQty - item.system_qty
        const variance_value = variance * item.avg_cost

        return {
          ...item,
          actual_qty: actualQty,
          variance,
          variance_value,
        }
      }),
    }))
  },

  setOpnameDate: (date: string) => {
    set({ opnameDate: date })
  },

  resetPositions: () => {
    set({
      positions: [],
      lineItems: [],
      selectedWarehouseId: null,
      selectedWarehouseName: null,
    })
  },

  submitOpname: async () => {
    const { selectedWarehouseId, opnameDate, lineItems } = get()

    if (!selectedWarehouseId) {
      return { success: false, message: 'Warehouse belum dipilih' }
    }

    // Only submit items with variance
    const itemsWithVariance = lineItems.filter(item => item.variance !== 0)

    if (itemsWithVariance.length === 0) {
      return { success: false, message: 'Tidak ada perubahan stok untuk disimpan' }
    }

    set({ isSubmitting: true, error: null })

    try {
      const payload: SubmitStockOpnamePayload = {
        warehouse_id: selectedWarehouseId,
        opname_date: opnameDate,
        items: itemsWithVariance.map(item => ({
          product_id: item.product_id,
          actual_qty: item.actual_qty,
        })),
      }

      const response = await stockOpnamesApi.submit(payload)
      set({ isSubmitting: false })

      // Reset positions after successful submission
      get().resetPositions()

      return {
        success: true,
        message: response.data.message || 'Stock opname berhasil disimpan',
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit stock opname'
      set({ error: message, isSubmitting: false })
      return { success: false, message }
    }
  },

  // Actions - History
  fetchHistory: async (params?: StockOpnameFilters) => {
    set({ isLoadingHistory: true, error: null })

    try {
      const currentFilters = { ...get().historyFilters, ...params }
      const response = await stockOpnamesApi.getHistory(currentFilters)

      set({
        history: response.data || [],
        historyPagination: response.meta ?? get().historyPagination,
        isLoadingHistory: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch history'
      set({ error: message, isLoadingHistory: false })
    }
  },

  setHistoryFilters: (newFilters: Partial<StockOpnameFilters>) => {
    const updatedFilters = { ...get().historyFilters, ...newFilters }
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ historyFilters: updatedFilters })
  },

  resetHistoryFilters: () => {
    set({ historyFilters: initialHistoryFilters })
  },

  // Common
  clearError: () => {
    set({ error: null })
  },
}))
