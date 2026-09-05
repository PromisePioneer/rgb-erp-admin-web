/**
 * Products Store
 * Zustand state management for products
 */
import { create } from 'zustand'
import type {
  Product,
  ProductsFilters,
  ProductsPagination,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/products.types'
import { productsApi } from '../api/products-api'

interface ProductsState {
  // State
  items: Product[]
  selectedItem: Product | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: ProductsFilters
  pagination: ProductsPagination

  // Actions
  fetchProducts: (params?: ProductsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateProductPayload) => Promise<void>
  update: (id: number, payload: UpdateProductPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<ProductsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: ProductsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: ProductsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchProducts: async (params?: ProductsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await productsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch products'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await productsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch product'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateProductPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await productsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProducts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create product'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateProductPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await productsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProducts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update product'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await productsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProducts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete product'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await productsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchProducts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete products'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ProductsFilters>) => {
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
