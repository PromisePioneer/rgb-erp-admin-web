/**
 * Payroll API Module
 * Endpoints for payroll management
 */
import { apiClient } from '@/lib/api-client'
import type {
  PayrollDetailResponse,
  PayrollListResponse,
  PayrollYearsResponse,
  GeneratePayrollPayload,
  GenerateThrPayload,
} from '../types/payroll.types'

export const payrollApi = {
  /**
   * Get list of payroll records with filters
   * GET /api/admin/payroll
   */
  getList: async (params?: {
    month?: number
    year?: number
    type?: string
    page?: number
    per_page?: number
  }) => {
    const { data } = await apiClient.get<PayrollListResponse>('/admin/payroll', {
      params,
    })
    return data
  },

  /**
   * Get single payroll/payslip detail
   * GET /api/admin/payroll/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<PayrollDetailResponse>(`/admin/payroll/${id}`)
    return data
  },

  /**
   * Get available years for payroll
   * GET /api/admin/payroll/years
   */
  getYears: async () => {
    const { data } = await apiClient.get<PayrollYearsResponse>('/admin/payroll/years')
    return data
  },

  /**
   * Generate monthly payroll
   * POST /api/admin/payroll/generate
   */
  generate: async (payload: GeneratePayrollPayload) => {
    const { data } = await apiClient.post<PayrollListResponse>(
      '/admin/payroll/generate',
      payload
    )
    return data
  },

  /**
   * Generate THR
   * POST /api/admin/payroll/thr
   */
  generateThr: async (payload: GenerateThrPayload) => {
    const { data } = await apiClient.post<PayrollListResponse>(
      '/admin/payroll/thr',
      payload
    )
    return data
  },

  /**
   * Bulk delete payroll records
   * POST /api/admin/payroll/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ deleted: number }>>(
      '/admin/payroll/bulk-delete',
      { ids }
    )
    return data
  },
}
