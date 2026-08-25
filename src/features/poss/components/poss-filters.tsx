/**
 * Poss Filters Component
 * Search and status filter controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePossStore } from '@/features/poss'

export function PossFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = usePossStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleStatusChange = (value: string | null) => {
    if (!value || value === 'all') {
      setFilters({ status: undefined })
    } else {
      setFilters({ status: value })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.status

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input */}
      <Input
        placeholder="Search by name..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-62.5"
      />

      {/* Status Dropdown */}
      <Select
        value={filters.status ?? 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="1">Aktif</SelectItem>
          <SelectItem value="0">Tidak Aktif</SelectItem>
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
