/**
 * Stock Opname Type Definitions
 * API endpoint: /api/admin/stock-opname
 */

export interface StockPosition {
  product_id: number
  product_code: string
  product_name: string
  category: string | null
  unit: string
  system_qty: number
  system_value: number
  avg_cost: number
}

export interface StockOpnameHistory {
  id: number
  product_id: number
  warehouse_id: number
  date: string
  type: string
  qty: number
  unit_cost: number
  total_cost: number
  balance_qty: number
  balance_value: number
  description: string
  reference_type: string | null
  reference_id: number | null
  reference_number: string | null
  product?: {
    id: number
    code: string
    name: string
  }
  warehouse?: {
    id: number
    name: string
  }
  created_by?: number
  createdBy?: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

export interface StockOpnameResult {
  adjustment_count: number
  total_gain: number
  total_loss: number
  journal_entry_id: number | null
  adjustments: Array<{
    product_id: number
    product_code: string
    product_name: string
    system_qty: number
    actual_qty: number
    variance: number
    variance_value: number
  }>
  message: string
}

export interface StockOpnameFilters {
  warehouse_id?: number
  start_date?: string
  end_date?: string
  page?: number
  per_page?: number
}

export interface StockOpnamePagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: StockOpnamePagination
  message?: string
}

// Form payloads
export interface SubmitStockOpnamePayload {
  warehouse_id: number
  opname_date: string
  items: Array<{
    product_id: number
    actual_qty: number
  }>
}

// Line item for form
export interface OpnameLineItem extends StockPosition {
  actual_qty: number
  variance: number
  variance_value: number
}
