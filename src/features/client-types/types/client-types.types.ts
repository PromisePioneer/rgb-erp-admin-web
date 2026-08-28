/**
 * Client Type Type Definitions
 * API endpoint: /api/admin/client-types
 */

export interface ClientType {
  id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface ClientTypeSelectOption {
  id: number
  name: string
  text: string
}

export interface ClientTypesFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface ClientTypesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ClientTypesPagination
  message?: string
}

export interface CreateClientTypePayload {
  name: string
  status: number
}

export interface UpdateClientTypePayload extends CreateClientTypePayload {}
