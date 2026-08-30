/**
 * Products API Module
 * Endpoints for products management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Product,
  ProductsFilters,
  CreateProductPayload,
  UpdateProductPayload,
  ProductSelectOption,
} from '../types/products.types'

export const productsApi = {
  /**
   * Get list of products with optional filters
   * GET /api/admin/products
   */
  getList: async (params?: ProductsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Product[]>>('/admin/products', {
      params,
    })
    return data
  },

  /**
   * Get single product by ID
   * GET /api/admin/products/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Product>>(`/admin/products/${id}`)
    return data
  },

  /**
   * Create new product
   * POST /api/admin/products
   */
  create: async (payload: CreateProductPayload) => {
    const { data } = await apiClient.post<ApiResponse<Product>>('/admin/products', payload)
    return data
  },

  /**
   * Update existing product
   * PUT /api/admin/products/:id
   */
  update: async (id: number, payload: UpdateProductPayload) => {
    const { data } = await apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, payload)
    return data
  },

  /**
   * Delete product (soft delete)
   * DELETE /api/admin/products/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/products/${id}`)
  },

  /**
   * Bulk delete products (soft delete)
   * POST /api/admin/products/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/products/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/products/select-options
   */
  getSelectOptions: async (params?: { q?: string; category_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<ProductSelectOption[]>>(
      '/admin/products/select-options',
      { params }
    )
    return data
  },
}
