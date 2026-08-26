/**
 * Finance Type Definitions
 * API endpoints: /api/admin/finance/*
 */

export interface JournalLine {
  id: number
  account_id: number
  account_code: string | null
  account_name: string | null
  debit: number
  credit: number
}

export interface JournalEntry {
  id: number
  date: string
  description: string
  reference: string | null
  lines: JournalLine[]
}

export interface Account {
  id: number
  code: string
  name: string
  type: string
}

export interface LedgerTransaction {
  id: number
  entry_id: number
  date: string
  description: string
  reference: string | null
  debit: number
  credit: number
  running_balance: number
}

export interface BalanceSheetItem {
  id: number
  name: string
  code: string
  amount: number
}

export interface BalanceSheetSection {
  items: BalanceSheetItem[]
  total: number
}

export interface ProfitLossItem {
  id: number
  name: string
  code: string
  amount: number
}

// Journal Filters
export interface JournalFilters {
  from?: string
  to?: string
}

// Ledger Filters
export interface LedgerFilters {
  account_id?: number
  from?: string
  to?: string
}

// Balance Sheet Filters
export interface BalanceSheetFilters {
  as_of?: string
}

// Profit Loss Filters
export interface ProfitLossFilters {
  from?: string
  to?: string
}

// API Response types
export interface JournalApiResponse {
  success: boolean
  data: JournalEntry[]
  meta: {
    from: string
    to: string
    total_entries: number
  }
}

export interface LedgerApiResponse {
  success: boolean
  data: {
    accounts: Account[]
    selected_account: Account | null
    from: string
    to: string
    opening_balance: number
    closing_balance: number
    transactions: LedgerTransaction[]
  }
}

export interface BalanceSheetApiResponse {
  success: boolean
  data: {
    as_of: string
    assets: BalanceSheetSection
    liabilities: BalanceSheetSection
    equity: {
      items: BalanceSheetItem[]
      base: number
      current_earnings: number
      total: number
    }
    totals: {
      assets: number
      liabilities_equity: number
      difference: number
    }
    is_balanced: boolean
  }
}

export interface ProfitLossApiResponse {
  success: boolean
  data: {
    from: string
    to: string
    revenue: {
      items: ProfitLossItem[]
      total: number
    }
    expense: {
      items: ProfitLossItem[]
      total: number
    }
    net: number
    net_label: 'profit' | 'loss'
  }
}

export interface AccountsApiResponse {
  success: boolean
  data: Account[]
}
