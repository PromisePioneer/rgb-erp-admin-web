/**
 * Shift Type Definitions
 * API endpoint: /api/admin/shifts
 */

export interface Shift {
  id: number
  code: string | null
  name: string
  start_time: string | null
  end_time: string | null
  status: number
  area_id: number
  area_name: string | null
  client_id: number
  client_name: string | null
  created_at: string
  updated_at: string
}

export interface ShiftsFilters {
  search?: string
  status?: number
  area_id?: number
  client_id?: number
  page?: number
  per_page?: number
}

export interface ShiftsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ShiftsPagination
  message?: string
}

export interface CreateShiftPayload {
  name: string
  code?: string
  start_time?: string | null
  end_time?: string | null
  status: number
  client_id: number
  area_id: number
}

export interface UpdateShiftPayload extends CreateShiftPayload {}
