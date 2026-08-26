/**
 * Schedules API Module
 * Endpoints for schedules management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Schedule,
  SchedulesFilters,
  SelectOption,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '../types/schedules.types'

export const schedulesApi = {
  /**
   * Get list of schedules with optional filters
   * GET /api/admin/schedules
   */
  getList: async (params?: SchedulesFilters) => {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>('/admin/schedules', {
      params,
    })
    return data
  },

  /**
   * Get single schedule by ID
   * GET /api/admin/schedules/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Schedule>>(`/admin/schedules/${id}`)
    return data
  },

  /**
   * Create new schedule
   * POST /api/admin/schedules
   */
  create: async (payload: CreateSchedulePayload) => {
    const { data } = await apiClient.post<ApiResponse<Schedule>>('/admin/schedules', payload)
    return data
  },

  /**
   * Update existing schedule
   * PUT /api/admin/schedules/:id
   */
  update: async (id: number, payload: UpdateSchedulePayload) => {
    const { data } = await apiClient.put<ApiResponse<Schedule>>(`/admin/schedules/${id}`, payload)
    return data
  },

  /**
   * Delete schedule
   * DELETE /api/admin/schedules/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/schedules/${id}`)
  },

  /**
   * Bulk delete schedules
   * POST /api/admin/schedules/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/schedules/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get employees select options
   * GET /api/admin/schedules/employees/select-options
   */
  getEmployeesSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/employees/select-options',
      { params }
    )
    return data
  },

  /**
   * Get areas select options (filtered by employee's client)
   * GET /api/admin/schedules/areas/select-options
   */
  getAreasSelectOptions: async (params?: { employee_id?: number; q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/areas/select-options',
      { params }
    )
    return data
  },

  /**
   * Get poss select options (filtered by area)
   * GET /api/admin/schedules/poss/select-options
   */
  getPossSelectOptions: async (params: { area_id: number; q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/poss/select-options',
      { params }
    )
    return data
  },

  /**
   * Get shifts select options
   * GET /api/admin/schedules/shifts/select-options
   */
  getShiftsSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/shifts/select-options',
      { params }
    )
    return data
  },
}
