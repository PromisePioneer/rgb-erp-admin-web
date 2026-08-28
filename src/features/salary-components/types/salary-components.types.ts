/**
 * Salary Component Type Definitions
 * API endpoint: /api/admin/salary-components
 */

export interface SalaryComponent {
  id: number
  name: string
  type: 'earning' | 'deduction'
  value: number
  status: number
  created_at: string
  updated_at: string
}

export interface SalaryComponentsFilters {
  search?: string
  type?: 'earning' | 'deduction'
  status?: number
  page?: number
  per_page?: number
}

export interface SalaryComponentsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: SalaryComponentsPagination
  message?: string
}

export interface CreateSalaryComponentPayload {
  name: string
  type: 'earning' | 'deduction'
  value: number
  status: number
}

export interface UpdateSalaryComponentPayload extends CreateSalaryComponentPayload {}
