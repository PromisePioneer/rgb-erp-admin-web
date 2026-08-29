/**
 * Checkpoint Type Definitions
 * API endpoint: /api/admin/checkpoints
 */

export interface Checkpoint {
  id: number
  project_id: number
  project_name: string | null
  code: string
  name: string
  sequence_order: number
  lat: number
  lng: number
  radius_meters: number | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at?: string
}

export interface CheckpointDetail extends Checkpoint {
  updated_at: string
}

export interface CheckpointsFilters {
  search?: string
  project_id?: number
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
  project_id: number
  name: string
  lat: number
  lng: number
  radius_meters?: number
  status?: 'active' | 'inactive'
}

export interface UpdateCheckpointPayload {
  name?: string
  lat?: number
  lng?: number
  radius_meters?: number
  status?: 'active' | 'inactive'
}

// Select options
export interface ProjectOption {
  id: number
  name: string
  code?: string
}
