/**
 * MOU Store
 * Zustand store for MOU management
 */
import { create } from 'zustand'
import { useState } from 'react'
import { mouApi } from '../api/mou-api'
import { useCompanyStore } from '@/stores/company-store'
import type {
  Mou,
  MouDetail,
  MouFilters,
  MouPagination,
  CreateMouPayload,
  CreateMouShiftPayload,
  CreateMouPersonnelPayload,
  ClientOption,
  RoleOption,
} from '../types/mou.types'

interface MouState {
  // List data
  items: Mou[]
  pagination: MouPagination
  isLoading: boolean

  // Detail data
  selectedItem: MouDetail | null

  // Filters
  filters: MouFilters

  // Form state
  isSubmitting: boolean
  error: string | null

  // Actions
  fetchMous: (filters?: MouFilters) => Promise<void>
  fetchMouById: (id: number) => Promise<MouDetail | null>
  createMou: (payload: CreateMouPayload) => Promise<Mou | null>
  updateMou: (id: number, payload: CreateMouPayload) => Promise<Mou | null>
  deleteMou: (id: number) => Promise<boolean>
  setFilters: (filters: Partial<MouFilters>) => void
  clearError: () => void
  resetForm: () => void
}

const defaultPagination: MouPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

const defaultFilters: MouFilters = {
  search: '',
  status: 1,
}

export const useMouStore = create<MouState>((set, get) => ({
  // Initial state
  items: [],
  pagination: defaultPagination,
  isLoading: false,
  selectedItem: null,
  filters: defaultFilters,
  isSubmitting: false,
  error: null,

  // Fetch MOU list
  fetchMous: async (filters?: MouFilters) => {
    const { filters: currentFilters } = get()
    const params = filters ?? currentFilters

    set({ isLoading: true, error: null })
    try {
      const response = await mouApi.getList(params)
      set({
        items: response.data,
        pagination: response.meta ?? defaultPagination,
        filters: params,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch MOUs'
      set({ error: message })
      console.error('fetchMous error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // Fetch MOU by ID
  fetchMouById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await mouApi.getById(id)
      set({ selectedItem: response.data })
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch MOU details'
      set({ error: message })
      console.error('fetchMouById error:', error)
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  // Create MOU
  createMou: async (payload: CreateMouPayload) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await mouApi.create(payload)
      // Refresh list
      await get().fetchMous()
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create MOU'
      set({ error: message })
      console.error('createMou error:', error)
      return null
    } finally {
      set({ isSubmitting: false })
    }
  },

  // Update MOU
  updateMou: async (id: number, payload: CreateMouPayload) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await mouApi.update(id, payload)
      // Refresh list
      await get().fetchMous()
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update MOU'
      set({ error: message })
      console.error('updateMou error:', error)
      return null
    } finally {
      set({ isSubmitting: false })
    }
  },

  // Delete MOU
  deleteMou: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await mouApi.delete(id)
      // Refresh list
      await get().fetchMous()
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete MOU'
      set({ error: message })
      console.error('deleteMou error:', error)
      return false
    } finally {
      set({ isSubmitting: false })
    }
  },

  // Set filters
  setFilters: (filters: Partial<MouFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Reset form
  resetForm: () => {
    set({
      selectedItem: null,
      error: null,
    })
  },
}))

// Wizard helper hooks
export const useMouWizard = () => {
  const { isSubmitting, error, clearError } = useMouStore()

  // Default wizard state
  const getDefaultWizardState = (clientId?: number) => ({
    // Step 1: MOU Header
    client_id: clientId ?? null,
    first_party_name: '',
    first_party_position: '',
    first_party_company_address: '',
    second_party_name: '',
    second_party_position: '',
    second_party_company_address: '',
    monthly_fee: null,
    start_date: '',
    end_date: '',
    management_fee: 10,
    pph23: 2,
    ppn: 11,
    date: new Date().toISOString().split('T')[0],

    // Step 2: MOU Shifts
    shifts: [] as CreateMouShiftPayload[],

    // Step 3: MOU Personnel
    personnel: [] as CreateMouPersonnelPayload[],

    // Step 4: Employees (placeholder for now)
    employees: [],
  })

  return {
    isSubmitting,
    error,
    clearError,
    getDefaultWizardState,
  }
}

// Select options hooks
export const useMouSelectOptions = () => {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)

  const currentCompany = useCompanyStore((state) => state.currentCompany)

  const fetchClients = async (search?: string) => {
    setIsLoadingClients(true)
    try {
      const response = await mouApi.getClientsSelectOptions({ q: search })
      setClients(response.data)
    } catch (error) {
      console.error('fetchClients error:', error)
    } finally {
      setIsLoadingClients(false)
    }
  }

  const fetchRoles = async (search?: string) => {
    setIsLoadingRoles(true)
    try {
      const response = await mouApi.getRolesSelectOptions({
        q: search,
        company_id: currentCompany?.id,
      })
      setRoles(response.data)
    } catch (error) {
      console.error('fetchRoles error:', error)
    } finally {
      setIsLoadingRoles(false)
    }
  }

  return {
    clients,
    roles,
    isLoadingClients,
    isLoadingRoles,
    fetchClients,
    fetchRoles,
  }
}
