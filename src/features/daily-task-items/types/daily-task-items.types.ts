/**
 * Daily Task Items Types
 */

export interface DailyTaskItem {
  id: number
  name: string
  description: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface DailyTaskItemDetail extends DailyTaskItem {
  // Additional fields if needed
}

export interface DailyTaskItemsFilters {
  search?: string
  status?: string
  page?: number
  per_page?: number
}

export interface CreateDailyTaskItem {
  name: string
  description?: string | null
  status: 'active' | 'inactive'
}

export interface UpdateDailyTaskItem extends CreateDailyTaskItem {}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: Pagination
  error?: string
  message?: string
}

export interface SelectOption {
  value: number
  label: string
}
