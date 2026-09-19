/**
 * Product Type Definitions
 * API endpoint: /api/admin/products
 */

export interface Product {
  id: number
  name: string
  description: string | null
  category_id: number
  category_name: string | null
  status: number
  created_at: string
  updated_at: string
}

export interface ProductDetail extends Product {
  // Extended fields if needed
}

export interface ProductsFilters {
  search?: string
  category_id?: number
  status?: number
  page?: number
  per_page?: number
}

export interface ProductsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ProductsPagination
  message?: string
}

// Form payloads
export interface CreateProductPayload {
  product_category_id: number
  name: string
  description?: string
  status: number
}

export interface UpdateProductPayload {
  product_category_id?: number
  name?: string
  description?: string
  status?: number
}

// Select options response
export interface ProductSelectOption {
  id: number
  name: string
}
