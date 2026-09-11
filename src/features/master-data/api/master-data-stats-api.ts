/**
 * Master Data Stats API Module
 * Endpoints for getting counts of all master data items
 */
import { apiClient } from '@/lib/api-client'

export interface MasterDataStats {
  provinces: number
  departments: number
  clients: number
  positions: number
  shifts: number
  employees: number
  areas: number
  poss: number
  employee_types: number
  roles: number
  client_types: number
  violation_types: number
  products: number
  product_categories: number
  warehouses: number
  banks: number
  bank_accounts: number
  daily_task_items: number
  daily_task_review_criteria: number
}

export interface MasterDataStatsResponse {
  success: boolean
  data: MasterDataStats
}

export const masterDataStatsApi = {
  /**
   * Get counts for all master data items
   * GET /api/admin/master-data/stats
   */
  getStats: async () => {
    const { data } = await apiClient.get<MasterDataStatsResponse>(
      '/admin/master-data/stats'
    )
    return data
  },
}
