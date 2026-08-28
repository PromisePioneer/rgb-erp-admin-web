/**
 * Banks API Module
 * Endpoints for banks management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Bank,
  BanksFilters,
  CreateBankPayload,
  UpdateBankPayload,
} from '../types/banks.types'

export const banksApi = {
  /**
   * Get list of banks with optional filters
   * GET /api/admin/banks
   */
  getList: async (params?: BanksFilters) => {
    const { data } = await apiClient.get<ApiResponse<Bank[]>>('/admin/banks', {
      params,
    })
    return data
  },

  /**
   * Get single bank by ID
   * GET /api/admin/banks/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Bank>>(`/admin/banks/${id}`)
    return data
  },

  /**
   * Create new bank
   * POST /api/admin/banks
   */
  create: async (payload: CreateBankPayload) => {
    const { data } = await apiClient.post<ApiResponse<Bank>>('/admin/banks', payload)
    return data
  },

  /**
   * Update existing bank
   * PUT /api/admin/banks/:id
   */
  update: async (id: number, payload: UpdateBankPayload) => {
    const { data } = await apiClient.put<ApiResponse<Bank>>(`/admin/banks/${id}`, payload)
    return data
  },

  /**
   * Delete bank (soft delete)
   * DELETE /api/admin/banks/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/banks/${id}`)
  },

  /**
   * Bulk delete banks (soft delete)
   * POST /api/admin/banks/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/banks/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/banks/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/banks/select-options',
      { params }
    )
    return data
  },
}
