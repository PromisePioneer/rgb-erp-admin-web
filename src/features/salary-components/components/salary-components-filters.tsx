/**
 * Salary Components Filters Component
 * Search controls with type filter
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSalaryComponentsStore } from '../store/salary-components-store'

export function SalaryComponentsFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useSalaryComponentsStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) {
      setFilters({ type: undefined })
    } else {
      setFilters({ type: value as 'earning' | 'deduction' })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.type

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input - auto search on type */}
      <Input
        placeholder="Search by name..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[250px]"
      />

      {/* Type Filter */}
      <select
        value={filters.type ?? ''}
        onChange={handleTypeChange}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[160px]"
      >
        <option value="">All Types</option>
        <option value="earning">Earning</option>
        <option value="deduction">Deduction</option>
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
