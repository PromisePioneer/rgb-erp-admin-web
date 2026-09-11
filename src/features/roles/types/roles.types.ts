/**
 * Role Type Definitions
 * API endpoint: /api/admin/roles
 */

export interface RoleOption {
  id: number
  name: string
  text: string
}

export interface Role {
  id: number
  name: string
  status: number
  parent_role_id: number | null
  parent_role_name: string | null
  created_at: string
  updated_at: string
}

export interface RolesFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface RolesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: RolesPagination
  message?: string
}

export interface CreateRolePayload {
  name: string
  status: number
  parent_role_id?: number | null
}

export interface UpdateRolePayload extends CreateRolePayload {}
