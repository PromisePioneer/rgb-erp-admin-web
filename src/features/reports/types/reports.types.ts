/**
 * Field Report Type Definitions
 * API endpoint: /api/admin/reports
 */

export interface FieldReport {
  id: number
  date: string
  time: string
  employee_id: number
  employee_name: string
  client_id: number
  client_name: string
  location: string
  description: string
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface ReportByArea {
  area: string
  client_name: string
  total_reports: number
  reports: FieldReport[]
}

export interface ReportsFilters {
  date_from?: string
  date_to?: string
  client_id?: number
  search?: string
  page?: number
  limit?: number
}

export interface ReportsPagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  data: T
  meta?: ReportsPagination
  message?: string
}

export interface Client {
  id: number
  name: string
}
