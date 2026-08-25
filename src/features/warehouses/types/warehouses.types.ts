/**
 * Warehouse Type Definitions
 * API endpoint: /api/admin/warehouses
 */

export interface Warehouse {
  id: number
  company_id: number | null
  company_name: string | null
  name: string
  location: string | null
  status: number
  created_at: string
  updated_at: string
}

export interface WarehousesFilters {
  search?: string
  company_id?: number
  status?: number
  page?: number
  per_page?: number
}

export interface WarehousesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: WarehousesPagination
  message?: string
}

export interface CreateWarehousePayload {
  Name: string
  location?: string | null
  company_id?: number | null
  status: number
}

export interface UpdateWarehousePayload extends CreateWarehousePayload {}
