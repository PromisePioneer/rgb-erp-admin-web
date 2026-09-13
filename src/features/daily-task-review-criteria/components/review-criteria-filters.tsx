/**
 * Daily Task Review Criteria Filters Component
 */
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useReviewCriteriaStore } from '../store/review-criteria-store'

export function ReviewCriteriaFilters() {
  const { filters, setFilters, resetFilters } = useReviewCriteriaStore()

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters({ search: value })
    },
    [setFilters]
  )

  const hasFilters = filters.search || filters.status !== undefined

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) => {
          if (value === 'all') {
            setFilters({ status: undefined })
          } else if (value === 'active' || value === 'inactive') {
            setFilters({ status: value })
          }
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="active">Aktif</SelectItem>
          <SelectItem value="inactive">Tidak Aktif</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
