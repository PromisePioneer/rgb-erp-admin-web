/**
 * Petty Cash Type Definitions
 * API endpoint: /api/admin/petty-cash
 */

export interface PettyCash {
  id: number
  company_id: number
  company_name: string | null
  date: string
  cash: number
  current_cash: number
  remaining_cash: number
  status: number
  created_at: string
  updated_at: string
}

export interface PettyCashDetail extends PettyCash {
  // Additional detail fields if needed
}

export interface PettyCashFilters {
  search?: string
  company_id?: number
  status?: number
  page?: number
  per_page?: number
}

export interface PettyCashPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PettyCashPagination
  message?: string
}

// Form payloads
export interface CreatePettyCashPayload {
  company_id: number
  date: string
  cash: number
  current_cash?: number
  remaining_cash?: number
  status?: number
}

export interface UpdatePettyCashPayload {
  company_id?: number
  date?: string
  cash?: number
  current_cash?: number
  remaining_cash?: number
  status?: number
}
