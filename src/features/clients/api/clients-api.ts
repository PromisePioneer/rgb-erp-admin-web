/**
 * Clients API Module
 * Endpoints for clients management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Client,
  ClientDetail,
  ClientsFilters,
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/clients.types'

export const clientsApi = {
  /**
   * Get list of clients with optional filters
   * GET /api/admin/clients
   */
  getList: async (params?: ClientsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Client[]>>('/admin/clients', {
      params,
    })
    return data
  },

  /**
   * Get single client by ID
   * GET /api/admin/clients/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<ClientDetail>>(`/admin/clients/${id}`)
    return data
  },

  /**
   * Create new client
   * POST /api/admin/clients
   */
  create: async (payload: CreateClientPayload) => {
    const { data } = await apiClient.post<ApiResponse<Client>>('/admin/clients', payload)
    return data
  },

  /**
   * Update existing client
   * PUT /api/admin/clients/:id
   */
  update: async (id: number, payload: UpdateClientPayload) => {
    const { data } = await apiClient.put<ApiResponse<Client>>(`/admin/clients/${id}`, payload)
    return data
  },

  /**
   * Delete client (soft delete)
   * DELETE /api/admin/clients/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/clients/${id}`)
  },

  /**
   * Bulk delete clients (soft delete)
   * POST /api/admin/clients/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/clients/bulk-delete',
      { ids }
    )
    return data
  },
}
