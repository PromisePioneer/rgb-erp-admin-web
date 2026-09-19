/**
 * Daily Task Items Filters Component
 * Search and status filter controls with AsyncSelect
 */
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption as AsyncSelectOption } from '@/components/async-select'
import { useDailyTaskItemsStore } from '../store/daily-task-items-store'
import { rolesApi } from '@/features/roles'

export function DailyTaskItemsFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useDailyTaskItemsStore()

  // Load role options for filter
  const loadRoleOptions = async (_search: string): Promise<AsyncSelectOption[]> => {
    try {
      const response = await rolesApi.getSelectOptions()
      if (response.success) {
        return [
          { value: 'all', label: 'Semua Role' },
          ...response.data.map((role) => ({
            value: role.id,
            label: role.name,
          })),
        ]
      }
      return []
    } catch {
      return []
    }
  }

  // Load status options
  const loadStatusOptions = async (_search: string): Promise<AsyncSelectOption[]> => {
    return [
      { value: 'all', label: 'Semua Status' },
      { value: 'active', label: 'Aktif' },
      { value: 'inactive', label: 'Tidak Aktif' },
    ]
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleStatusChange = (value: number | string | null) => {
    if (!value || value === 'all') {
      setFilters({ status: undefined })
    } else {
      setFilters({ status: value as 'active' | 'inactive' })
    }
  }

  const handleRoleChange = (value: number | string | null) => {
    if (!value || value === 'all') {
      setFilters({ role_id: undefined })
    } else {
      setFilters({ role_id: Number(value) })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.status !== undefined || filters.role_id !== undefined

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Form */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama..."
          value={filters.search ?? ''}
          onChange={handleSearchChange}
          className="w-[250px] pl-9"
        />
      </div>

      {/* Role Dropdown - AsyncSelect */}
      <div className="w-[180px]">
        <AsyncSelect
          value={filters.role_id}
          onChange={handleRoleChange}
          loadOptions={loadRoleOptions}
          placeholder="Semua Role"
          defaultOptions
        />
      </div>

      {/* Status Dropdown - AsyncSelect */}
      <div className="w-[160px]">
        <AsyncSelect
          value={filters.status ?? 'all'}
          onChange={handleStatusChange}
          loadOptions={loadStatusOptions}
          placeholder="Semua Status"
          defaultOptions
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
