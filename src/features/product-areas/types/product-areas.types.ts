/**
 * Product Area Type Definitions
 * API endpoint: /api/admin/product-areas
 * Stok per Area/Client
 */

export interface ProductArea {
  id: number
  product_id: number
  product_name: string | null
  area_id: number | null
  area_name: string | null
  client_id: number | null
  client_name: string | null
  stock: number
  base_price: number
  condition?: string | null
  condition_label?: string
  condition_color?: string
  status: number
  created_at: string
  updated_at: string
}

export interface ProductAreaDetail extends ProductArea {
  product?: {
    id: number
    name: string
    category_id: number
    category_name: string
  }
  area?: {
    id: number
    name: string
  }
  client?: {
    id: number
    name: string
  }
}

export interface ProductAreasFilters {
  search?: string
  area_id?: number
  client_id?: number
  product_id?: number
  product_category_id?: number
  status?: number
  page?: number
  per_page?: number
}

export interface ProductAreasPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  page?: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ProductAreasPagination
  message?: string
}

// Select options response
export interface ProductAreaSelectOption {
  id: number
  product_id: number
  product_name: string
  area_id: number | null
  area_name: string | null
  client_id: number | null
  client_name: string | null
  stock: number
  base_price: number
}

export interface AreaOption {
  id: number
  name: string
  client_id: number | null
  client_name: string | null
}

export interface ClientOption {
  id: number
  name: string
}

// Stock by area (for mobile daily task)
export interface ProductAreaStockItem {
  id: number
  product_id: number
  product_name: string
  category_id: number | null
  category_name: string | null
  stock: number
  base_price: number
}

// Form payloads
export interface CreateProductAreaPayload {
  product_id: number
  area_id?: number
  client_id?: number
  stock?: number
  base_price?: number
  status?: number
}

export interface UpdateProductAreaPayload {
  product_id?: number
  area_id?: number
  client_id?: number
  stock?: number
  base_price?: number
  status?: number
}
