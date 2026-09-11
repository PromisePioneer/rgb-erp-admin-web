/**
 * Payroll Type Definitions
 * API endpoint: /api/admin/payroll
 */

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface PayrollItem {
  id: number
  employee_id: number
  employee_name: string | null
  employee_code: string | null
  type: 'monthly' | 'thr'
  month: number | null
  year: number
  present_days: number | null
  working_days: number | null
  gross: number
  bpjs_ee: number
  pph21: number
  net: number
  status: string
  created_at: string
}

export interface PayrollDetail {
  id: number
  employee: {
    id: number
    name: string
    code: string | null
    join_date: string | null
    ptkp_status: string | null
  }
  type: 'monthly' | 'thr'
  month: number | null
  year: number
  present_days: number | null
  working_days: number | null
  base_earned: number
  allowances: number
  gross: number
  bpjs_ee: number
  bpjs_employer: {
    health: number
    jht: number
    jp: number
    jkk: number
    jkm: number
    total: number
  } | null
  pph21: number
  ter_category: string | null
  net: number
  breakdown: {
    earnings: { name: string; amount: number }[]
    deductions: { name: string; amount: number }[]
  }
  status: string
}

export interface PayrollFilters {
  month?: number
  year?: number
  type?: 'monthly' | 'thr'
  page?: number
  per_page?: number
}

export interface PayrollPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  filters: {
    month: number
    year: number
    type: string
  }
}

// API Response types
export interface PayrollListResponse {
  success: boolean
  data: PayrollItem[]
  meta: PayrollPagination
}

export interface PayrollDetailResponse {
  success: boolean
  data: PayrollDetail
}

export interface PayrollGenerateResponse {
  success: boolean
  data: {
    message: string
    count: number
    month: number
    year: number
  }
}

export interface PayrollYearsResponse {
  success: boolean
  data: number[]
}

// Form payloads
export interface GeneratePayrollPayload {
  month: number
  year: number
}

export interface GenerateThrPayload {
  year: number
}
