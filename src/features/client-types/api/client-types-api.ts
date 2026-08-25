/**
 * Client Types API Module
 * Endpoints for client types management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  ClientType,
  ClientTypeSelectOption,
  ClientTypesFilters,
  CreateClientTypePayload,
  UpdateClientTypePayload,
} from '../types/client-types.types'

export const clientTypesApi = {
  /**
   * Get list of client types with optional filters
   * GET /api/admin/client-types
   */
  getList: async (params?: ClientTypesFilters) => {
    const { data } = await apiClient.get<ApiResponse<ClientType[]>>(
      '/admin/client-types',
      { params }
    )
    return data
  },

  /**
   * Get single client type by ID
   * GET /api/admin/client-types/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<ClientType>>(
      `/admin/client-types/${id}`
    )
    return data
  },

  /**
   * Get client types for select dropdown
   * GET /api/admin/client-types/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<ClientTypeSelectOption[]>>(
      '/admin/client-types/select-options',
      { params }
    )
    return data
  },

  /**
   * Create new client type
   * POST /api/admin/client-types
   */
  create: async (payload: CreateClientTypePayload) => {
    const { data } = await apiClient.post<ApiResponse<ClientType>>(
      '/admin/client-types',
      payload
    )
    return data
  },

  /**
   * Update existing client type
   * PUT /api/admin/client-types/:id
   */
  update: async (id: number, payload: UpdateClientTypePayload) => {
    const { data } = await apiClient.put<ApiResponse<ClientType>>(
      `/admin/client-types/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete client type (soft delete)
   * DELETE /api/admin/client-types/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/client-types/${id}`)
  },

  /**
   * Bulk delete client types (soft delete)
   * POST /api/admin/client-types/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(
      '/admin/client-types/bulk-delete',
      { ids }
    )
    return data
  },
}
