// Account types
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
  children?: Account[]
  created_at: string
  updated_at: string
}

export interface AccountFilters {
  type?: Account['type']
  is_header?: boolean
  search?: string
}
