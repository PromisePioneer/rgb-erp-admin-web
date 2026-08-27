/**
 * Accounts API Module
 * Endpoints for Chart of Accounts management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Account,
  AccountsFilters,
  AccountSelectOption,
  AccountTypeOption,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '../types/accounts.types'

export const accountsApi = {
  /**
   * Get list of accounts with optional filters
   * GET /api/admin/accounts
   */
  getList: async (params?: AccountsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Account[]>>('/admin/accounts', {
      params,
    })
    return data
  },

  /**
   * Get single account by ID
   * GET /api/admin/accounts/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Account>>(`/admin/accounts/${id}`)
    return data
  },

  /**
   * Create new account
   * POST /api/admin/accounts
   */
  create: async (payload: CreateAccountPayload) => {
    const { data } = await apiClient.post<ApiResponse<Account>>('/admin/accounts', payload)
    return data
  },

  /**
   * Update existing account
   * PUT /api/admin/accounts/:id
   */
  update: async (id: number, payload: UpdateAccountPayload) => {
    const { data } = await apiClient.put<ApiResponse<Account>>(`/admin/accounts/${id}`, payload)
    return data
  },

  /**
   * Delete account
   * DELETE /api/admin/accounts/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/accounts/${id}`)
  },

  /**
   * Bulk delete accounts
   * POST /api/admin/accounts/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/accounts/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/accounts/select-options
   */
  getSelectOptions: async (params?: { q?: string; type?: string }) => {
    const { data } = await apiClient.get<ApiResponse<AccountSelectOption[]>>(
      '/admin/accounts/select-options',
      { params }
    )
    return data
  },

  /**
   * Get account types for dropdown
   * GET /api/admin/accounts/types
   */
  getTypes: async () => {
    const { data } = await apiClient.get<ApiResponse<AccountTypeOption[]>>(
      '/admin/accounts/types'
    )
    return data
  },
}
