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
  approver_kind: 'position' | 'role' | 'employee'
  approver_id: number
  approver_name?: string
  approver_company?: string
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
  type?: string
  name: string
  is_active?: boolean
  steps?: StepPayload[]
}

/**
 * Step payload untuk create/update
 */
export interface StepPayload {
  level: number
  approver_kind: 'position' | 'role' | 'employee'
  approver_id: number
}

/**
 * Position option untuk dropdown
 * Tampilkan company name: "DANRU (NON SATPAM)"
 */
export interface PositionOption {
  id: number
  name: string
  company_name?: string
  parent_name?: string
}

/**
 * Role option untuk dropdown
 */
export interface RoleOption {
  id: number
  name: string
  description?: string
}

/**
 * Employee option untuk dropdown
 */
export interface EmployeeOption {
  id: number
  name: string
  code: string
  position_name?: string
  company_name?: string
}
