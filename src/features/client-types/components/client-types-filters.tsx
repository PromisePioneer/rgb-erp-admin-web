/**
 * Client Types Filters Component
 * Search filter controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClientTypesStore } from '../store/client-types-store'

export function ClientTypesFilters() {
  const { filters, setFilters, resetFilters } =
    useClientTypesStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setFilters({ status: value })
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.status !== undefined

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input */}
      <Input
        placeholder="Search by name..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[250px]"
      />

      {/* Status Filter */}
      <select
        value={filters.status ?? ''}
        onChange={handleStatusChange}
        className="flex h-11 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">All Status</option>
        <option value={1}>Active</option>
        <option value={0}>Inactive</option>
      </select>

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
