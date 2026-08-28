/**
 * Tangible Asset Classes Store
 */
import { create } from 'zustand'
import { tangibleAssetClassApi } from '../api/tangible-asset-class-api'
import type { TangibleAssetClass, TangibleAssetClassFormData } from '../types/tangible-asset-class.types'
import { toast } from 'sonner'

interface TangibleAssetClassesState {
  items: TangibleAssetClass[]
  selectedItem: TangibleAssetClass | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  fetchItems: () => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: TangibleAssetClassFormData) => Promise<void>
  update: (id: number, payload: Partial<TangibleAssetClassFormData>) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  clearError: () => void
  clearSelectedItem: () => void
}

function getErrorMessage(error: any): string {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors
    const messages = Object.values(errors).flat() as string[]
    return messages[0] || 'Validasi gagal'
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  return error?.message || 'Terjadi kesalahan'
}

export const useTangibleAssetClassesStore = create<TangibleAssetClassesState>((set, get) => ({
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await tangibleAssetClassApi.getList()
      set({ items: response.data, isLoading: false })
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      set({ error: getErrorMessage(error), isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tangibleAssetClassApi.getById(id)
      set({ selectedItem: response.data, isLoading: false })
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      set({ error: getErrorMessage(error), isLoading: false })
    }
  },

  create: async (payload: TangibleAssetClassFormData) => {
    set({ isSubmitting: true, error: null })
    try {
      await tangibleAssetClassApi.create(payload)
      await get().fetchItems()
      toast.success('Kelas aktiva berhasil ditambahkan')
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      set({ error: getErrorMessage(error), isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: Partial<TangibleAssetClassFormData>) => {
    set({ isSubmitting: true, error: null })
    try {
      await tangibleAssetClassApi.update(id, payload)
      await get().fetchItems()
      toast.success('Kelas aktiva berhasil diperbarui')
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      set({ error: getErrorMessage(error), isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await tangibleAssetClassApi.delete(id)
      await get().fetchItems()
      toast.success('Kelas aktiva berhasil dihapus')
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      set({ error: getErrorMessage(error), isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })
    try {
      await tangibleAssetClassApi.bulkDelete(ids)
      await get().fetchItems()
      toast.success(`${ids.length} kelas aktiva berhasil dihapus`)
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      set({ error: getErrorMessage(error), isSubmitting: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  clearSelectedItem: () => set({ selectedItem: null }),
}))
