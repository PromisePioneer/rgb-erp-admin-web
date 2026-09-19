/**
 * Purchase Request Type Definitions
 * API endpoint: /api/admin/purchase-requests
 */

// Status types
export type PurchaseRequestStatus = 'pending' | 'approved' | 'rejected'

// Approval type
export interface PurchaseRequestApproval {
  id: number
  level: number
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  acted_at: string | null
}

export interface PurchaseRequest {
  id: number
  date: string
  code: string
  supplier: string | null
  notes: string
  total: number
  status: PurchaseRequestStatus
  current_level: number
  can_edit: boolean
  can_submit: boolean
  created_at: string
  updated_at: string
}

export interface PurchaseRequestDetail {
  id: number
  product_id: number
  product_name: string | null
  qty: number
  total: number
  status: number
}

export interface PurchaseRequestFull extends PurchaseRequest {
  details: PurchaseRequestDetail[]
  approvals: PurchaseRequestApproval[]
}

export interface PurchaseRequestsFilters {
  search?: string
  status?: PurchaseRequestStatus
  page?: number
  per_page?: number
}

export interface PurchaseRequestsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PurchaseRequestsPagination
  message?: string
}

// Form payloads
export interface CreatePurchaseRequestPayload {
  date: string
  supplier?: string
  notes: string
  details: PurchaseRequestDetailPayload[]
}

export interface UpdatePurchaseRequestPayload {
  date: string
  supplier?: string
  notes: string
  details: PurchaseRequestDetailPayload[]
}

export interface PurchaseRequestDetailPayload {
  product_id: number
  qty: number
  total: number
}

// Select options response
export interface ProductSelectOption {
  id: number
  name: string
}
