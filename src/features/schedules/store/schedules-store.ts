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

  // Week navigation state
  currentDate: string // ISO date string for determining current week

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
  getCalendarRows: () => EmployeeScheduleRow[]
  getFilteredCalendarRows: () => EmployeeScheduleRow[]
  getMonthDates: () => string[]
  getUniqueAreas: () => { area_id: number; area_name: string }[]

  // Week navigation
  getWeekDates: () => string[]
  prevWeek: () => void
  nextWeek: () => void
  goToWeek: (date: string) => void
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
  currentDate: new Date().toISOString().split('T')[0],
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
      // Convert YYYY-MM-DD to YYYY-MM format for API
      let monthParam = params?.month ?? get().filters.month
      if (monthParam && monthParam.length === 10) {
        monthParam = monthParam.substring(0, 7) // YYYY-MM-DD -> YYYY-MM
      }

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
      // Refresh calendar with current month
      const currentMonth = get().currentDate.substring(0, 7)
      await get().fetchCalendarData({ month: currentMonth })
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
      // Refresh calendar with current month
      const currentMonth = get().currentDate.substring(0, 7)
      await get().fetchCalendarData({ month: currentMonth })
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
      // Refresh calendar with current month
      const currentMonth = get().currentDate.substring(0, 7)
      await get().fetchCalendarData({ month: currentMonth })
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
      // Refresh calendar with current month
      const currentMonth = get().currentDate.substring(0, 7)
      await get().fetchCalendarData({ month: currentMonth })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete schedules'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<SchedulesFilters>) => {
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

  setSelectedAreaId: (areaId: number | null) => {
    set({ selectedAreaId: areaId })
  },

  // Calendar helpers
  getMonthDates: () => {
    return get().calendarDates.length > 0
      ? get().calendarDates
      : []
  },

  getCalendarRows: () => {
    return get().calendarEmployees
  },

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

  // Week navigation helpers
  getWeekDates: () => {
    const current = new Date(get().currentDate)
    const day = current.getDay()
    // Get Monday of current week (Sunday = 0, Monday = 1, etc.)
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(current)
    monday.setDate(current.getDate() + diff)

    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  },

  prevWeek: () => {
    const current = new Date(get().currentDate)
    current.setDate(current.getDate() - 7)
    set({ currentDate: current.toISOString().split('T')[0] })
  },

  nextWeek: () => {
    const current = new Date(get().currentDate)
    current.setDate(current.getDate() + 7)
    set({ currentDate: current.toISOString().split('T')[0] })
  },

  goToWeek: (date: string) => {
    set({ currentDate: date })
  },
}))
