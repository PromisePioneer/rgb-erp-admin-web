/**
 * Schedules Table Component - Monthly Grid View
 * Displays employee schedules in a monthly grid format with color-coded shifts
 */
import { useEffect, useState, useMemo } from 'react'
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
import { SchedulesMonthNav } from '@/features/schedules/components/schedules-month-nav'
import { SchedulesToolbar } from '@/features/schedules/components/schedules-toolbar'
import type { CalendarSchedule, EmployeeScheduleRow } from '@/features/schedules/types/schedules.types'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function SchedulesTable() {
  const {
    isLoading,
    fetchCalendarData,
    filters,
    resetFilters,
    currentMonth,
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

  const areas = getUniqueAreas()
  const calendarRows = getFilteredCalendarRows()

  // Generate month dates directly
  const monthDates = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const dates: string[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    }
    return dates
  }, [currentMonth])

  // Fetch data when month changes
  useEffect(() => {
    fetchCalendarData({ month: currentMonth, search: searchQuery || undefined })
  }, [currentMonth, searchQuery])

  // Group dates by week for grid layout
  const weeks = useMemo(() => {
    const result: string[][] = []
    let currentWeek: string[] = []

    monthDates.forEach((date) => {
      const dayOfWeek = new Date(date + 'T00:00:00').getDay()

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(date)
    })

    // Push last week
    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [monthDates])

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

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0]
  }

  // Get first day offset (which day of week does the month start)
  const firstDayOffset = monthDates.length > 0
    ? new Date(monthDates[0] + 'T00:00:00').getDay()
    : 0

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

      {/* Month Navigation */}
      <SchedulesMonthNav />

      {/* Import/Export Toolbar */}
      <SchedulesToolbar currentMonth={currentMonth} onRefresh={() => fetchCalendarData({ month: currentMonth, search: searchQuery || undefined })} />

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

      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        Klik tanggal untuk menambah atau mengubah jadwal. Data dikelompokkan per bulan.
      </p>

      {/* Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Loading state */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-muted-foreground">Memuat jadwal...</p>
          </div>
        ) : calendarRows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada data jadwal</p>
            <p className="text-sm">Pilih bulan lain atau tambah jadwal baru</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-400px)]">
            <div className="min-w-[800px]">
              {/* Header Row - Day names */}
              <div className="flex bg-gray-100 sticky top-0 z-10">
                {/* Employee name header */}
                <div className="sticky left-0 bg-gray-100 z-20 px-4 py-3 font-medium text-sm text-gray-700 min-w-[180px] border-r">
                  Nama
                </div>

                {/* Day headers for each week */}
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-1">
                    {/* Fill empty cells for first week */}
                    {weekIndex === 0 &&
                      Array.from({ length: firstDayOffset }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="flex-1 min-w-[60px] border-r px-1 py-3 text-center bg-gray-50"
                        />
                      ))}

                    {/* Day headers */}
                    {week.map((date) => {
                      const d = new Date(date + 'T00:00:00')
                      const dayName = DAYS[d.getDay()]
                      const dayNum = d.getDate()
                      const today = isToday(date)

                      return (
                        <div
                          key={date}
                          className={`flex-1 min-w-[60px] border-r px-1 py-3 text-center ${
                            today ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className={`text-xs font-medium ${today ? 'text-primary' : 'text-gray-500'}`}>
                            {dayName}
                          </div>
                          <div className={`text-sm font-semibold ${today ? 'text-primary' : 'text-gray-800'}`}>
                            {dayNum}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Employee Rows */}
              {calendarRows.map((row) => (
                <div key={row.employee_id} className="flex border-t">
                  {/* Employee info - sticky left */}
                  <div className="sticky left-0 z-10 bg-white border-r px-4 py-2 min-w-[180px]">
                    <div className="font-medium text-sm truncate">{row.employee_name}</div>
                    <div className="text-xs text-gray-400 truncate">{row.employee_code}</div>
                  </div>

                  {/* Schedule cells for each week */}
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-1">
                      {/* Fill empty cells for first week */}
                      {weekIndex === 0 &&
                        Array.from({ length: firstDayOffset }).map((_, i) => (
                          <div
                            key={`empty-${row.employee_id}-${i}`}
                            className="flex-1 min-w-[60px] border-r bg-gray-50"
                          />
                        ))}

                      {/* Day cells */}
                      {week.map((date) => {
                        const schedule = getSchedule(row, date)
                        const today = isToday(date)
                        const d = new Date(date + 'T00:00:00')
                        const dayOfWeek = d.getDay()
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                        // Determine shift color
                        const getShiftColor = () => {
                          if (!schedule?.shift_name) return ''
                          const name = schedule.shift_name.toLowerCase()
                          if (name.includes('off')) return 'bg-gray-200 text-gray-600'
                          if (name.includes('morning') || name.includes('pagi')) return 'bg-green-100 text-green-800'
                          if (name.includes('night') || name.includes('malam')) return 'bg-blue-100 text-blue-800'
                          if (name.includes('middle') || name.includes('siang')) return 'bg-orange-100 text-orange-800'
                          if (name.includes('back office')) return 'bg-purple-100 text-purple-800'
                          return 'bg-gray-100 text-gray-600'
                        }

                        const shiftColor = schedule ? getShiftColor() : ''

                        return (
                          <button
                            key={`${row.employee_id}-${date}`}
                            onClick={() => handleCellClick(row.employee_id, date, schedule?.id ?? null)}
                            className={`flex-1 min-w-[60px] border-r px-1 py-2 text-center transition-colors hover:bg-accent ${
                              today ? 'bg-primary/5' : isWeekend ? 'bg-gray-50' : ''
                            }`}
                          >
                            {schedule ? (
                              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${shiftColor}`}>
                                {schedule.shift_name?.substring(0, 3).toUpperCase() || '---'}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-lg">+</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}

              {/* Stats footer */}
              <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
                <span>{calendarRows.length} karyawan</span>
                <span>
                  {calendarRows.reduce(
                    (sum, row) => sum + Object.values(row.schedules).filter(Boolean).length,
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
          <span>Pagi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>Malam</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-orange-500 rounded" />
          <span>Middle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-purple-500 rounded" />
          <span>Back Office</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-gray-400 rounded" />
          <span>Off</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded" />
          <span>Klik untuk tambah jadwal</span>
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
