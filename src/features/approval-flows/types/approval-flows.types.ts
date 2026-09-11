/**
 * Approval Flow Type Definitions
 * API endpoint: /api/admin/approval-flows
 */

export interface ApprovalFlowStep {
  id: number
  level: number
  approver_kind: 'user' | 'role'
  approver_id: number
  approver_label: string
  is_active: boolean
}

export interface ApprovalFlow {
  type: string
  name: string
  is_active: boolean
  steps: ApprovalFlowStep[]
}

export interface ApprovalFlowsFilters {
  search?: string
  page?: number
  per_page?: number
}

export interface ApprovalFlowsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ApprovalFlowsPagination
  message?: string
}

// Select options
export interface SelectOption {
  id: number
  name: string
  text: string
  email?: string
}

// Update payload
export interface UpdateApprovalFlowPayload {
  is_active: boolean
  steps: {
    level: number
    approver_kind: 'user' | 'role'
    approver_id: number
  }[]
}
