// Chart of Accounts Types

export interface Account {
  id: number
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_id: number | null
  level: number
  normal_balance: 'debit' | 'credit'
  is_header: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AccountTree extends Account {
  children: AccountTree[]
  expanded?: boolean
}

export interface AccountFormData {
  code: string
  name: string
  type: Account['type']
  parent_id: number | null
  is_header: boolean
  normal_balance: 'debit' | 'credit'
}

export interface AccountFilters {
  type?: Account['type']
  is_header?: boolean
  search?: string
}
