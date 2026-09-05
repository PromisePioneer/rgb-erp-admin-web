/**
 * Schedules Store
 * Zustand state management for schedules
 */
import { create } from 'zustand'
import type {
  Schedule,
  SchedulesFilters,
  SchedulesPagination,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  EmployeeScheduleRow,
} from '../types/schedules.types'
import { schedulesApi } from '../api/schedules-api'

interface SchedulesState {
  // State
  items: Schedule[]
  selectedItem: Schedule | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: SchedulesFilters
  pagination: SchedulesPagination

  // Calendar view state
  calendarEmployees: EmployeeScheduleRow[]
  calendarDates: string[]

  // Current month (YYYY-MM format)
  currentMonth: string

  // Area filter state
  selectedAreaId: number | null

  // Actions
  fetchSchedules: (params?: SchedulesFilters) => Promise<void>
  fetchCalendarData: (params?: { month?: string; search?: string }) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateSchedulePayload) => Promise<void>
  update: (id: number, payload: UpdateSchedulePayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<SchedulesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
  setSelectedAreaId: (areaId: number | null) => void

  // Calendar helpers
  getFilteredCalendarRows: () => EmployeeScheduleRow[]
  getUniqueAreas: () => { area_id: number; area_name: string }[]

  // Month navigation
  prevMonth: () => void
  nextMonth: () => void
  goToMonth: (month: string) => void
  getCurrentMonthLabel: () => string
}

const initialFilters: SchedulesFilters = {
  page: 1,
  per_page: 100,
}

const initialPagination: SchedulesPagination = {
  current_page: 1,
  per_page: 100,
  total: 0,
  last_page: 1,
}

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  calendarEmployees: [],
  calendarDates: [],
  currentMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
  selectedAreaId: null,

  // Actions
  fetchSchedules: async (params?: SchedulesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await schedulesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch schedules'
      set({ error: message, isLoading: false })
    }
  },

  fetchCalendarData: async (params?: { month?: string; search?: string }) => {
    set({ isLoading: true, error: null })

    try {
      const monthParam = params?.month ?? get().currentMonth

      const response = await schedulesApi.getEmployeesByPlacement({
        month: monthParam,
        search: params?.search,
      })

      set({
        calendarEmployees: response.data.employees,
        calendarDates: response.data.dates,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch calendar data'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await schedulesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch schedule'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateSchedulePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.create(payload)
      set({ isSubmitting: false })
      await get().fetchCalendarData({ month: get().currentMonth })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create schedule'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateSchedulePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.update(id, payload)
      set({ isSubmitting: false })
      await get().fetchCalendarData({ month: get().currentMonth })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update schedule'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchCalendarData({ month: get().currentMonth })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete schedule'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await schedulesApi.bulkDelete(ids)
      set({ isSubmitting: false })
      await get().fetchCalendarData({ month: get().currentMonth })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete schedules'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<SchedulesFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  resetForm: () => {
    set({ selectedItem: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },

  setSelectedAreaId: (areaId: number | null) => {
    set({ selectedAreaId: areaId })
  },

  // Calendar helpers
  getFilteredCalendarRows: () => {
    const { calendarEmployees, selectedAreaId } = get()
    if (!selectedAreaId) {
      return calendarEmployees
    }
    return calendarEmployees.filter((row) => row.area_id === selectedAreaId)
  },

  getUniqueAreas: () => {
    const { calendarEmployees } = get()
    const areaMap = new Map<number, string>()

    calendarEmployees.forEach((row) => {
      if (row.area_id && row.area_name) {
        areaMap.set(row.area_id, row.area_name)
      }
    })

    return Array.from(areaMap.entries())
      .map(([area_id, area_name]) => ({ area_id, area_name }))
      .sort((a, b) => a.area_name.localeCompare(b.area_name))
  },

  // Month navigation
  prevMonth: () => {
    const [year, month] = get().currentMonth.split('-').map(Number)
    const prevMonthNum = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    set({ currentMonth: `${prevYear}-${String(prevMonthNum).padStart(2, '0')}` })
  },

  nextMonth: () => {
    const [year, month] = get().currentMonth.split('-').map(Number)
    const nextMonthNum = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    set({ currentMonth: `${nextYear}-${String(nextMonthNum).padStart(2, '0')}` })
  },

  goToMonth: (month: string) => {
    set({ currentMonth: month })
  },

  getCurrentMonthLabel: () => {
    const MONTHS = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const [year, month] = get().currentMonth.split('-').map(Number)
    return `${MONTHS[month - 1]} ${year}`
  },
}))
