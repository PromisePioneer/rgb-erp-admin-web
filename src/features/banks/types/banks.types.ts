/**
 * Bank Type Definitions
 * API endpoint: /api/admin/banks
 */

export interface Bank {
  id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface BanksFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface BanksPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: BanksPagination
  message?: string
}

export interface CreateBankPayload {
  name: string
  status: number
}

export interface UpdateBankPayload extends CreateBankPayload {}
