/**
 * Employees Filters Component
 * Search controls only
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEmployeesStore } from '../store/employees-store'

export function EmployeesFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useEmployeesStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input - auto search on type */}
      <Input
        placeholder="Search by name, code, or phone..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[280px]"
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
