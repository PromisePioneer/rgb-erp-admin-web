/**
 * Areas API Module
 * Endpoints for areas management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Area,
  AreaDetail,
  AreasFilters,
  CreateAreaPayload,
  CoordinatorOption,
  UpdateAreaPayload,
} from '../types/areas.types'

export const areasApi = {
  /**
   * Get list of areas with optional filters
   * GET /api/admin/areas
   */
  getList: async (params?: AreasFilters) => {
    const { data } = await apiClient.get<ApiResponse<Area[]>>('/admin/areas', { params })
    return data
  },

  /**
   * Get single area by ID
   * GET /api/admin/areas/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<AreaDetail>>(`/admin/areas/${id}`)
    return data
  },

  /**
   * Create new area
   * POST /api/admin/areas
   */
  create: async (payload: CreateAreaPayload) => {
    const { data } = await apiClient.post<ApiResponse<Area>>('/admin/areas', {
      ...payload,
      status: payload.status === 'Aktif' ? 1 : 0,
    })
    return data
  },

  /**
   * Update existing area
   * PUT /api/admin/areas/:id
   */
  update: async (id: number, payload: UpdateAreaPayload) => {
    const { data } = await apiClient.put<ApiResponse<Area>>(`/admin/areas/${id}`, {
      ...payload,
      status: payload.status === 'Aktif' ? 1 : 0,
    })
    return data
  },

  /**
   * Delete area (soft delete)
   * DELETE /api/admin/areas/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/areas/${id}`)
  },

  /**
   * Bulk delete areas (soft delete)
   * POST /api/admin/areas/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/areas/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for areas dropdown
   * GET /api/admin/areas/select-options
   */
  getSelectOptions: async (params?: { client_id?: number; q?: string; selected?: number }) => {
    const { data } = await apiClient.get<
      ApiResponse<{ id: number; name: string; client_name: string; text: string }[]>
    >('/admin/areas/select-options', { params })
    return data
  },

  /**
   * Get coordinator options for area assignment
   * Returns employees with Team Leader or Danru positions
   * GET /api/admin/areas/coordinator-options
   */
  getCoordinatorOptions: async (params?: { area_id?: number; q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<CoordinatorOption[]>>(
      '/admin/areas/coordinator-options',
      { params }
    )
    return data
  },
}
