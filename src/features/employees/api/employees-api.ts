/**
 * Employees API Module
 * Endpoints for employees management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Employee,
  EmployeeDetail,
  EmployeesFilters,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  NextCodeResponse,
} from '../types/employees.types'

export const employeesApi = {
  /**
   * Get list of employees with optional filters
   * GET /api/admin/employees
   */
  getList: async (params?: EmployeesFilters) => {
    const { data } = await apiClient.get<ApiResponse<Employee[]>>('/admin/employees', {
      params,
    })
    return data
  },

  /**
   * Get single employee by ID with all nested data
   * GET /api/admin/employees/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<EmployeeDetail>>(`/admin/employees/${id}`)
    return data
  },

  /**
   * Create new employee
   * POST /api/admin/employees
   */
  create: async (payload: CreateEmployeePayload) => {
    const { data } = await apiClient.post<ApiResponse<Employee>>('/admin/employees', payload)
    return data
  },

  /**
   * Update existing employee
   * PUT /api/admin/employees/:id
   */
  update: async (id: number, payload: UpdateEmployeePayload) => {
    const { data } = await apiClient.put<ApiResponse<Employee>>(`/admin/employees/${id}`, payload)
    return data
  },

  /**
   * Delete employee (soft delete)
   * DELETE /api/admin/employees/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/employees/${id}`)
  },

  /**
   * Bulk delete employees (soft delete)
   * POST /api/admin/employees/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/employees/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/employees/select-options
   */
  getSelectOptions: async (params?: { q?: string; company_id?: number; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/employees/select-options',
      { params }
    )
    return data
  },

  /**
   * Get next available employee code for a province
   * GET /api/admin/employees/next-code?province_id=xxx
   */
  getNextCode: async (provinceId: number) => {
    const { data } = await apiClient.get<NextCodeResponse>('/admin/employees/next-code', {
      params: { province_id: provinceId },
    })
    return data
  },
}
