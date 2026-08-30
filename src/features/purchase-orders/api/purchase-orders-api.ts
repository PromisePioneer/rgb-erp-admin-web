/**
 * Purchase Orders API Module
 * Endpoints for purchase orders management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  PurchaseOrder,
  PurchaseOrderFull,
  PurchaseOrdersFilters,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  PurchaseRequestSelectOption,
} from '../types/purchase-orders.types'

export const purchaseOrdersApi = {
  /**
   * Get list of purchase orders with optional filters
   * GET /api/admin/purchase-orders
   */
  getList: async (params?: PurchaseOrdersFilters) => {
    const { data } = await apiClient.get<ApiResponse<PurchaseOrder[]>>('/admin/purchase-orders', {
      params,
    })
    return data
  },

  /**
   * Get single purchase order by ID
   * GET /api/admin/purchase-orders/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<PurchaseOrderFull>>(`/admin/purchase-orders/${id}`)
    return data
  },

  /**
   * Create new purchase order
   * POST /api/admin/purchase-orders
   */
  create: async (payload: CreatePurchaseOrderPayload) => {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>('/admin/purchase-orders', payload)
    return data
  },

  /**
   * Update existing purchase order
   * PUT /api/admin/purchase-orders/:id
   */
  update: async (id: number, payload: UpdatePurchaseOrderPayload) => {
    const { data } = await apiClient.put<ApiResponse<PurchaseOrder>>(`/admin/purchase-orders/${id}`, payload)
    return data
  },

  /**
   * Delete purchase order (soft delete)
   * DELETE /api/admin/purchase-orders/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/purchase-orders/${id}`)
  },

  /**
   * Bulk delete purchase orders (soft delete)
   * POST /api/admin/purchase-orders/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/purchase-orders/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for purchase requests dropdown
   * GET /api/admin/purchase-orders/purchase-requests-select-options
   */
  getPurchaseRequestsSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<PurchaseRequestSelectOption[]>>(
      '/admin/purchase-orders/purchase-requests-select-options',
      { params }
    )
    return data
  },
}
