/**
 * Stock Opname API Module
 * Endpoints for stock opname management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  StockPosition,
  StockOpnameHistory,
  StockOpnameResult,
  StockOpnameFilters,
} from '../types/stock-opnames.types'

export const stockOpnamesApi = {
  /**
   * Get current stock positions for a warehouse
   * GET /api/admin/stock-opname/positions
   */
  getStockPositions: async (warehouseId: number) => {
    const { data } = await apiClient.get<ApiResponse<{
      warehouse_id: number
      warehouse_name: string
      positions: StockPosition[]
    }>>('/admin/stock-opname/positions', {
      params: { warehouse_id: warehouseId },
    })
    return data
  },

  /**
   * Submit stock opname results
   * POST /api/admin/stock-opname/submit
   */
  submit: async (payload: {
    warehouse_id: number
    opname_date: string
    items: Array<{ product_id: number; actual_qty: number }>
  }) => {
    const { data } = await apiClient.post<ApiResponse<StockOpnameResult>>(
      '/admin/stock-opname/submit',
      payload
    )
    return data
  },

  /**
   * Get stock opname history
   * GET /api/admin/stock-opname/history
   */
  getHistory: async (params?: StockOpnameFilters) => {
    const { data } = await apiClient.get<ApiResponse<StockOpnameHistory[]>>(
      '/admin/stock-opname/history',
      { params }
    )
    return data
  },
}
