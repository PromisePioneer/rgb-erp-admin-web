/**
 * Product Category Type Definitions
 * API endpoint: /api/admin/product-categories
 */

export interface ProductCategory {
  id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface ProductCategoriesFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface ProductCategoriesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ProductCategoriesPagination
  message?: string
}

export interface CreateProductCategoryPayload {
  name: string
  status: number
}

export interface UpdateProductCategoryPayload extends CreateProductCategoryPayload {}
