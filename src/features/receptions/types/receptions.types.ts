/**
 * Reception Type Definitions
 * API endpoint: /api/admin/receptions
 */

export interface PurchaseOrder {
  id: number
  code: string
  date: string
  supplier_name: string | null
  total: number
  details?: PurchaseOrderDetail[]
}

export interface PurchaseOrderDetail {
  id: number
  product_id: number
  product_name?: string
  product_code?: string
  qty: number
  unit: string
  price: number
  total: number
}

export interface Reception {
  id: number
  code: string | null
  date: string
  purchase_order_id: number
  purchase_order_code: string | null
  warehouse_id?: number
  total: number
  status: string
  order_code?: string
  purchase_order?: PurchaseOrder
  warehouse?: Warehouse
  details?: ReceptionDetail[]
  created_at: string
  updated_at: string
}

export interface ReceptionDetail {
  id: number
  reception_id: number
  product_id: number
  qty: number
  total: number
  status: number
  product?: Product
}

export interface Product {
  id: number
  code: string
  name: string
  unit: string
  base_price?: number
}

export interface Warehouse {
  id: number
  name: string
}

export interface ReceptionsFilters {
  search?: string
  warehouse_id?: number
  start_date?: string
  end_date?: string
  page?: number
  per_page?: number
}

export interface ReceptionsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ReceptionsPagination
  message?: string
}

// Form payloads
export interface CreateReceptionPayload {
  purchase_order_id: number
  warehouse_id: number
  date: string
  product_id: number[]
  qty: (number | null)[]
  unit_cost: (number | null)[]
}

export interface UpdateReceptionPayload {
  purchase_order_id?: number
  warehouse_id?: number
  date?: string
  product_id?: number[]
  qty?: (number | null)[]
  unit_cost?: (number | null)[]
}

// Line item for form
export interface ReceptionLineItem {
  product_id: number | null
  product_name?: string
  product_code?: string
  qty: number
  unit_price: number
  line_total: number
}
