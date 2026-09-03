/**
 * Approval Types Type Definitions (Flat Structure)
 * API endpoint: /api/admin/approval-types
 */

/**
 * Single approval step (inline dalam ApprovalType)
 */
export interface ApprovalStep {
  id?: number
  level: number
  approver_kind: 'user' | 'role'
  approver_id: number
  approver_name?: string
}

/**
 * Approval Type dengan steps langsung (flat structure)
 */
export interface ApprovalType {
  id: number
  type: string
  name: string
  is_active: boolean
  steps_count: number
  steps_summary: ApprovalStep[]
  created_at: string
  updated_at: string
}

/**
 * Detail Approval Type dengan full steps
 */
export interface ApprovalTypeDetail extends ApprovalType {
  steps: ApprovalStep[]
}

/**
 * Create/Update payload - single request dengan steps inline
 */
export interface ApprovalTypePayload {
  type?: string  // Optional for update
  name: string
  is_active?: boolean
  steps?: StepPayload[]
}

/**
 * Step payload untuk create/update
 */
export interface StepPayload {
  level: number
  approver_kind: 'user' | 'role'
  approver_id: number
}

/**
 * Position option untuk dropdown
 */
export interface PositionOption {
  id: number
  name: string
  parent_name?: string
}

/**
 * Employee option untuk dropdown
 */
export interface EmployeeOption {
  id: number
  name: string
  code: string
  position_name?: string
}
