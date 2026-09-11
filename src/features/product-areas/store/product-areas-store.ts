/**
 * Product Areas Zustand Store
 * State management for product areas (stok per area/client)
 */
import { create } from 'zustand'
import { productAreasApi } from '../api/product-areas-api'
import type {
  ProductArea,
  ProductAreaDetail,
  ProductAreasFilters,
  ProductAreasPagination,
  ProductAreaStockItem,
  AreaOption,
  ClientOption,
} from '../types/product-areas.types'

interface ProductAreasState {
  // List state
  items: ProductArea[]
  isLoading: boolean
  error: string | null
  filters: ProductAreasFilters
  pagination: ProductAreasPagination

  // Detail state
  selectedItem: ProductAreaDetail | null

  // Select options
  areaOptions: AreaOption[]
  clientOptions: ClientOption[]
  stockByArea: ProductAreaStockItem[]

  // Actions
  fetchItems: (params?: ProductAreasFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: Parameters<typeof productAreasApi.create>[0]) => Promise<ProductArea | null>
  update: (
    id: number,
    payload: Parameters<typeof productAreasApi.update>[1]
  ) => Promise<ProductArea | null>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<ProductAreasFilters>) => void
  reset: () => void

  // Select options
  fetchAreaOptions: () => Promise<void>
  fetchClientOptions: () => Promise<void>
  fetchStockByArea: (areaId: number, params?: { q?: string; category_type?: number }) => Promise<void>
}

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  filters: {} as ProductAreasFilters,
  pagination: {
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 1,
  },
  selectedItem: null,
  areaOptions: [],
  clientOptions: [],
  stockByArea: [],
}

export const useProductAreasStore = create<ProductAreasState>((set, get) => ({
  ...initialState,

  fetchItems: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const filters = { ...get().filters, ...params }
      const response = await productAreasApi.getList(filters)
      set({
        items: response.data,
        pagination: response.meta ?? {
          current_page: 1,
          per_page: 25,
          total: 0,
          last_page: 1,
        },
        isLoading: false,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch product areas'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await productAreasApi.getById(id)
      set({ selectedItem: response.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch product area'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const response = await productAreasApi.create(payload)
      await get().fetchItems()
      set({ isLoading: false })
      return response.data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create product area'
      set({ error: message, isLoading: false })
      return null
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null })
    try {
      const response = await productAreasApi.update(id, payload)
      await get().fetchItems()
      set({ isLoading: false })
      return response.data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update product area'
      set({ error: message, isLoading: false })
      return null
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await productAreasApi.delete(id)
      await get().fetchItems()
      set({ isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete product area'
      set({ error: message, isLoading: false })
    }
  },

  bulkDelete: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await productAreasApi.bulkDelete(ids)
      await get().fetchItems()
      set({ isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete product areas'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } })
  },

  reset: () => {
    set(initialState)
  },

  // Select options
  fetchAreaOptions: async () => {
    try {
      const response = await productAreasApi.getAreasOptions()
      set({ areaOptions: response.data })
    } catch (error) {
      console.error('Failed to fetch area options:', error)
    }
  },

  fetchClientOptions: async () => {
    try {
      const response = await productAreasApi.getClientsOptions()
      set({ clientOptions: response.data })
    } catch (error) {
      console.error('Failed to fetch client options:', error)
    }
  },

  fetchStockByArea: async (areaId, params) => {
    try {
      const response = await productAreasApi.getByArea(areaId, params)
      set({ stockByArea: response.data })
    } catch (error) {
      console.error('Failed to fetch stock by area:', error)
      set({ stockByArea: [] })
    }
  },
}))
