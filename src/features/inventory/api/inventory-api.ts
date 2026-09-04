/**
 * Unified Inventory Types
 * Single module for both warehouse and area stock tracking with barcode support
 */
import { apiClient } from '@/lib/api-client'

// ==================== Types ====================

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
  purchase_date: string | null
  purchase_price: number
  notes: string | null
  created_at: string
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

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

// ==================== Payload Types ====================

export interface TransferPayload {
  qr_code: string
  location_type: 'warehouse' | 'area' | 'employee'
  location_id: number
  condition?: string
  notes?: string
}

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

export interface ReceivePayload {
  product_id: number
  location_type: 'warehouse' | 'area'
  location_id: number
  qr_code?: string
  stock?: number
  condition?: string
  purchase_date?: string
  purchase_price?: number
  notes?: string
}

export interface UpdateConditionPayload {
  qr_code: string
  condition: string
  current_stock?: number
  notes?: string
}

// ==================== API ====================

export const inventoryApi = {
  /**
   * Get list of inventory items with filters
   * GET /api/admin/inventory-items
   */
  getList: async (params?: InventoryFilters) => {
    const { data } = await apiClient.get<PaginatedResponse<InventoryItem>>(
      '/admin/inventory-items',
      { params }
    )
    return data
  },

  /**
   * Get single item by QR code
   * GET /api/admin/inventory-items/{qrCode}
   */
  getByQrCode: async (qrCode: string) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItem>>(
      `/admin/inventory-items/${encodeURIComponent(qrCode)}`
    )
    return data
  },

  /**
   * Scan QR code - quick lookup
   * GET /api/admin/inventory-items/scan/{qrCode}
   */
  scan: async (qrCode: string) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItem>>(
      `/admin/inventory-items/scan/${encodeURIComponent(qrCode)}`
    )
    return data
  },

  /**
   * Get movement history for an item
   * GET /api/admin/inventory-items/{qrCode}/movements
   */
  getMovements: async (qrCode: string) => {
    const { data } = await apiClient.get<ApiResponse<ItemMovement[]>>(
      `/admin/inventory-items/${encodeURIComponent(qrCode)}/movements`
    )
    return data
  },

  /**
   * Get items by area (for mobile daily task)
   * GET /api/admin/inventory-items/by-area/{areaId}
   */
  getByArea: async (
    areaId: number,
    params?: {
      query?: string
      category_type?: 'tools' | 'chemicals' | 'ppes' | 'machines'
    }
  ) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItem[]>>(
      `/admin/inventory-items/by-area/${areaId}`,
      { params }
    )
    return data
  },

  /**
   * Get summary
   * GET /api/admin/inventory-items/summary
   */
  getSummary: async (params?: { product_id?: number; warehouse_id?: number; area_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<InventoryItemSummary>>(
      '/admin/inventory-items/summary',
      { params }
    )
    return data
  },

  /**
   * Transfer item to a new location
   * POST /api/admin/inventory-items/transfer
   */
  transfer: async (payload: TransferPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/transfer',
      payload
    )
    return data
  },

  /**
   * Move item to location (legacy)
   * POST /api/admin/inventory-items/move
   */
  move: async (payload: MoveItemPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/move',
      payload
    )
    return data
  },

  /**
   * Return item to warehouse
   * POST /api/admin/inventory-items/return
   */
  return: async (payload: ReturnItemPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/return',
      payload
    )
    return data
  },

  /**
   * Update item status
   * POST /api/admin/inventory-items/status
   */
  updateStatus: async (payload: UpdateStatusPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/status',
      payload
    )
    return data
  },

  /**
   * Receive new item into inventory
   * POST /api/admin/inventory-items/receive
   */
  receive: async (payload: ReceivePayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/receive',
      payload
    )
    return data
  },

  /**
   * Update condition from daily task
   * POST /api/admin/inventory-items/condition
   */
  updateCondition: async (payload: UpdateConditionPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; item: InventoryItem }>>(
      '/admin/inventory-items/condition',
      payload
    )
    return data
  },

  /**
   * Get QR code data for printing
   * GET /api/admin/inventory-items/{id}/qr
   */
  getQr: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<{ item: InventoryItem; qr_content: string }>>(
      `/admin/inventory-items/${id}/qr`
    )
    return data
  },

  /**
   * Get label data for printing
   * GET /api/admin/inventory-items/{id}/print
   */
  printLabel: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<{
      qr_code: string
      product_name: string
      location: string
      condition: string
      status: string
    }>>(`/admin/inventory-items/${id}/print`)
    return data
  },
}
