/**
 * Attendance Type Definitions
 * API endpoint: /api/admin/attendance
 */

export interface Attendance {
  id: number
  employee_id: number
  employee_name: string | null
  employee_code: string | null
  type: 'check_in' | 'check_out'
  recorded_at: string
  latitude: number | null
  longitude: number | null
  distance_meters: number | null
  accuracy_meters: number | null
  notes: string | null
  early_leave_notes: string | null
}

export interface AttendanceRecap {
  id: string
  employee_id: number
  employee_name: string
  employee_code: string
  date: string
  checkin: string | null
  checkout: string | null
  late: string | null
  early_leave: string | null
  early_leave_notes: string | null
  status: 'on_time' | 'late' | 'early_leave' | 'late_early'
  status_text: string
  status_class: string
  area_name: string | null
  pos_id: number | null
  pos_name: string | null
  pos_lat: number | null
  pos_lng: number | null
  client_name: string | null
}

export interface AttendanceStats {
  check_in_count: number
  check_out_count: number
  avg_distance: number
  total_records: number
}

export interface AttendancesFilters {
  month?: string
  employee_id?: number
  q?: string
  page?: number
  per_page?: number
}

export interface AttendancesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: AttendancesPagination & {
    stats?: AttendanceStats
    selected_month?: string
  }
  message?: string
}

export interface AttendanceExport {
  data: Array<{
    no: number
    employee_name: string
    employee_code: string
    date: string
    check_in: string
    check_out: string
    late: string
    early_leave: string
    early_leave_notes: string
    status: string
  }>
  month: string
  exported_at: string
}
