/**
 * Employee Placements API Module
 * Endpoints for employee placements management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  EmployeePlacement,
  EmployeePlacementDetail,
  EmployeePlacementsFilters,
  CreateEmployeePlacementPayload,
  UpdateEmployeePlacementPayload,
} from '../types/employee-placements.types'

export const employeePlacementsApi = {
  /**
   * Get list of employee placements with optional filters
   * GET /api/admin/employee-placements
   */
  getList: async (params?: EmployeePlacementsFilters) => {
    const { data } = await apiClient.get<ApiResponse<EmployeePlacement[]>>(
      '/admin/employee-placements',
      { params }
    )
    return data
  },

  /**
   * Get single employee placement by ID
   * GET /api/admin/employee-placements/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<EmployeePlacementDetail>>(
      `/admin/employee-placements/${id}`
    )
    return data
  },

  /**
   * Create new employee placement
   * POST /api/admin/employee-placements
   */
  create: async (payload: CreateEmployeePlacementPayload) => {
    const { data } = await apiClient.post<ApiResponse<EmployeePlacement>>(
      '/admin/employee-placements',
      payload
    )
    return data
  },

  /**
   * Update existing employee placement
   * PUT /api/admin/employee-placements/:id
   */
  update: async (id: number, payload: UpdateEmployeePlacementPayload) => {
    const { data } = await apiClient.put<ApiResponse<EmployeePlacement>>(
      `/admin/employee-placements/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete employee placement (soft delete)
   * DELETE /api/admin/employee-placements/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/employee-placements/${id}`)
  },

  /**
   * Bulk delete employee placements (soft delete)
   * POST /api/admin/employee-placements/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/employee-placements/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for employees dropdown
   * GET /api/admin/employee-placements/employees/select-options
   */
  getEmployeesSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<
      ApiResponse<{ id: number; name: string; text: string }[]>
    >('/admin/employee-placements/employees/select-options', { params })
    return data
  },

  /**
   * Get select options for clients dropdown
   * GET /api/admin/employee-placements/clients/select-options
   */
  getClientsSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<
      ApiResponse<{ id: number; name: string; text: string }[]>
    >('/admin/employee-placements/clients/select-options', { params })
    return data
  },
}
