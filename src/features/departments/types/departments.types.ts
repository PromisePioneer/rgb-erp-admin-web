/**
 * Department Type Definitions
 * API endpoint: /api/admin/departments
 */

export interface Department {
  id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface DepartmentsFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface DepartmentsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: DepartmentsPagination
  message?: string
}

export interface CreateDepartmentPayload {
  name: string
  status: number
}

export interface UpdateDepartmentPayload extends CreateDepartmentPayload {}
