/**
 * Inventory Items API Module
 * Endpoints for inventory barcode tracking
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  InventoryItem,
  InventoryItemSummary,
  InventoryFilters,
  MoveItemPayload,
  ReturnItemPayload,
  UpdateStatusPayload,
} from '../types/inventory-items.types'

export const inventoryApi = {
  /**
   * Get list of inventory items
   * GET /api/admin/inventory-items
   */
  getList: async (params?: InventoryFilters) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItem[]>>(
      '/admin/inventory-items',
      { params }
    )
    return data
  },

  /**
   * Get single item by barcode
   * GET /api/admin/inventory-items/{barcode}
   */
  getByBarcode: async (barcode: string) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItem>>(
      `/admin/inventory-items/${encodeURIComponent(barcode)}`
    )
    return data
  },

  /**
   * Scan barcode - quick lookup
   * GET /api/admin/inventory-items/scan/{barcode}
   */
  scan: async (barcode: string) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItem>>(
      `/admin/inventory-items/scan/${encodeURIComponent(barcode)}`
    )
    return data
  },

  /**
   * Get summary
   * GET /api/admin/inventory-items/summary
   */
  getSummary: async (params?: { product_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItemSummary>>(
      '/admin/inventory-items/summary',
      { params }
    )
    return data
  },

  /**
   * Move item to location
   * POST /api/admin/inventory-items/move
   */
  move: async (payload: MoveItemPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/move',
      payload
    )
    return data
  },

  /**
   * Return item to warehouse
   * POST /api/admin/inventory-items/return
   */
  return: async (payload: ReturnItemPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/return',
      payload
    )
    return data
  },

  /**
   * Update item status
   * POST /api/admin/inventory-items/status
   */
  updateStatus: async (payload: UpdateStatusPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/status',
      payload
    )
    return data
  },
}
