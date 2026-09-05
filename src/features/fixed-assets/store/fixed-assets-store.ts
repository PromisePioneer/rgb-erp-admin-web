/**
 * Fixed Assets Store
 * Zustand state management for fixed assets
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface FixedAsset {
  id: number
  code: string
  name: string
  category: string
  tangible_asset_class_id: number | null
  location: string | null
  serial_number: string | null
  description: string | null
  acquisition_date: string
  quantity: number
  unit_price: number
  acquisition_cost: number
  useful_life_months: number // computed from tangible_asset_class
  depreciation_method: string
  asset_account_id: number
  accumulated_depreciation_account_id: number
  depreciation_expense_account_id: number
  salvage_value: number
  accumulated_depreciation: number
  book_value: number
  status: 'active' | 'disposed'
  disposal_date: string | null
  disposal_proceeds: number | null
  asset_account?: { id: number; code: string; name: string }
  accumulated_depreciation_account?: { id: number; code: string; name: string }
  depreciation_expense_account?: { id: number; code: string; name: string }
  tangible_asset_class?: { id: number; name: string; useful_life: number } | null
  created_at: string
  updated_at: string
}

interface FixedAssetsFilters {
  status?: string
  search?: string
  category?: string
}

interface FixedAssetsState {
  // State
  assets: FixedAsset[]
  selectedAsset: FixedAsset | null
  categories: string[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: FixedAssetsFilters

  // Actions
  fetchAssets: (filters?: FixedAssetsFilters) => Promise<void>
  fetchAssetById: (id: number) => Promise<void>
  fetchCategories: () => Promise<void>
  createAsset: (data: FixedAssetFormData) => Promise<void>
  updateAsset: (id: number, data: Partial<FixedAssetFormData>) => Promise<void>
  deleteAsset: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  disposeAsset: (id: number, data: DisposeFormData) => Promise<void>
  calculateDepreciationBatch: () => Promise<BatchResult | null>
  setFilters: (filters: FixedAssetsFilters) => void
  clearError: () => void
  clearSelectedAsset: () => void
}

export interface BatchResult {
  message: string
  assets_processed: number
  total_depreciation: number
  fully_depreciated: Array<{ code: string; name: string; message: string }>
  skipped_periods: Array<{ asset_code: string; period: string; reason: string }>
  asset_details: Array<{ code: string; name: string; months_posted: number; total_depreciation: number }>
}

export interface FixedAssetFormData {
  code: string
  name: string
  category: string
  tangible_asset_class_id?: number
  location?: string
  serial_number?: string
  description?: string
  acquisition_date: string
  quantity: number
  unit_price: number
  depreciation_method: 'straight-line' | 'declining-balance' | 'sum-of-years'
  asset_account_id: number
  accumulated_depreciation_account_id: number
  depreciation_expense_account_id: number
  salvage_value?: number
}

export interface DisposeFormData {
  disposal_date: string
  disposal_proceeds: number
  disposal_notes?: string
  payment_account_id?: number
}

/**
 * Extract error message from API error response
 */
function getErrorMessage(error: any): string {
  // Check for Laravel validation error format
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors
    const messages = Object.values(errors).flat() as string[]
    return messages[0] || 'Validasi gagal'
  }

  // Check for standard error format
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  // Fallback
  return error?.message || 'Terjadi kesalahan'
}

export const useFixedAssetsStore = create<FixedAssetsState>((set, get) => ({
  // Initial state
  assets: [],
  selectedAsset: null,
  categories: [],
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
      if (currentFilters.category) {
        params.set('category', currentFilters.category)
      }

      const { data } = await apiClient.get(`/admin/fixed-assets?${params}`)
      const assets: FixedAsset[] = data.data || []
      set({ assets, isLoading: false })
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch fixed assets'
      set({ error: message, isLoading: false })
    }
  },

  fetchAssetById: async (id: number) => {
    set({ isLoading: true, error: null })

    try {
      const { data } = await apiClient.get(`/admin/fixed-assets/${id}`)
      set({ selectedAsset: data.data, isLoading: false })
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch fixed asset'
      set({ error: message, isLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await apiClient.get('/admin/fixed-assets/categories')
      set({ categories: data.data || [] })
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  },

  createAsset: async (formData: FixedAssetFormData) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post('/admin/fixed-assets', formData)
      await get().fetchAssets()
      await get().fetchCategories()
      set({ isSubmitting: false })
      toast.success('Aktiva tetap berhasil ditambahkan')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to create fixed asset'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  updateAsset: async (id: number, formData: Partial<FixedAssetFormData>) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.put(`/admin/fixed-assets/${id}`, formData)
      await get().fetchAssets()
      set({ isSubmitting: false })
      toast.success('Aktiva tetap berhasil diperbarui')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to update fixed asset'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  deleteAsset: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.delete(`/admin/fixed-assets/${id}`)
      await get().fetchAssets()
      await get().fetchCategories()
      set({ isSubmitting: false })
      toast.success('Aktiva tetap berhasil dihapus')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to delete fixed asset'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post('/admin/fixed-assets/bulk-delete', { ids })
      await get().fetchAssets()
      await get().fetchCategories()
      set({ isSubmitting: false })
      toast.success(`${ids.length} aktiva tetap berhasil dihapus`)
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to delete fixed assets'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  disposeAsset: async (id: number, formData: DisposeFormData) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post(`/admin/fixed-assets/${id}/dispose`, formData)
      await get().fetchAssets()
      set({ isSubmitting: false })
      toast.success('Aktiva tetap berhasil dilepaskan')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to dispose fixed asset'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  calculateDepreciationBatch: async (): Promise<BatchResult | null> => {
    set({ isSubmitting: true, error: null })
    try {
      const { data } = await apiClient.post('/admin/fixed-assets/calculate-depreciation-batch', {})
      await get().fetchAssets()
      set({ isSubmitting: false })
      return data.data as BatchResult
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 422 || status === 403) {
        toast.error(getErrorMessage(error))
      }
      const message = error instanceof Error ? error.message : 'Failed to calculate depreciation batch'
      set({ error: message, isSubmitting: false })
      return null
    }
  },

  setFilters: (filters: FixedAssetsFilters) => {
    set({ filters })
    get().fetchAssets(filters)
  },

  clearError: () => {
    set({ error: null })
  },

  clearSelectedAsset: () => {
    set({ selectedAsset: null })
  },
}))
