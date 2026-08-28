/**
 * Account Type Definitions
 * Chart of Accounts module
 * API endpoint: /api/admin/accounts
 */

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export interface Account {
  id: number
  code: string
  name: string
  type: AccountType
  type_label: string
  created_at: string | null
  updated_at: string | null
}

export interface AccountsFilters {
  search?: string
  type?: AccountType
  page?: number
  per_page?: number
}

export interface AccountsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: AccountsPagination
  message?: string
}

// Select option type for dropdowns
export interface AccountSelectOption {
  id: number
  code: string
  name: string
  type: AccountType
  text: string
}

// Account type option for dropdown
export interface AccountTypeOption {
  value: AccountType
  label: string
}

// Form payloads
export interface CreateAccountPayload {
  code: string
  name: string
  type: AccountType
}

export interface UpdateAccountPayload {
  code?: string
  name?: string
  type?: AccountType
}
