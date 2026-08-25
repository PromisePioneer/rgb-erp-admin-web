/**
 * Salary Components API Module
 * Endpoints for salary components management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  SalaryComponent,
  SalaryComponentsFilters,
  CreateSalaryComponentPayload,
  UpdateSalaryComponentPayload,
} from '../types/salary-components.types'

export const salaryComponentsApi = {
  /**
   * Get list of salary components with optional filters
   * GET /api/admin/salary-components
   */
  getList: async (params?: SalaryComponentsFilters) => {
    const { data } = await apiClient.get<ApiResponse<SalaryComponent[]>>('/admin/salary-components', {
      params,
    })
    return data
  },

  /**
   * Get single salary component by ID
   * GET /api/admin/salary-components/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<SalaryComponent>>(`/admin/salary-components/${id}`)
    return data
  },

  /**
   * Create new salary component
   * POST /api/admin/salary-components
   */
  create: async (payload: CreateSalaryComponentPayload) => {
    const { data } = await apiClient.post<ApiResponse<SalaryComponent>>('/admin/salary-components', payload)
    return data
  },

  /**
   * Update existing salary component
   * PUT /api/admin/salary-components/:id
   */
  update: async (id: number, payload: UpdateSalaryComponentPayload) => {
    const { data } = await apiClient.put<ApiResponse<SalaryComponent>>(`/admin/salary-components/${id}`, payload)
    return data
  },

  /**
   * Delete salary component (soft delete)
   * DELETE /api/admin/salary-components/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/salary-components/${id}`)
  },

  /**
   * Bulk delete salary components (soft delete)
   * POST /api/admin/salary-components/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/salary-components/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/salary-components/select-options
   */
  getSelectOptions: async (params?: { q?: string; type?: 'earning' | 'deduction'; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/salary-components/select-options',
      { params }
    )
    return data
  },
}
