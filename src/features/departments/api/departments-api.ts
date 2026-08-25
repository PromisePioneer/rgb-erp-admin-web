/**
 * Departments API Module
 * Endpoints for departments management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Department,
  DepartmentsFilters,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '../types/departments.types'

export const departmentsApi = {
  /**
   * Get list of departments with optional filters
   * GET /api/admin/departments
   */
  getList: async (params?: DepartmentsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Department[]>>(
      '/admin/departments',
      { params }
    )
    return data
  },

  /**
   * Get single department by ID
   * GET /api/admin/departments/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Department>>(
      `/admin/departments/${id}`
    )
    return data
  },

  /**
   * Create new department
   * POST /api/admin/departments
   */
  create: async (payload: CreateDepartmentPayload) => {
    const { data } = await apiClient.post<ApiResponse<Department>>(
      '/admin/departments',
      payload
    )
    return data
  },

  /**
   * Update existing department
   * PUT /api/admin/departments/:id
   */
  update: async (id: number, payload: UpdateDepartmentPayload) => {
    const { data } = await apiClient.put<ApiResponse<Department>>(
      `/admin/departments/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete department (soft delete)
   * DELETE /api/admin/departments/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/departments/${id}`)
  },

  /**
   * Bulk delete departments (soft delete)
   * POST /api/admin/departments/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(
      '/admin/departments/bulk-delete',
      { ids }
    )
    return data
  },
}
