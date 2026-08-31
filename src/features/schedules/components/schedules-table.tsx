/**
 * Schedules Table Component - Weekly Grid View
 * Displays employee schedules in a weekly grid format with color-coded shifts
 */
import { useEffect, useState } from 'react'
import { Plus, Search, X, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useSchedulesStore } from '@/features/schedules/store/schedules-store'
import { SchedulesFormModal } from '@/features/schedules/components/schedules-form-modal'
import {
  SchedulesWeekNav,
  WeekHeaderRow,
} from '@/features/schedules/components/schedules-week-nav'
import {
  SchedulesGridCell,
  EmployeeRowHeader,
  GridLoadingSkeleton,
} from '@/features/schedules/components/schedules-grid-cell'
import type { CalendarSchedule, EmployeeScheduleRow } from '@/features/schedules/types/schedules.types'

export function SchedulesTable() {
  const {
    isLoading,
    fetchCalendarData,
    filters,
    getWeekDates,
    resetFilters,
    currentDate,
    selectedAreaId,
    setSelectedAreaId,
    getUniqueAreas,
    getFilteredCalendarRows,
  } = useSchedulesStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingScheduleId, setEditingScheduleId] = useState<number | undefined>(undefined)
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | undefined>(undefined)
  const [editingDate, setEditingDate] = useState<string | undefined>(undefined)

  const weekDates = getWeekDates()
  const areas = getUniqueAreas()
  const calendarRows = getFilteredCalendarRows()

  // Fetch data when week changes
  useEffect(() => {
    fetchCalendarData({ month: currentDate, search: searchQuery || undefined })
  }, [currentDate, searchQuery])

  // Handle cell click to open form
  const handleCellClick = (
    employeeId: number,
    date: string,
    scheduleId: number | null
  ) => {
    setEditingEmployeeId(employeeId)
    setEditingDate(date)
    setEditingScheduleId(scheduleId ?? undefined)
    setFormMode(scheduleId ? 'edit' : 'create')
    setShowFormModal(true)
  }

  // Handle add new button
  const handleAddNew = () => {
    setEditingScheduleId(undefined)
    setEditingEmployeeId(undefined)
    setEditingDate(undefined)
    setFormMode('create')
    setShowFormModal(true)
  }

  // Handle reset filters
  const handleReset = () => {
    setSearchQuery('')
    setSelectedAreaId(null)
    resetFilters()
  }

  const hasActiveFilters = searchQuery || filters.search || selectedAreaId

  // Get schedule for a specific employee and date
  const getSchedule = (
    row: EmployeeScheduleRow,
    date: string
  ): CalendarSchedule | null | undefined => {
    return row.schedules[date]
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Scheduler
          </h1>
        </div>

        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Area Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedAreaId?.toString() ?? 'all'}
            onValueChange={(value) => {
              if (!value || value === 'all') {
                setSelectedAreaId(null)
              } else {
                const parsed = parseInt(value, 10)
                setSelectedAreaId(isNaN(parsed) ? null : parsed)
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Area</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area.area_id} value={area.area_id.toString()}>
                  {area.area_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAreaId && (
            <Badge variant="secondary" className="text-xs">
              1 filter
            </Badge>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari karyawan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>

      {/* Week Navigation */}
      <SchedulesWeekNav />

      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        Klik tanggal untuk menambah atau mengubah jadwal. Data dikelompokkan per minggu.
      </p>

      {/* Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Loading state */}
        {isLoading ? (
          <GridLoadingSkeleton />
        ) : calendarRows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada data jadwal</p>
            <p className="text-sm">Pilih minggu lain atau tambah jadwal baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header Row */}
              <div className="flex bg-gray-50">
                <WeekHeaderRow />
              </div>

              {/* Employee Rows */}
              {calendarRows.map((row) => (
                <div key={row.employee_id} className="flex">
                  {/* Employee info */}
                  <EmployeeRowHeader
                    employeeName={row.employee_name}
                    employeeCode={row.employee_code}
                  />

                  {/* Day cells */}
                  {weekDates.map((date) => (
                    <SchedulesGridCell
                      key={`${row.employee_id}-${date}`}
                      date={date}
                      employeeId={row.employee_id}
                      employeeName={row.employee_name}
                      schedule={getSchedule(row, date)}
                      onCellClick={handleCellClick}
                    />
                  ))}
                </div>
              ))}

              {/* Stats footer */}
              <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
                <span>{calendarRows.length} karyawan</span>
                <span>
                  {calendarRows.reduce(
                    (sum, row) =>
                      sum + Object.values(row.schedules).filter(Boolean).length,
                    0
                  )}{' '}
                  jadwal
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>Regular</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>OT / Lembur</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-gray-400 rounded" />
          <span>Day Off</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-pink-300 rounded" />
          <span>Senin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-purple-500 rounded" />
          <span>Selasa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded" />
          <span>Belum ada jadwal (klik untuk tambah)</span>
        </div>
      </div>

      {/* Form Modal */}
      <SchedulesFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        scheduleId={editingScheduleId}
        defaultEmployeeId={editingEmployeeId}
        defaultDate={editingDate}
      />
    </div>
  )
}
