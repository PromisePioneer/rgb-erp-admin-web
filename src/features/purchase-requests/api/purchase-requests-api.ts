/**
 * Purchase Requests API Module
 * Endpoints for purchase requests management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  PurchaseRequest,
  PurchaseRequestFull,
  PurchaseRequestsFilters,
  CreatePurchaseRequestPayload,
  UpdatePurchaseRequestPayload,
  ProductSelectOption,
} from '../types/purchase-requests.types'

export const purchaseRequestsApi = {
  /**
   * Get list of purchase requests with optional filters
   * GET /api/admin/purchase-requests
   */
  getList: async (params?: PurchaseRequestsFilters) => {
    const { data } = await apiClient.get<ApiResponse<PurchaseRequest[]>>('/admin/purchase-requests', {
      params,
    })
    return data
  },

  /**
   * Get single purchase request by ID
   * GET /api/admin/purchase-requests/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<PurchaseRequestFull>>(`/admin/purchase-requests/${id}`)
    return data
  },

  /**
   * Create new purchase request
   * POST /api/admin/purchase-requests
   */
  create: async (payload: CreatePurchaseRequestPayload) => {
    const { data } = await apiClient.post<ApiResponse<PurchaseRequest>>('/admin/purchase-requests', payload)
    return data
  },

  /**
   * Update existing purchase request
   * PUT /api/admin/purchase-requests/:id
   */
  update: async (id: number, payload: UpdatePurchaseRequestPayload) => {
    const { data } = await apiClient.put<ApiResponse<PurchaseRequest>>(`/admin/purchase-requests/${id}`, payload)
    return data
  },

  /**
   * Delete purchase request (soft delete)
   * DELETE /api/admin/purchase-requests/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/purchase-requests/${id}`)
  },

  /**
   * Bulk delete purchase requests (soft delete)
   * POST /api/admin/purchase-requests/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/purchase-requests/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Submit purchase request for approval
   * POST /api/admin/purchase-requests/:id/submit
   */
  submitForApproval: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      `/admin/purchase-requests/${id}/submit`
    )
    return data
  },

  /**
   * Get select options for products dropdown
   * GET /api/admin/purchase-requests/products-select-options
   */
  getProductsSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<ProductSelectOption[]>>(
      '/admin/purchase-requests/products-select-options',
      { params }
    )
    return data
  },
}
