/**
 * Roles API Module
 * Endpoints for roles management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Role,
  RolesFilters,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/roles.types'
import type { RolePrivilegesResponse, UpdatePrivilegesPayload } from '../types/roles-privileges.types'

export const rolesApi = {
  /**
   * Get list of roles with optional filters
   * GET /api/admin/roles
   */
  getList: async (params?: RolesFilters) => {
    const { data } = await apiClient.get<ApiResponse<Role[]>>(
      '/admin/roles',
      { params }
    )
    return data
  },

  /**
   * Get all roles without pagination (for dropdowns)
   * GET /api/admin/roles?per_page=all
   */
  getAll: async () => {
    const { data } = await apiClient.get<ApiResponse<Role[]>>(
      '/admin/roles',
      { params: { per_page: 'all' } }
    )
    return data
  },

  /**
   * Get single role by ID
   * GET /api/admin/roles/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Role>>(
      `/admin/roles/${id}`
    )
    return data
  },

  /**
   * Create new role
   * POST /api/admin/roles
   */
  create: async (payload: CreateRolePayload) => {
    const { data } = await apiClient.post<ApiResponse<Role>>(
      '/admin/roles',
      payload
    )
    return data
  },

  /**
   * Update existing role
   * PUT /api/admin/roles/:id
   */
  update: async (id: number, payload: UpdateRolePayload) => {
    const { data } = await apiClient.put<ApiResponse<Role>>(
      `/admin/roles/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete role (soft delete)
   * DELETE /api/admin/roles/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/roles/${id}`)
  },

  /**
   * Bulk delete roles (soft delete)
   * POST /admin/roles/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(
      '/admin/roles/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get privileges for a role
   * GET /admin/roles/:id/privileges
   */
  getPrivileges: async (roleId: number) => {
    const { data } = await apiClient.get<{ success: boolean; data: RolePrivilegesResponse }>(
      `/admin/roles/${roleId}/privileges`
    )
    return data
  },

  /**
   * Update privileges for a role
   * PUT /admin/roles/:id/privileges
   */
  updatePrivileges: async (roleId: number, payload: UpdatePrivilegesPayload) => {
    const { data } = await apiClient.put<{ success: boolean; data: { message: string } }>(
      `/admin/roles/${roleId}/privileges`,
      payload
    )
    return data
  },
}
