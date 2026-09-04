/**
 * Purchase Order Type Definitions
 * API endpoint: /api/admin/purchase-orders
 */

export interface PurchaseOrderApproval {
  id: number
  level: number
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  acted_at: string | null
}

export interface PurchaseOrder {
  id: number
  purchase_request_id: number
  purchase_request_code: string | null
  date: string
  code: string
  supplier: string | null
  total: number
  status: string
  current_level: number
  can_edit: boolean
  can_submit: boolean
  created_at: string
  updated_at: string
}

export interface PurchaseOrderDetail {
  id: number
  product_id: number
  product_name: string | null
  qty: number
  total: number
  status: number
}

export interface PurchaseOrderFull extends PurchaseOrder {
  details: PurchaseOrderDetail[]
  approvals: PurchaseOrderApproval[]
}

export interface PurchaseRequestSelectOption {
  id: number
  code: string
  supplier: string | null
  date: string
  total: number
  details: {
    product_id: number
    product_name: string | null
    qty: number
    total: number
  }[]
}

export interface PurchaseOrdersFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface PurchaseOrdersPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PurchaseOrdersPagination
  message?: string
}

// Form payloads
export interface CreatePurchaseOrderPayload {
  purchase_request_id: number
  date: string
  supplier?: string
  details: PurchaseOrderDetailPayload[]
}

export interface UpdatePurchaseOrderPayload {
  purchase_request_id: number
  date: string
  supplier?: string
  details: PurchaseOrderDetailPayload[]
}

export interface PurchaseOrderDetailPayload {
  product_id: number
  qty: number
  total: number
}
