/**
 * Client Type Definitions
 * API endpoint: /api/admin/clients
 */

export interface Client {
  id: number
  name: string
  address: string | null
  phone: string | null
  service_price: number | null
  expired_date: string | null
  status: number
  lat: string | null
  lng: string | null
  radius_meters: number | null
  client_type_id: number
  client_type_name: string | null
  created_at: string
  updated_at: string
}

export interface ClientSelectOption {
  id: number
  name: string
  text: string
}

export interface ClientsFilters {
  search?: string
  client_type_id?: number
  status?: number
  page?: number
  per_page?: number
}

export interface ClientsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ClientsPagination
  message?: string
}

export interface CreateClientPayload {
  client_type_id: number
  name: string
  address: string
  phone: string
  status: number
  lat?: string | null
  lng?: string | null
  radius_meters?: number | null
  service_price?: number | null
  expired_date?: string | null
}

export interface UpdateClientPayload extends CreateClientPayload {}
