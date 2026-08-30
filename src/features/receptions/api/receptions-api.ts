/**
 * Receptions API Module
 * Endpoints for receptions management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Reception,
  ReceptionsFilters,
  CreateReceptionPayload,
  UpdateReceptionPayload,
} from '../types/receptions.types'

export const receptionsApi = {
  /**
   * Get list of receptions with optional filters
   * GET /api/admin/receptions
   */
  getList: async (params?: ReceptionsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Reception[]>>('/admin/receptions', {
      params,
    })
    return data
  },

  /**
   * Get select options for purchase orders
   * GET /api/admin/receptions/purchase-orders-select-options
   */
  getPurchaseOrdersSelectOptions: async (search?: string) => {
    const { data } = await apiClient.get<ApiResponse<Array<{
      id: number
      code: string
      date: string
      supplier_name: string | null
      total: number
    }>>>('/admin/receptions/purchase-orders-select-options', {
      params: search ? { q: search } : undefined,
    })
    return data
  },

  /**
   * Get single reception by ID
   * GET /api/admin/receptions/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Reception>>(`/admin/receptions/${id}`)
    return data
  },

  /**
   * Create new reception
   * POST /api/admin/receptions
   */
  create: async (payload: CreateReceptionPayload) => {
    const { data } = await apiClient.post<ApiResponse<Reception>>('/admin/receptions', payload)
    return data
  },

  /**
   * Update existing reception
   * PUT /api/admin/receptions/:id
   */
  update: async (id: number, payload: UpdateReceptionPayload) => {
    const { data } = await apiClient.put<ApiResponse<Reception>>(`/admin/receptions/${id}`, payload)
    return data
  },

  /**
   * Delete reception (soft delete)
   * DELETE /api/admin/receptions/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/receptions/${id}`)
  },

  /**
   * Bulk delete receptions (soft delete)
   * POST /api/admin/receptions/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/receptions/bulk-delete',
      { ids }
    )
    return data
  },
}
