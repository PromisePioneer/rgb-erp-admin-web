// Types for Distribution Requests

export type DistributionRequestStatus = 'draft' | 'pending' | 'approved' | 'rejected'
export type DestinationType = 'area' | 'warehouse'

export interface DistributionRequest {
  id: number
  date: string
  code: string
  status: DistributionRequestStatus

  // Source warehouse
  warehouse_source_id: number | null
  warehouse_source_name: string | null

  // Destination
  destination_type: DestinationType | null
  client_id: number | null
  client_name: string | null
  area_id: number | null
  area_name: string | null
  warehouse_destination_id: number | null
  warehouse_destination_name: string | null

  // Display
  destination_display: string | null

  // Amount
  total: number

  // Approval
  current_level: number

  // Delivery
  delivery_receipt_number: string | null
  delivery_date: string | null
  recipient_name: string | null
  delivery_notes: string | null

  // Meta
  notes: string | null
  can_edit: boolean
  can_submit: boolean
  can_deliver: boolean
  created_by: number | null
  creator_name: string | null
  created_at: string
  updated_at: string
}

export interface DistributionRequestDetail {
  id: number
  distribution_request_id: number
  product_id: number
  product_name: string
  product_code: string
  qty: number
  qty_distributed: number
  remaining_qty: number
  unit_cost: number
  total: number
  status: number // 1=pending, 2=partial, 3=full
}

export interface Approval {
  id: number
  level: number
  status: string
  note: string | null
  approver_id: number | null
  approver_name: string | null
  acted_at: string | null
}

export interface Creator {
  id: number
  name: string
}

export interface DistributionRequestFull extends DistributionRequest {
  details: DistributionRequestDetail[]
  approvals: Approval[]
  creator: Creator
}

export interface CreateDistributionRequestPayload {
  date: string
  warehouse_source_id: number
  destination_type: DestinationType
  client_id: number | null
  area_id: number | null
  warehouse_destination_id: number | null
  notes: string
  details: {
    product_id: number
    qty: number
    unit_cost?: number
  }[]
}

export interface UpdateDistributionRequestPayload extends CreateDistributionRequestPayload {}

export interface MarkDeliveredPayload {
  delivery_receipt_number: string
  delivery_date: string
  recipient_name?: string
  delivery_notes?: string
  details?: {
    id: number
    qty_distributed: number
  }[]
}

export interface DistributionRequestsFilters {
  search?: string
  status?: DistributionRequestStatus
  date_from?: string
  date_to?: string
  warehouse_source_id?: number
  area_id?: number
  warehouse_destination_id?: number
  page?: number
  per_page?: number
}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: Pagination
  message?: string
}

// Select option types
export interface AreaOption {
  id: number
  name: string
  client_id: number
  client_name: string
  text: string
}

export interface WarehouseOption {
  id: number
  name: string
  location: string | null
}

export interface ClientOption {
  id: number
  name: string
  code: string
}

export interface DistributionRequestOption {
  id: number
  code: string
  date: string
  destination_display: string | null
  total: number
}
