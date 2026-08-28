// Journal Entry Types

interface User {
  id: number
  name: string
  email: string
}

interface AccountingPeriod {
  id: number
  year: number
  month: number
  label: string
}

interface Account {
  id: number
  code: string
  name: string
}

export interface JournalEntry {
  id: number
  date: string
  reference: string | null
  description: string
  status: 'draft' | 'posted'
  source_type: string | null
  source_id: string | null
  created_by: number
  updated_by: number | null
  posted_by: number | null
  posted_at: string | null
  period_id: number | null
  lines: JournalLine[]
  total_debit?: number
  total_credit?: number
  created_by_user?: User
  updated_by_user?: User
  posted_by_user?: User
  period?: AccountingPeriod
  created_at: string
  updated_at: string
}

export interface JournalLine {
  id: number
  journal_entry_id: number
  account_id: number
  debit: number
  credit: number
  account?: Account
}

export interface JournalEntryFormData {
  date: string
  reference?: string
  description: string
  auto_post?: boolean
  lines: {
    account_id: number
    debit: number
    credit: number
  }[]
}

export interface JournalFilters {
  status?: 'draft' | 'posted'
  start_date?: string
  end_date?: string
  period_id?: number
}
