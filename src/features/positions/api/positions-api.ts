/**
 * Positions API Module
 * Endpoints for positions management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Position,
  PositionsFilters,
  CreatePositionPayload,
  UpdatePositionPayload,
} from '../types/positions.types'

export const positionsApi = {
  /**
   * Get list of positions with optional filters
   * GET /api/admin/positions
   */
  getList: async (params?: PositionsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Position[]>>('/admin/positions', {
      params,
    })
    return data
  },

  /**
   * Get all positions without pagination (for dropdowns)
   * GET /api/admin/positions?per_page=all
   */
  getAll: async (params?: { parent_only?: boolean }) => {
    const { data } = await apiClient.get<ApiResponse<Position[]>>('/admin/positions', {
      params: { per_page: 'all', ...params },
    })
    return data
  },

  /**
   * Get single position by ID
   * GET /api/admin/positions/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Position>>(`/admin/positions/${id}`)
    return data
  },

  /**
   * Create new position
   * POST /api/admin/positions
   */
  create: async (payload: CreatePositionPayload) => {
    const { data } = await apiClient.post<ApiResponse<Position>>('/admin/positions', payload)
    return data
  },

  /**
   * Update existing position
   * PUT /api/admin/positions/:id
   */
  update: async (id: number, payload: UpdatePositionPayload) => {
    const { data } = await apiClient.put<ApiResponse<Position>>(`/admin/positions/${id}`, payload)
    return data
  },

  /**
   * Delete position (soft delete)
   * DELETE /api/admin/positions/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/positions/${id}`)
  },

  /**
   * Bulk delete positions (soft delete)
   * POST /api/admin/positions/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/positions/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/positions/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/positions/select-options',
      { params }
    )
    return data
  },
}
