/**
 * Bank Accounts API Module
 * Endpoints for bank accounts management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  BankAccount,
  BankAccountsFilters,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from '../types/bank-accounts.types'

export const bankAccountsApi = {
  /**
   * Get list of bank accounts with optional filters
   * GET /api/admin/bank-accounts
   */
  getList: async (params?: BankAccountsFilters) => {
    const { data } = await apiClient.get<ApiResponse<BankAccount[]>>('/admin/bank-accounts', {
      params,
    })
    return data
  },

  /**
   * Get single bank account by ID
   * GET /api/admin/bank-accounts/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<BankAccount>>(`/admin/bank-accounts/${id}`)
    return data
  },

  /**
   * Create new bank account
   * POST /api/admin/bank-accounts
   */
  create: async (payload: CreateBankAccountPayload) => {
    const { data } = await apiClient.post<ApiResponse<BankAccount>>('/admin/bank-accounts', payload)
    return data
  },

  /**
   * Update existing bank account
   * PUT /api/admin/bank-accounts/:id
   */
  update: async (id: number, payload: UpdateBankAccountPayload) => {
    const { data } = await apiClient.put<ApiResponse<BankAccount>>(`/admin/bank-accounts/${id}`, payload)
    return data
  },

  /**
   * Delete bank account (soft delete)
   * DELETE /api/admin/bank-accounts/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/bank-accounts/${id}`)
  },

  /**
   * Bulk delete bank accounts (soft delete)
   * POST /api/admin/bank-accounts/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/bank-accounts/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for banks dropdown
   * GET /api/admin/bank-accounts/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/bank-accounts/select-options',
      { params }
    )
    return data
  },
}
