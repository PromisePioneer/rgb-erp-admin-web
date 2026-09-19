/**
 * UMK Type Definitions
 * Upah Minimum Kota / Regional Minimum Wage
 */

export interface UMK {
  id: number
  year: number
  province: string
  city: string
  value: number
  formatted_value: string
  created_at: string
  updated_at: string
}

export interface UMKFilters {
  year?: number
  search?: string
  page?: number
  per_page?: number
}

export interface UMKPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: UMKPagination
  message?: string
}

export interface CreateUMKPayload {
  year: number
  province: string
  city: string
  value: number
}

export interface UpdateUMKPayload extends CreateUMKPayload {}
