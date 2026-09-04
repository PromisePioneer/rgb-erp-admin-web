/**
 * Product Areas API Module
 * Endpoints for product areas (stok per area/client) management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  ProductArea,
  ProductAreaDetail,
  ProductAreasFilters,
  ProductAreaSelectOption,
  AreaOption,
  ClientOption,
  ProductAreaStockItem,
  CreateProductAreaPayload,
  UpdateProductAreaPayload,
} from '../types/product-areas.types'

export const productAreasApi = {
  /**
   * Get list of product areas with optional filters
   * GET /api/admin/product-areas
   */
  getList: async (params?: ProductAreasFilters) => {
    const { data } = await apiClient.get<ApiResponse<ProductArea[]>>('/admin/product-areas', {
      params,
    })
    return data
  },

  /**
   * Get single product area by ID
   * GET /api/admin/product-areas/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<ProductAreaDetail>>(`/admin/product-areas/${id}`)
    return data
  },

  /**
   * Create new product area
   * POST /api/admin/product-areas
   */
  create: async (payload: CreateProductAreaPayload) => {
    const { data } = await apiClient.post<ApiResponse<ProductArea>>('/admin/product-areas', payload)
    return data
  },

  /**
   * Update existing product area
   * PUT /api/admin/product-areas/:id
   */
  update: async (id: number, payload: UpdateProductAreaPayload) => {
    const { data } = await apiClient.put<ApiResponse<ProductArea>>(`/admin/product-areas/${id}`, payload)
    return data
  },

  /**
   * Delete product area
   * DELETE /api/admin/product-areas/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/product-areas/${id}`)
  },

  /**
   * Bulk delete product areas
   * POST /api/admin/product-areas/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/product-areas/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/product-areas/select-options
   */
  getSelectOptions: async (params?: {
    q?: string
    area_id?: number
    client_id?: number
    product_category_id?: number
    category_type?: number
    with_stock_only?: boolean
  }) => {
    const { data } = await apiClient.get<ApiResponse<ProductAreaSelectOption[]>>(
      '/admin/product-areas/select-options',
      { params }
    )
    return data
  },

  /**
   * Get areas options
   * GET /api/admin/product-areas/areas-options
   */
  getAreasOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<AreaOption[]>>(
      '/admin/product-areas/areas-options'
    )
    return data
  },

  /**
   * Get clients options
   * GET /api/admin/product-areas/clients-options
   */
  getClientsOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<ClientOption[]>>(
      '/admin/product-areas/clients-options'
    )
    return data
  },

  /**
   * Get stock by area (for mobile daily task assignment)
   * GET /api/admin/product-areas/area/{areaId}
   */
  getByArea: async (
    areaId: number,
    params?: {
      q?: string
      category_type?: number
    }
  ) => {
    const { data } = await apiClient.get<ApiResponse<ProductAreaStockItem[]>>(
      `/admin/product-areas/area/${areaId}`,
      { params }
    )
    return data
  },
}
