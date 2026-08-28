/**
 * Warehouses API Module
 * Endpoints for warehouses management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Warehouse,
  WarehousesFilters,
  CreateWarehousePayload,
  UpdateWarehousePayload,
} from '../types/warehouses.types'

export const warehousesApi = {
  /**
   * Get list of warehouses with optional filters
   * GET /api/admin/warehouses
   */
  getList: async (params?: WarehousesFilters) => {
    const { data } = await apiClient.get<ApiResponse<Warehouse[]>>('/admin/warehouses', {
      params,
    })
    return data
  },

  /**
   * Get single warehouse by ID
   * GET /api/admin/warehouses/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Warehouse>>(`/admin/warehouses/${id}`)
    return data
  },

  /**
   * Create new warehouse
   * POST /api/admin/warehouses
   */
  create: async (payload: CreateWarehousePayload) => {
    const { data } = await apiClient.post<ApiResponse<Warehouse>>('/admin/warehouses', payload)
    return data
  },

  /**
   * Update existing warehouse
   * PUT /api/admin/warehouses/:id
   */
  update: async (id: number, payload: UpdateWarehousePayload) => {
    const { data } = await apiClient.put<ApiResponse<Warehouse>>(`/admin/warehouses/${id}`, payload)
    return data
  },

  /**
   * Delete warehouse (soft delete)
   * DELETE /api/admin/warehouses/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/warehouses/${id}`)
  },

  /**
   * Bulk delete warehouses (soft delete)
   * POST /api/admin/warehouses/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/warehouses/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/warehouses/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/warehouses/select-options',
      { params }
    )
    return data
  },
}
