/**
 * Client Type Definitions
 * API endpoint: /api/admin/clients
 */

export interface Client {
  id: number
  code: string | null
  name: string
  address: string | null
  phone: string | null
  email: string | null
  start_date: string | null
  end_date: string | null
  total_fee: number | null
  discount: number | null
  service_price: number | null
  status: number
  client_type_id: number
  client_type_name: string | null
  area_count: number
  created_at: string
  updated_at: string
}

export interface ClientDetail extends Client {
  areas: { id: number; name: string }[]
}

export interface ClientsFilters {
  search?: string
  client_type_id?: number
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

// Form payloads
export interface CreateClientPayload {
  client_type_id: number
  name: string
  address?: string
  phone?: string
  email?: string
  password?: string
  code?: string
  start_date?: string
  end_date?: string
  total_fee?: number
  discount?: number
  service_price?: number
  status?: number
  // Nested creation (hierarchical: areas contain poss)
  areas?: CreateAreaNested[]
}

export interface UpdateClientPayload {
  client_type_id?: number
  name?: string
  address?: string
  phone?: string
  email?: string
  password?: string
  code?: string
  start_date?: string
  end_date?: string
  total_fee?: number
  discount?: number
  service_price?: number
  status?: number
}

// Nested types (hierarchical: Area contains Pos)
export interface CreateAreaNested {
  name: string
  latitude?: string
  longitude?: string
  description?: string
  poss?: CreatePosNested[]
}

export interface CreatePosNested {
  name: string
  latitude?: string
  longitude?: string
  description?: string
}
