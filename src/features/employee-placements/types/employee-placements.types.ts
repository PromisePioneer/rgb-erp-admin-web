/**
 * Employee Placement Type Definitions
 * API endpoint: /api/admin/employee-placements
 */

export interface EmployeePlacement {
  id: number
  employee_id: number
  employee_name: string
  client_id: number
  client_name: string
  position_name: string | null
  status: number
  created_at: string | null
  updated_at: string | null
}

export interface EmployeePlacementDetail {
  id: number
  employee_id: number
  employee_name: string
  client_id: number
  client_name: string
  position_name: string | null
  status: number
}

export interface EmployeePlacementsFilters {
  search?: string
  status?: string
  page?: number
  per_page?: number
}

export interface EmployeePlacementsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: EmployeePlacementsPagination
  message?: string
}

export interface CreateEmployeePlacementPayload {
  employee_id: number
  client_id: number
  status: number
}

export interface UpdateEmployeePlacementPayload extends CreateEmployeePlacementPayload {}
