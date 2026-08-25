/**
 * Roles Filters Component
 * Search and status filter controls
 */
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRolesStore } from '../store/roles-store'

export function RolesFilters() {
  const {
    filters,
    setFilters,
    fetchRoles,
    resetFilters,
  } = useRolesStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRoles()
  }

  const handleStatusChange = (value: string | null) => {
    if (!value || value === 'all') {
      setFilters({ status: undefined })
    } else {
      setFilters({ status: Number.parseInt(value, 10) })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.status !== undefined

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-1">
        <Input
          placeholder="Search by name..."
          value={filters.search ?? ''}
          onChange={handleSearchChange}
          className="w-[250px]"
        />
        <Button type="submit" variant="default" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Status Dropdown */}
      <Select
        value={filters.status?.toString() ?? 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="1">Active</SelectItem>
          <SelectItem value="0">Inactive</SelectItem>
        </SelectContent>
      </Select>

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
