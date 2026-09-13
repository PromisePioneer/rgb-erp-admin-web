/**
 * Salary Component Type Definitions
 * API endpoint: /api/admin/salary-components
 */

// Client reference (simplified)
export interface SalaryComponentClient {
  id: number
  name: string
}

// Role reference (simplified)
export interface SalaryComponentRole {
  id: number
  name: string
}

export interface SalaryComponent {
  id: number
  client_id: number | null
  client: SalaryComponentClient | null
  role_id: number | null
  role: SalaryComponentRole | null
  name: string
  type: 'earning' | 'deduction'
  value: number | null
  status: number
  created_at: string
  updated_at: string
}

export interface SalaryComponentsFilters {
  search?: string
  type?: 'earning' | 'deduction'
  client_id?: number
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
  client_id: number
  role_id?: number | null
  name: string
  type: 'earning' | 'deduction'
  value?: number | null
  status: number
}

export interface UpdateSalaryComponentPayload extends CreateSalaryComponentPayload {}
