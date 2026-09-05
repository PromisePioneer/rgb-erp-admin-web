/**
 * Panic Alert Type Definitions
 * API endpoint: /api/admin/panic-alerts
 */

export interface PanicAlert {
  id: number
  employee_id: number
  employee_name: string
  employee_phone: string | null
  client_id: number | null
  client_name: string | null
  area_id: number | null
  area_name: string | null
  pos_id: number | null
  pos_name: string | null
  latitude: string | null
  longitude: string | null
  accuracy: number | null
  location_name: string | null
  created_at: string
}

export interface PanicAlertDetail extends PanicAlert {
  employee: {
    id: number
    name: string
    phone: string | null
    email: string | null
  }
  client: {
    id: number
    name: string
  } | null
  area: {
    id: number
    name: string
  } | null
  pos: {
    id: number
    name: string
  } | null
}

export interface PanicAlertsFilters {
  search?: string
  page?: number
  per_page?: number
}

export interface PanicAlertsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PanicAlertsPagination
  message?: string
}
