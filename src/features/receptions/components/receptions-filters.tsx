/**
 * Receptions Filters Component
 * Search and filter controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useReceptionsStore } from '../store/receptions-store'

export function ReceptionsFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useReceptionsStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ start_date: e.target.value || undefined })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ end_date: e.target.value || undefined })
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.start_date || filters.end_date

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input */}
      <Input
        placeholder="Cari kode / no. PO..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[200px]"
      />

      {/* Start Date */}
      <Input
        type="date"
        value={filters.start_date ?? ''}
        onChange={handleStartDateChange}
        className="w-[150px]"
        placeholder="Tanggal mulai"
      />

      {/* End Date */}
      <Input
        type="date"
        value={filters.end_date ?? ''}
        onChange={handleEndDateChange}
        className="w-[150px]"
        placeholder="Tanggal selesai"
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
