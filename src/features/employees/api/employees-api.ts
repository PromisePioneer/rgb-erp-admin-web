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
  EmployeeCodeResponse,
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
    // Use FormData for file uploads
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, String(item)))
        } else if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })

    const { data } = await apiClient.post<ApiResponse<Employee>>('/admin/employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  /**
   * Update existing employee
   * POST /api/admin/employees/:id with _method=PUT for Laravel FormData
   */
  update: async (id: number, payload: UpdateEmployeePayload) => {
    // Use FormData for file uploads
    const formData = new FormData()
    // Laravel method spoofing
    formData.append('_method', 'PUT')

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, String(item)))
        } else if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })

    const { data } = await apiClient.post<ApiResponse<Employee>>(`/admin/employees/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
   * Get select options for clients dropdown
   * GET /api/admin/employees/clients/select-options
   */
  getClientsSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/employees/clients/select-options',
      { params }
    )
    return data
  },

  /**
   * Generate employee code for a province, company, and year
   * GET /api/admin/employees/generate-code?province_id=xxx&company_id=yyy&join_year=2023
   *
   * Format: {COMPANY}-86.{PROVINCE_CODE}.{YEAR}.{SEQUENCE}
   * - RGB company uses latin_code (BPS code)
   * - RBM company uses romawi_code
   */
  generateCode: async (provinceId: number, companyId?: number, joinYear?: number) => {
    const { data } = await apiClient.get<EmployeeCodeResponse>('/admin/employees/generate-code', {
      params: {
        province_id: provinceId,
        ...(companyId && { company_id: companyId }),
        ...(joinYear && { join_year: joinYear }),
      },
    })
    return data
  },
}
