/**
 * Approval Type Definitions
 * API endpoint: /api/admin/approvals
 */

export interface Approval {
  id: number
  level: number
  status: 'pending' | 'approved' | 'rejected'
  approver_kind: 'user' | 'role'
  approver_id: number
  approvable_type: string
  approvable_id: number
  type_label: string
  requester: {
    id: number
    name: string
  } | null
  request_date: string | null
  amount: number | null
  reason: string | null
  current_level: number
  created_at: string
}

export interface ApprovalDetail extends Approval {
  note: string | null
  acted_by: number | null
  acted_at: string | null
  approvable: {
    id: number
    status: string
    current_level: number
  } | null
}

export interface ApprovalsFilters {
  search?: string
  page?: number
  per_page?: number
}

export interface ApprovalsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ApprovalsPagination
  message?: string
}

// Act payload
export interface ApprovalActPayload {
  decision: 'approve' | 'reject'
  note?: string
}
