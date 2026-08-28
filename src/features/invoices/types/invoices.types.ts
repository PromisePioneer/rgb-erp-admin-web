/**
 * Invoice Type Definitions
 * API endpoint: /api/admin/invoices
 */

export interface InvoiceItem {
  id: number
  description: string
  qty: number
  price: number
  subtotal: number
}

export interface Invoice {
  id: number
  invoice_number: string
  client_id: number
  client_name: string | null
  company_id: number | null
  issue_date: string
  due_date: string
  period: string | null
  subtotal: number
  tax: number
  discount: number
  total: number
  status: string
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceDetail extends Invoice {
  items: InvoiceItem[]
}

export interface InvoiceFilters {
  search?: string
  client_id?: number
  status?: string
  page?: number
  per_page?: number
}

export interface InvoicePagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: InvoicePagination
  message?: string
}

// Form payloads
export interface CreateInvoicePayload {
  client_id: number
  issue_date: string
  due_date: string
  period?: string
  tax?: number
  discount?: number
  notes?: string
  items: {
    description: string
    qty?: number
    price?: number
  }[]
}

export interface UpdateInvoicePayload {
  client_id?: number
  issue_date?: string
  due_date?: string
  period?: string
  tax?: number
  discount?: number
  notes?: string
  items?: {
    description: string
    qty?: number
    price?: number
  }[]
}

export interface SelectOptionItem {
  id: number
  name: string
  text: string
}
