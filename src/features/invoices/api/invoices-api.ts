/**
 * Invoices API Module
 * Endpoints for invoices management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Invoice,
  InvoiceDetail,
  InvoiceFilters,
  SelectOptionItem,
  CreateInvoicePayload,
} from '../types/invoices.types'

export const invoicesApi = {
  /**
   * Get list of invoices with optional filters
   * GET /api/admin/invoices
   */
  getList: async (params?: InvoiceFilters) => {
    const { data } = await apiClient.get<ApiResponse<Invoice[]>>('/admin/invoices', {
      params,
    })
    return data
  },

  /**
   * Get single invoice by ID with items
   * GET /api/admin/invoices/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<InvoiceDetail>>(`/admin/invoices/${id}`)
    return data
  },

  /**
   * Create new invoice
   * POST /api/admin/invoices
   */
  create: async (payload: CreateInvoicePayload) => {
    const { data } = await apiClient.post<ApiResponse<Invoice>>('/admin/invoices', payload)
    return data
  },

  /**
   * Mark invoice as paid
   * POST /api/admin/invoices/:id/mark-paid
   */
  markPaid: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<{ id: number; status: string; paid_at: string }>>(
      `/admin/invoices/${id}/mark-paid`
    )
    return data
  },

  /**
   * Get select options for clients dropdown
   * GET /api/admin/invoices/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }): Promise<SelectOptionItem[]> => {
    const { data } = await apiClient.get<ApiResponse<SelectOptionItem[]>>(
      '/admin/invoices/select-options',
      { params }
    )
    return data.data
  },
}
