/**
 * Inventory Item Type Definitions
 * API endpoint: /api/admin/inventory-items
 * Unified tracking for warehouse and area inventory with movement history
 */

export interface InventoryItem {
  id: number
  qr_code: string
  product_id: number
  product_name: string
  category_name: string | null
  warehouse_id: number | null
  warehouse_name: string | null
  area_id: number | null
  area_name: string | null
  employee_id: number | null
  employee_name: string | null
  status: 'available' | 'assigned' | 'damaged' | 'lost'
  status_label: string
  status_color: string
  condition: string | null
  condition_label: string
  condition_color: string
  initial_stock: number
  current_stock: number
  current_location_type: 'warehouse' | 'area' | 'employee' | null
  current_location_id: number | null
  current_location_name: string | null
  location_name: string | null
  purchase_date: string | null
  purchase_price: number
  purchase_order_code: string | null
  reception_date: string | null
  notes: string | null
  created_at: string
}

export interface InventoryItemSummary {
  total: number
  available: number
  assigned: number
  damaged: number
  lost: number
  category_breakdown: CategoryBreakdown[]
}

export interface CategoryBreakdown {
  category_name: string
  total_items: number
  total_stock: number
  condition: string
  condition_color: string
  condition_label: string
}

export interface ItemMovement {
  id: number
  action: 'received' | 'transfer' | 'adjustment' | 'damage' | 'repair' | 'disposal' | 'return'
  action_label: string
  action_color: string
  from_type: string | null
  from_id: number | null
  from_name: string | null
  to_type: string | null
  to_id: number | null
  to_name: string | null
  condition: string | null
  notes: string | null
  reference_type: string | null
  reference_id: string | null
  moved_by: string | null
  created_at: string
  created_at_human: string
}

export interface InventoryFilters {
  product_id?: number
  warehouse_id?: number
  area_id?: number
  status?: string
  location_type?: 'warehouse' | 'area' | 'employee'
  search?: string
  page?: number
  per_page?: number
}

export interface InventoryPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: InventoryPagination
  message?: string
}

// Form payloads
export interface MoveItemPayload {
  qr_code: string
  location_type: 'warehouse' | 'area' | 'employee'
  location_id: number
  notes?: string
}

export interface ReturnItemPayload {
  qr_code: string
  warehouse_id: number
  condition?: 'good' | 'damaged'
  notes?: string
}

export interface UpdateStatusPayload {
  qr_code: string
  status: 'available' | 'assigned' | 'damaged' | 'lost'
  condition?: string
  notes?: string
}
