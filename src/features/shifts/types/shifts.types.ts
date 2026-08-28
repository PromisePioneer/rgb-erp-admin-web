/**
 * Shift Type Definitions
 * API endpoint: /api/admin/shifts
 */

export interface Shift {
  id: number
  name: string
  start_time: string | null
  end_time: string | null
  status: number
  created_at: string
  updated_at: string
}

export interface ShiftsFilters {
  search?: string
  status?: number
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
  start_time?: string | null
  end_time?: string | null
  status: number
}

export interface UpdateShiftPayload extends CreateShiftPayload {}
