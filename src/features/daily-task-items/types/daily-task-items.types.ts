/**
 * Daily Task Items Types
 */

// Status constants - string to match backend enum
export const STATUS_ACTIVE = 'active'
export const STATUS_INACTIVE = 'inactive'
export const STATUS_LABELS: Record<string, string> = {
  [STATUS_ACTIVE]: "Aktif",
  [STATUS_INACTIVE]: "Tidak Aktif",
}

export interface DailyTaskItem {
  id: number
  name: string
  description: string | null
  status: 'active' | 'inactive'  // string to match backend enum
  status_label: string
  role_id: number | null
  role_name: string | null
  parent_item_id: number | null
  parent_item_name: string | null
  is_root: boolean
  has_children: boolean
  created_at: string
  updated_at: string
}

export interface DailyTaskItemDetail extends DailyTaskItem {
  children?: Pick<DailyTaskItem, 'id' | 'name'>[]
}

export interface DailyTaskItemsFilters {
  search?: string
  status?: 'active' | 'inactive'
  role_id?: number
  page?: number
  per_page?: number
}

export interface CreateDailyTaskItem {
  name: string
  description?: string | null
  status: 'active' | 'inactive'
  role_id?: number | null
  parent_item_id?: number | null
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
  id: number
  name: string
  text: string
  is_root?: boolean
  status?: 'active' | 'inactive'
}
