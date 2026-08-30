/**
 * Area Type Definitions
 * API endpoint: /api/admin/areas
 */

export interface Area {
  id: number
  client_id: number
  client_name: string
  name: string
  latitude: string | null
  longitude: string | null
  description: string | null
  pos_count: number
  status: number
  created_at: string | null
  updated_at: string | null
  coordinator_id: number | null
  coordinator_name: string | null
}

export interface AreaDetail {
  id: number
  client_id: number
  client_name: string
  name: string
  latitude: string | null
  longitude: string | null
  description: string | null
  status: number
  coordinator_id: number | null
  coordinator_name: string | null
}

export interface AreasFilters {
  search?: string
  client_id?: number
  status?: string
  page?: number
  per_page?: number
}

export interface AreasPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: AreasPagination
  message?: string
}

export interface CreateAreaPayload {
  client_id: number
  name: string
  latitude?: string
  longitude?: string
  description?: string
  status: 'Aktif' | 'Tidak Aktif'
  coordinator_id?: number | null
}

export interface UpdateAreaPayload extends CreateAreaPayload {}

export interface CoordinatorOption {
  id: number
  name: string
  code: string
  position_name: string
  text: string
}
