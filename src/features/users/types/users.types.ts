/**
 * User Type Definitions
 * API endpoint: /api/admin/users
 */

export interface User {
  id: number
  name: string
  email: string
  status: number
  role_id: number
  role_name: string | null
  department_id: number
  department_name: string | null
  company_id: number | null
  created_at: string
  updated_at: string
}

export interface UsersFilters {
  search?: string
  role_id?: number
  department_id?: number
  page?: number
  per_page?: number
}

export interface UsersPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: UsersPagination
  message?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role_id: number
  department_id: number
  company_id?: number | null
  status: number
}

export interface UpdateUserPayload {
  name: string
  email: string
  password?: string
  role_id: number
  department_id: number
  company_id?: number | null
  status: number
}

export interface SelectOptionItem {
  id: number
  name: string
  text: string
}
