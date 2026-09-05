/**
 * Daily Task Items Types
 */

// Status constants
export const STATUS_ACTIVE = 1
export const STATUS_INACTIVE = 2
export const STATUS_LABELS: Record<number, string> = {
  [STATUS_ACTIVE]: "Aktif",
  [STATUS_INACTIVE]: "Tidak Aktif",
}

export interface DailyTaskItem {
  id: number
  name: string
  description: string | null
  status: number // 1 = active, 2 = inactive
  status_label: string
  role_id: number | null
  role_name: string | null
  created_at: string
  updated_at: string
}

export interface DailyTaskItemDetail extends DailyTaskItem {
  // Additional fields if needed
}

export interface DailyTaskItemsFilters {
  search?: string
  status?: number // 1 = active, 2 = inactive
  role_id?: number
  page?: number
  per_page?: number
}

export interface CreateDailyTaskItem {
  name: string
  description?: string | null
  status: number // 1 = active, 2 = inactive
  role_id?: number | null
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
