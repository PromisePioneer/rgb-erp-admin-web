/**
 * Users API Module
 * Endpoints for users management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  CreateUserPayload,
  SelectOptionItem,
  UpdateUserPayload,
  User,
  UsersFilters,
} from '../types/users.types'

export const usersApi = {
  /**
   * Get list of users with optional filters
   * GET /api/admin/users
   */
  getList: async (params?: UsersFilters) => {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/admin/users', {
      params,
    })
    return data
  },

  /**
   * Get single user by ID
   * GET /api/admin/users/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`)
    return data
  },

  /**
   * Create new user
   * POST /api/admin/users
   */
  create: async (payload: CreateUserPayload) => {
    const { data } = await apiClient.post<ApiResponse<User>>(
      '/admin/users',
      payload
    )
    return data
  },

  /**
   * Update existing user
   * PUT /api/admin/users/:id
   */
  update: async (id: number, payload: UpdateUserPayload) => {
    const { data } = await apiClient.put<ApiResponse<User>>(
      `/admin/users/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete user (soft delete)
   * DELETE /api/admin/users/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/users/${id}`)
  },

  /**
   * Bulk delete users (soft delete)
   * POST /api/admin/users/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/users/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for roles dropdown
   * GET /api/admin/users/select-options?type=roles
   */
  getRolesSelectOptions: async (params?: {
    q?: string
    selected?: number
  }): Promise<SelectOptionItem[]> => {
    const { data } = await apiClient.get<ApiResponse<SelectOptionItem[]>>(
      '/admin/users/select-options',
      { params: { ...params, type: 'roles' } }
    )
    return data.data
  },

  /**
   * Get select options for departments dropdown
   * GET /api/admin/users/select-options?type=departments
   */
  getDepartmentsSelectOptions: async (params?: {
    q?: string
    selected?: number
  }): Promise<SelectOptionItem[]> => {
    const { data } = await apiClient.get<ApiResponse<SelectOptionItem[]>>(
      '/admin/users/select-options',
      { params: { ...params, type: 'departments' } }
    )
    return data.data
  },
}
