/**
 * Schedules Filters Component
 * Month picker, employee filter, and search
 */
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSchedulesStore } from '../store/schedules-store'

export function SchedulesFilters() {
  const { filters, setFilters, resetFilters } = useSchedulesStore()
  const [localMonth, setLocalMonth] = useState(filters.month ?? '')

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalMonth(value)
  }

  const handleMonthBlur = () => {
    if (localMonth && localMonth.match(/^\d{4}-\d{2}$/)) {
      setFilters({ month: localMonth })
    }
  }

  const handleMonthKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMonthBlur()
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const hasActiveFilters = filters.month || filters.employee_id || filters.search

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Month Picker */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Bulan</label>
        <Input
          type="month"
          value={localMonth}
          onChange={handleMonthChange}
          onBlur={handleMonthBlur}
          onKeyDown={handleMonthKeyDown}
          className="w-[160px]"
        />
      </div>

      {/* Search Input */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Cari Karyawan</label>
        <Input
          placeholder="Nama karyawan..."
          value={filters.search ?? ''}
          onChange={handleSearchChange}
          className="w-[200px]"
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground h-9"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
