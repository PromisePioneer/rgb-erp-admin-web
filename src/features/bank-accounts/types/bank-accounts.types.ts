/**
 * Bank Account Type Definitions
 * API endpoint: /api/admin/bank-accounts
 */

export interface BankAccount {
  id: number
  bank_id: number
  bank_name: string | null
  branch_name: string
  account_number: string
  account_name: string
  status: number
  created_at: string
  updated_at: string
}

export interface BankAccountsFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface BankAccountsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: BankAccountsPagination
  message?: string
}

// Form payloads
export interface CreateBankAccountPayload {
  bank_id: number
  branch_name: string
  account_number: string
  account_name: string
  status?: number
}

export interface UpdateBankAccountPayload {
  bank_id?: number
  branch_name?: string
  account_number?: string
  account_name?: string
  status?: number
}
