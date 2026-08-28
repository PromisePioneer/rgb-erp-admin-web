/**
 * Company API Module
 * Endpoints for company management
 */
import { apiClient } from '@/lib/api-client'
import type { CompanySelectOption } from '../types/companies.types'

export const companyApi = {
  /**
   * Get companies for select dropdown
   * GET /api/admin/companies/select-options
   */
  getSelectOptions: async (params?: { q?: string }): Promise<CompanySelectOption[]> => {
    const { data } = await apiClient.get<{ data: CompanySelectOption[] }>(
      '/admin/companies/select-options',
      { params }
    )
    return data.data
  },

  /**
   * Switch current company
   * POST /api/admin/company/switch
   */
  switchCompany: async (companyId: number): Promise<void> => {
    await apiClient.post('/admin/company/switch', { company_id: companyId })
  },
}
