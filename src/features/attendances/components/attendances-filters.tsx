/**
 * Attendances Filters Component
 * Month picker and employee filter
 */
import { useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAttendancesStore } from '../store/attendances-store'

export function AttendancesFilters() {
  const { filters, setFilters, resetFilters } = useAttendancesStore()
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
    setFilters({ q: e.target.value || undefined })
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/attendance/export?month=${filters.month}`, {
        credentials: 'include',
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-${filters.month}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const hasActiveFilters = filters.month || filters.employee_id || filters.q

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

      {/* Employee Search */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Cari Karyawan</label>
        <Input
          placeholder="Nama karyawan..."
          value={filters.q ?? ''}
          onChange={handleSearchChange}
          className="w-[200px]"
        />
      </div>

      {/* Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="h-9"
      >
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

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
