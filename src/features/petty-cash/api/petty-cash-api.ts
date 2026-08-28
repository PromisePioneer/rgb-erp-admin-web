/**
 * Petty Cash API Module
 * Endpoints for petty cash management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  PettyCash,
  PettyCashFilters,
  CreatePettyCashPayload,
  UpdatePettyCashPayload,
} from '../types/petty-cash.types'

export const pettyCashApi = {
  /**
   * Get list of petty cash records with optional filters
   * GET /api/admin/petty-cash
   */
  getList: async (params?: PettyCashFilters) => {
    const { data } = await apiClient.get<ApiResponse<PettyCash[]>>('/admin/petty-cash', {
      params,
    })
    return data
  },

  /**
   * Get single petty cash record by ID
   * GET /api/admin/petty-cash/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<PettyCash>>(`/admin/petty-cash/${id}`)
    return data
  },

  /**
   * Create new petty cash record
   * POST /api/admin/petty-cash
   */
  create: async (payload: CreatePettyCashPayload) => {
    const { data } = await apiClient.post<ApiResponse<PettyCash>>('/admin/petty-cash', payload)
    return data
  },

  /**
   * Update existing petty cash record
   * PUT /api/admin/petty-cash/:id
   */
  update: async (id: number, payload: UpdatePettyCashPayload) => {
    const { data } = await apiClient.put<ApiResponse<PettyCash>>(`/admin/petty-cash/${id}`, payload)
    return data
  },

  /**
   * Delete petty cash record
   * DELETE /api/admin/petty-cash/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/petty-cash/${id}`)
  },

  /**
   * Bulk delete petty cash records
   * POST /api/admin/petty-cash/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/petty-cash/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for companies dropdown
   * GET /api/admin/petty-cash/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/petty-cash/select-options',
      { params }
    )
    return data
  },
}
