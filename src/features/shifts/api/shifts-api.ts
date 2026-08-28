/**
 * Shifts API Module
 * Endpoints for shifts management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Shift,
  ShiftsFilters,
  CreateShiftPayload,
  UpdateShiftPayload,
} from '../types/shifts.types'

export const shiftsApi = {
  /**
   * Get list of shifts with optional filters
   * GET /api/admin/shifts
   */
  getList: async (params?: ShiftsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Shift[]>>('/admin/shifts', {
      params,
    })
    return data
  },

  /**
   * Get single shift by ID
   * GET /api/admin/shifts/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Shift>>(`/admin/shifts/${id}`)
    return data
  },

  /**
   * Create new shift
   * POST /api/admin/shifts
   */
  create: async (payload: CreateShiftPayload) => {
    const { data } = await apiClient.post<ApiResponse<Shift>>('/admin/shifts', payload)
    return data
  },

  /**
   * Update existing shift
   * PUT /api/admin/shifts/:id
   */
  update: async (id: number, payload: UpdateShiftPayload) => {
    const { data } = await apiClient.put<ApiResponse<Shift>>(`/admin/shifts/${id}`, payload)
    return data
  },

  /**
   * Delete shift (soft delete)
   * DELETE /api/admin/shifts/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/shifts/${id}`)
  },

  /**
   * Bulk delete shifts (soft delete)
   * POST /api/admin/shifts/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/shifts/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/shifts/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/shifts/select-options',
      { params }
    )
    return data
  },
}
