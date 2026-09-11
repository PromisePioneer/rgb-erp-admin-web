/**
 * Products API Module
 * Endpoints for products management
 */
import { apiClient } from '@/lib/api-client'
import { fileToFormData } from '@/utils/download-blob'
import type {
  ApiResponse,
  Product,
  ProductsFilters,
  CreateProductPayload,
  UpdateProductPayload,
  ProductSelectOption,
} from '../types/products.types'

// Stock detail per warehouse
export interface StockDetail {
  warehouse_id: number
  warehouse_name: string
  barcode: string
  stock: number
  base_price: number
}

export interface ImportStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  percent: number
  message: string
  imported: number
  skipped: number
  errors: number
  error_messages: string[]
  updated_at: string
}

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
   * Get stock details for a product by warehouse
   * GET /api/admin/products/:id/stock
   */
  getStock: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<StockDetail[]>>(
      `/admin/products/${id}/stock`
    )
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
  getSelectOptions: async (params?: { q?: string; category_id?: number; warehouse_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<ProductSelectOption[]>>(
      '/admin/products/select-options',
      { params }
    )
    return data
  },

  /**
   * Download import template
   * GET /api/admin/products/template
   */
  getTemplateUrl: (): string => {
    return '/api/admin/products/template'
  },

  /**
   * Import products from Excel file (queued)
   * POST /api/admin/products/import
   */
  importProducts: async (file: File): Promise<ApiResponse<{ job_id: string; message: string }>> => {
    const formData = fileToFormData(file)

    const { data } = await apiClient.post<ApiResponse<{ job_id: string; message: string }>>(
      '/admin/products/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return data
  },

  /**
   * Get import job status
   * GET /api/admin/products/import/status/{jobId}
   */
  getImportStatus: async (jobId: string): Promise<ApiResponse<ImportStatus>> => {
    const { data } = await apiClient.get<ApiResponse<ImportStatus>>(
      `/admin/products/import/status/${jobId}`
    )
    return data
  },

  /**
   * Clear import job status
   * DELETE /api/admin/products/import/status/{jobId}
   */
  clearImportStatus: async (jobId: string): Promise<ApiResponse<{ message: string }>> => {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/products/import/status/${jobId}`
    )
    return data
  },
}
