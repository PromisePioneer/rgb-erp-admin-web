export interface FundRequest {
  id: number
  code: string | null
  po_id: number
  po_code: string | null
  vendor_id: number | null
  vendor_name: string | null
  requested_by: number
  requested_by_name: string | null
  total_po_amount: number
  requested_amount: number
  tax_amount: number
  payment_term: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  payment_method: string | null
  status: string
  current_level: number
  can_edit: boolean
  can_submit: boolean
  invoice_attachment: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FundRequestDetail extends FundRequest {
  po_details: FundRequestLineItem[]
  approvals: Approval[]
}

export interface FundRequestLineItem {
  product_id: number
  product_name: string | null
  qty: number
  total: number
}

export interface Approval {
  id: number
  level: number
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  acted_at: string | null
}

export interface FundRequestFilters {
  search?: string
  status?: string
  page?: number
  per_page?: number
}

export interface CreateFundRequestPayload {
  po_id: number
  vendor_id?: number
  requested_amount: number
  tax_amount?: number
  payment_term?: string
  bank_name?: string
  bank_account_number?: string
  bank_account_name?: string
  payment_method?: string
  invoice_attachment?: string
  notes?: string
}

export interface UpdateFundRequestPayload extends CreateFundRequestPayload {}
