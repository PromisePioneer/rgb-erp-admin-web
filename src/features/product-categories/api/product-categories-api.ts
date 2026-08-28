/**
 * Product Categories API Module
 * Endpoints for product categories management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  ProductCategory,
  ProductCategoriesFilters,
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
} from '../types/product-categories.types'

export const productCategoriesApi = {
  /**
   * Get list of product categories with optional filters
   * GET /api/admin/product-categories
   */
  getList: async (params?: ProductCategoriesFilters) => {
    const { data } = await apiClient.get<ApiResponse<ProductCategory[]>>('/admin/product-categories', {
      params,
    })
    return data
  },

  /**
   * Get single product category by ID
   * GET /api/admin/product-categories/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<ProductCategory>>(`/admin/product-categories/${id}`)
    return data
  },

  /**
   * Create new product category
   * POST /api/admin/product-categories
   */
  create: async (payload: CreateProductCategoryPayload) => {
    const { data } = await apiClient.post<ApiResponse<ProductCategory>>('/admin/product-categories', payload)
    return data
  },

  /**
   * Update existing product category
   * PUT /api/admin/product-categories/:id
   */
  update: async (id: number, payload: UpdateProductCategoryPayload) => {
    const { data } = await apiClient.put<ApiResponse<ProductCategory>>(`/admin/product-categories/${id}`, payload)
    return data
  },

  /**
   * Delete product category (soft delete)
   * DELETE /api/admin/product-categories/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/product-categories/${id}`)
  },

  /**
   * Bulk delete product categories (soft delete)
   * POST /api/admin/product-categories/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/product-categories/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/product-categories/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/product-categories/select-options',
      { params }
    )
    return data
  },
}
