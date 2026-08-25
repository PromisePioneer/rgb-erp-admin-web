/**
 * Poss API Module
 * Endpoints for poss management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Pos,
  PosDetail,
  PossFilters,
  CreatePosPayload,
  UpdatePosPayload,
} from '../types/poss.types'

export const possApi = {
  /**
   * Get list of poss with optional filters
   * GET /api/admin/poss
   */
  getList: async (params?: PossFilters) => {
    const { data } = await apiClient.get<ApiResponse<Pos[]>>('/admin/poss', { params })
    return data
  },

  /**
   * Get single pos by ID
   * GET /api/admin/poss/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<PosDetail>>(`/admin/poss/${id}`)
    return data
  },

  /**
   * Create new pos
   * POST /api/admin/poss
   */
  create: async (payload: CreatePosPayload) => {
    const { data } = await apiClient.post<ApiResponse<Pos>>('/admin/poss', payload)
    return data
  },

  /**
   * Update existing pos
   * PUT /api/admin/poss/:id
   */
  update: async (id: number, payload: UpdatePosPayload) => {
    const { data } = await apiClient.put<ApiResponse<Pos>>(`/admin/poss/${id}`, payload)
    return data
  },

  /**
   * Delete pos (soft delete)
   * DELETE /api/admin/poss/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/poss/${id}`)
  },

  /**
   * Bulk delete poss (soft delete)
   * POST /api/admin/poss/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/poss/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for poss dropdown
   * GET /api/admin/poss/select-options
   */
  getSelectOptions: async (params?: { area_id?: number; q?: string; selected?: number }) => {
    const { data } = await apiClient.get<
      ApiResponse<{ id: number; name: string; area_name: string; text: string }[]>
    >('/admin/poss/select-options', { params })
    return data
  },
}
