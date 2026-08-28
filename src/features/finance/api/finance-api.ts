/**
 * Finance API Module
 * Endpoints for finance reports (Journal, Ledger, Balance Sheet, Profit & Loss)
 */
import { apiClient } from '@/lib/api-client'
import type {
  AccountsApiResponse,
  BalanceSheetApiResponse,
  JournalApiResponse,
  LedgerApiResponse,
  ProfitLossApiResponse,
} from '../types/finance.types'

export const financeApi = {
  /**
   * Get journal entries with date range filter
   * GET /api/admin/finance/journal
   */
  getJournal: async (params?: { from?: string; to?: string }) => {
    const { data } = await apiClient.get<JournalApiResponse>('/admin/finance/journal', {
      params,
    })
    return data
  },

  /**
   * Get ledger for a specific account
   * GET /api/admin/finance/ledger
   */
  getLedger: async (params?: { account_id?: number; from?: string; to?: string }) => {
    const { data } = await apiClient.get<LedgerApiResponse>('/admin/finance/ledger', {
      params,
    })
    return data
  },

  /**
   * Get accounts list for dropdown
   * GET /api/admin/finance/accounts
   */
  getAccounts: async () => {
    const { data } = await apiClient.get<AccountsApiResponse>('/admin/finance/accounts')
    return data
  },

  /**
   * Get balance sheet as of a specific date
   * GET /api/admin/finance/balance-sheet
   */
  getBalanceSheet: async (params?: { as_of?: string }) => {
    const { data } = await apiClient.get<BalanceSheetApiResponse>('/admin/finance/balance-sheet', {
      params,
    })
    return data
  },

  /**
   * Get profit and loss statement for a period
   * GET /api/admin/finance/profit-loss
   */
  getProfitLoss: async (params?: { from?: string; to?: string }) => {
    const { data } = await apiClient.get<ProfitLossApiResponse>('/admin/finance/profit-loss', {
      params,
    })
    return data
  },
}
