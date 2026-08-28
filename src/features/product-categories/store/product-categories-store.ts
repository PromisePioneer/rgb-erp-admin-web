/**
 * Product Categories Store
 * Zustand state management for product categories
 */
import { create } from 'zustand'
import type {
  ProductCategory,
  ProductCategoriesFilters,
  ProductCategoriesPagination,
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
} from '../types/product-categories.types'
import { productCategoriesApi } from '../api/product-categories-api'

interface ProductCategoriesState {
  // State
  items: ProductCategory[]
  selectedItem: ProductCategory | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: ProductCategoriesFilters
  pagination: ProductCategoriesPagination

  // Actions
  fetchProductCategories: (params?: ProductCategoriesFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateProductCategoryPayload) => Promise<void>
  update: (id: number, payload: UpdateProductCategoryPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<ProductCategoriesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: ProductCategoriesFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: ProductCategoriesPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useProductCategoriesStore = create<ProductCategoriesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchProductCategories: async (params?: ProductCategoriesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await productCategoriesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch product categories'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await productCategoriesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch product category'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateProductCategoryPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await productCategoriesApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProductCategories()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create product category'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateProductCategoryPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await productCategoriesApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProductCategories()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update product category'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await productCategoriesApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProductCategories()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete product category'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await productCategoriesApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProductCategories()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete product categories'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ProductCategoriesFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    // Reset to page 1 when changing filters (except page itself)
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  resetForm: () => {
    set({
      selectedItem: null,
      error: null,
    })
  },


  clearError: () => {
    set({ error: null })
  },
}))
