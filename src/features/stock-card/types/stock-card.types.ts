/**
 * Stock Card Type Definitions
 * API endpoint: /api/admin/inventory/stock-card
 */

export interface StockMovement {
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
  description: string | null
  reference_type: string | null
  reference_id: number | null
  reference_number: string | null
  created_by: number | null
  created_at: string
  updated_at: string
  warehouse?: {
    id: number
    name: string
  }
  createdBy?: {
    id: number
    name: string
  }
}

export interface StockCardData {
  product: {
    id: number
    code: string
    name: string
    unit: string
  }
  warehouse_id: number | null
  opening_balance: {
    qty: number
    value: number
  }
  movements: StockMovement[]
  current_balance: {
    qty: number
    value: number
  }
  average_cost: number
}

export interface Product {
  id: number
  code: string
  name: string
}

export interface Warehouse {
  id: number
  name: string
}

export interface StockCardFilters {
  product_id?: number
  warehouse_id?: number
  start_date?: string
  end_date?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Movement type labels
export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  purchase: 'Pembelian',
  sale: 'Penjualan',
  adjustment: 'Penyesuaian',
  transfer_in: 'Transfer Masuk',
  transfer_out: 'Transfer Keluar',
  return_in: 'Retur Masuk',
  return_out: 'Retur Keluar',
}

// Movement type colors
export const MOVEMENT_TYPE_COLORS: Record<string, string> = {
  purchase: 'bg-green-100 text-green-700',
  sale: 'bg-red-100 text-red-700',
  adjustment: 'bg-blue-100 text-blue-700',
  transfer_in: 'bg-purple-100 text-purple-700',
  transfer_out: 'bg-orange-100 text-orange-700',
  return_in: 'bg-cyan-100 text-cyan-700',
  return_out: 'bg-yellow-100 text-yellow-700',
}
