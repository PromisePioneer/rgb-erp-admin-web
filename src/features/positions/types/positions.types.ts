/**
 * Position Type Definitions
 * API endpoint: /api/admin/positions
 */

export interface Position {
  id: number
  name: string
  company_id: number | null  // null = universal position
  status: number
  parent_position_id: number | null
  parent_position_name: string | null
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
  parent_position_id?: number | null
}

export interface UpdatePositionPayload extends CreatePositionPayload {}
