/**
 * Fixed Assets Store
 * Zustand state management for fixed assets
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

export interface FixedAsset {
  id: number
  code: string
  name: string
  category_name: string
  purchase_date: string
  purchase_cost: number
  salvage_value: number
  useful_life_years: number
  depreciation_method: string
  accumulated_depreciation: number
  book_value: number
  status: 'active' | 'disposed' | 'sold'
}

export interface FixedAssetsSummary {
  total_cost: number
  total_accumulated: number
  total_book_value: number
}

export interface FixedAssetsData {
  assets: FixedAsset[]
  summary: FixedAssetsSummary
}

interface FixedAssetsFilters {
  status?: string
  search?: string
}

interface FixedAssetsState {
  // State
  assets: FixedAsset[]
  summary: FixedAssetsSummary | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: FixedAssetsFilters

  // Actions
  fetchAssets: (filters?: FixedAssetsFilters) => Promise<void>
  setFilters: (filters: FixedAssetsFilters) => void
  clearError: () => void
}

export const useFixedAssetsStore = create<FixedAssetsState>((set, get) => ({
  // Initial state
  assets: [],
  summary: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: { status: 'active' },

  // Actions
  fetchAssets: async (filters?: FixedAssetsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const params = new URLSearchParams()
      const currentFilters = filters ?? get().filters
      if (currentFilters.status && currentFilters.status !== 'all') {
        params.set('status', currentFilters.status)
      }
      if (currentFilters.search) {
        params.set('search', currentFilters.search)
      }

      const { data } = await apiClient.get(`/admin/fixed-assets?${params}`)
      const responseData: FixedAssetsData = data.data || { assets: [], summary: { total_cost: 0, total_accumulated: 0, total_book_value: 0 } }

      set({
        assets: responseData.assets || [],
        summary: responseData.summary || { total_cost: 0, total_accumulated: 0, total_book_value: 0 },
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch fixed assets'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (filters: FixedAssetsFilters) => {
    set({ filters })
    get().fetchAssets(filters)
  },

  clearError: () => {
    set({ error: null })
  },
}))
