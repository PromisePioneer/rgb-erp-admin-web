/**
 * Pos Type Definitions
 * API endpoint: /api/admin/poss
 */

export interface Pos {
  id: number
  area_id: number
  area_name: string
  client_id: number
  client_name: string
  name: string
  description: string | null
  latitude: string | null
  longitude: string | null
  status: number
  created_at: string | null
  updated_at: string | null
}

export interface PosDetail {
  id: number
  area_id: number
  area_name: string
  client_id: number
  client_name: string
  name: string
  description: string | null
  latitude: string | null
  longitude: string | null
  status: number
}

export interface PossFilters {
  search?: string
  area_id?: number
  client_id?: number
  status?: string
  page?: number
  per_page?: number
}

export interface PossPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PossPagination
  message?: string
}

export interface CreatePosPayload {
  area_id: number
  name: string
  description?: string
  latitude?: string
  longitude?: string
  status: 'Aktif' | 'Tidak Aktif'
}

export interface UpdatePosPayload extends CreatePosPayload {}
