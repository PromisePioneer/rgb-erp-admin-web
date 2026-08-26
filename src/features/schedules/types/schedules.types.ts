/**
 * Schedule Type Definitions
 * API endpoint: /api/admin/schedules
 */

export interface Schedule {
  id: number
  employee_id: number
  employee_name: string | null
  employee_code: string | null
  date: string
  shift_id: number | null
  shift_name: string | null
  shift_start: string | null
  shift_end: string | null
  area_id: number | null
  area_name: string | null
  pos_id: number | null
  pos_name: string | null
  created_at: string
}

export interface SchedulesFilters {
  employee_id?: number
  month?: string
  search?: string
  page?: number
  per_page?: number
}

export interface SchedulesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: SchedulesPagination
  message?: string
}

export interface CreateSchedulePayload {
  employee_id: number
  date: string
  shift_id?: number
  area_id?: number
  pos_id?: number
}

export interface UpdateSchedulePayload {
  employee_id?: number
  date?: string
  shift_id?: number
  area_id?: number
  pos_id?: number
}

export interface SelectOption {
  id: number
  name: string
  code?: string
  text: string
  client_id?: number
  latitude?: number
  longitude?: number
  start_time?: string
  end_time?: string
}
