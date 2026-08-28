/**
 * Position Type Definitions
 * API endpoint: /api/admin/positions
 */

export interface Position {
  id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface PositionsFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface PositionsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PositionsPagination
  message?: string
}

export interface CreatePositionPayload {
  name: string
  status: number
}

export interface UpdatePositionPayload extends CreatePositionPayload {}
