/**
 * Users Filters Component
 * Search, role, and department filter controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useUsersStore } from '../store/users-store'
import { usersApi } from '../api/users-api'

export function UsersFilters() {
  const { filters, setFilters, resetFilters } = useUsersStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleRoleChange = (value: number | string | null) => {
    if (!value) {
      setFilters({ role_id: undefined })
    } else {
      setFilters({ role_id: Number(value) })
    }
  }

  const handleDepartmentChange = (value: number | string | null) => {
    if (!value) {
      setFilters({ department_id: undefined })
    } else {
      setFilters({ department_id: Number(value) })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.role_id || filters.department_id

  // Load roles for filter
  const loadRoles = async (search: string): Promise<SelectOption[]> => {
    const response = await usersApi.getRolesSelectOptions({ q: search })
    return response.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  // Load departments for filter
  const loadDepartments = async (search: string): Promise<SelectOption[]> => {
    const response = await usersApi.getDepartmentsSelectOptions({ q: search })
    return response.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input */}
      <Input
        placeholder="Search by name or email..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[250px]"
      />

      {/* Role Dropdown */}
      <AsyncSelect
        value={filters.role_id ?? null}
        onChange={handleRoleChange}
        loadOptions={loadRoles}
        placeholder="All Roles"
        className="w-[200px]"
      />

      {/* Department Dropdown */}
      <AsyncSelect
        value={filters.department_id ?? null}
        onChange={handleDepartmentChange}
        loadOptions={loadDepartments}
        placeholder="All Departments"
        className="w-[200px]"
      />

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
