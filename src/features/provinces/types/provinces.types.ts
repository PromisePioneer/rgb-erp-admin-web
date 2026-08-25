/**
 * Province Type Definitions
 */

export interface Province {
  id: number
  name: string
  latin_code: string | null
  romawi_code: string | null
  created_at: string
  updated_at: string
}

export interface ProvincesFilters {
  search?: string
  page?: number
  per_page?: number
}

export interface ProvincesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ProvincesPagination
  message?: string
}

export interface CreateProvincePayload {
  name: string
  latin_code?: string
  romawi_code?: string
}

export interface UpdateProvincePayload extends CreateProvincePayload {}
