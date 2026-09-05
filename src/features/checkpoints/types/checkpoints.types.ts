/**
 * Checkpoint Type Definitions
 * API endpoint: /api/admin/checkpoints
 */

export interface Checkpoint {
  id: number
  area_id: number
  area_name: string | null
  code: string
  name: string
  sequence_order: number
  lat: number
  lng: number
  radius_meters: number | null
  status: 'active' | 'inactive'
  has_secret_key?: boolean
  secret_key?: string | null
  created_at: string
  updated_at?: string
}

export interface CheckpointDetail extends Checkpoint {
  updated_at: string
}

export interface CheckpointsFilters {
  search?: string
  area_id?: number
  status?: 'active' | 'inactive'
  page?: number
  per_page?: number
}

export interface CheckpointsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: CheckpointsPagination
  message?: string
}

// Form payloads
export interface CreateCheckpointPayload {
  area_id: number
  name: string
  lat: number
  lng: number
  radius_meters?: number
  status?: 'active' | 'inactive'
  generate_secret?: boolean
}

export interface UpdateCheckpointPayload {
  name?: string
  lat?: number
  lng?: number
  radius_meters?: number
  status?: 'active' | 'inactive'
  regenerate_secret?: boolean
}

// Select options
export interface AreaOption {
  id: number
  name: string
}
