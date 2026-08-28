import { useEffect, useState } from 'react'
import { Plus, Calendar, MapPin, ChevronLeft, ChevronRight, ChevronDown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { SchedulesFormModal } from '@/features/schedules'
import { useSchedulesStore } from '@/features/schedules'
import { SchedulesFilters } from './schedules-filters'
import type { CalendarSchedule, EmployeeScheduleRow } from '@/features/schedules'

interface AreaGroup {
  area_id: number
  area_name: string
  employees: EmployeeScheduleRow[]
}

interface ClientGroup {
  client_id: number
  client_name: string
  areas: AreaGroup[]
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  return days[date.getDay()]
}

function getDayNumber(dateStr: string): string {
  return dateStr.split('-')[2]
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

function getMonthYear(monthStr: string | undefined) {
  if (monthStr) {
    const [year, month] = monthStr.split('-').map(Number)
    return { year, month }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function SchedulesTable() {
  const {
    isLoading,
    fetchCalendarData,
    filters,
    bulkDelete,
    isSubmitting,
    getCalendarRows,
    getMonthDates,
    setFilters,
  } = useSchedulesStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedClients, setExpandedClients] = useState<Set<number>>(new Set())
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingScheduleId, setEditingScheduleId] = useState<number | undefined>(undefined)
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | undefined>(undefined)
  const [editingDate, setEditingDate] = useState<string | undefined>(undefined)

  const monthDates = getMonthDates()
  const calendarRows = getCalendarRows()

  const clientGroups: ClientGroup[] = (() => {
    const byClientAndArea: Record<string, { client_id: number; client_name: string; area_id: number; area_name: string; employees: EmployeeScheduleRow[] }> = {}
    calendarRows.forEach((row) => {
      const clientId = row.client_id ?? 0
      const clientName = row.client_name ?? 'Tanpa Client'
      const areaId = row.area_id ?? 0
      const areaName = row.area_name ?? 'Tanpa Area'
      const key = `${clientId}-${areaId}`
      if (!byClientAndArea[key]) {
        byClientAndArea[key] = { client_id: clientId, client_name: clientName, area_id: areaId, area_name: areaName, employees: [] }
      }
      // Deduplicate by employee_id to prevent React key warnings
      const existingIndex = byClientAndArea[key].employees.findIndex((e) => e.employee_id === row.employee_id)
      if (existingIndex === -1) {
        byClientAndArea[key].employees.push(row)
      }
    })

    const byClient: Record<number, ClientGroup> = {}
    Object.values(byClientAndArea).forEach((item) => {
      if (!byClient[item.client_id]) {
        byClient[item.client_id] = { client_id: item.client_id, client_name: item.client_name, areas: [] }
      }
      byClient[item.client_id].areas.push({ area_id: item.area_id, area_name: item.area_name, employees: item.employees })
    })

    return Object.values(byClient)
      .sort((a, b) => a.client_name.localeCompare(b.client_name))
      .map((client) => ({
        ...client,
        areas: client.areas.sort((a, b) => a.area_name.localeCompare(b.area_name)),
      }))
  })()

  const toggleClient = (clientId: number) => {
    setExpandedClients((prev) => {
      const next = new Set(prev)
      next.has(clientId) ? next.delete(clientId) : next.add(clientId)
      return next
    })
  }

  const toggleArea = (areaKey: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev)
      next.has(areaKey) ? next.delete(areaKey) : next.add(areaKey)
      return next
    })
  }

  const handlePrevMonth = () => {
    const { year, month } = getMonthYear(filters.month)
    const prev = new Date(year, month - 2, 1)
    setFilters({ month: `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}` })
  }

  const handleNextMonth = () => {
    const { year, month } = getMonthYear(filters.month)
    const next = new Date(year, month, 1)
    setFilters({ month: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}` })
  }

  const handleGoToToday = () => {
    const now = new Date()
    setFilters({ month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` })
  }

  useEffect(() => {
    fetchCalendarData({ month: filters.month, search: filters.search })
  }, [filters.month, filters.search])

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsDeleting(true)
    try {
      await bulkDelete(Array.from(selectedIds).map(Number))
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddNew = () => {
    setFormMode('create')
    setEditingScheduleId(undefined)
    setEditingEmployeeId(undefined)
    setEditingDate(undefined)
    setShowFormModal(true)
  }

  const handleCellClick = (row: EmployeeScheduleRow, date: string, schedule: CalendarSchedule | null | undefined) => {
    setEditingEmployeeId(row.employee_id)
    setEditingDate(date)
    // Note: API returns 'id' not 'schedule_id'
    if (schedule?.id) {
      setFormMode('edit')
      setEditingScheduleId(schedule.id)
    } else {
      setFormMode('create')
      setEditingScheduleId(undefined)
    }
    setShowFormModal(true)
  }

  const currentMonthLabel = filters.month
    ? new Date(filters.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const totalEmployees = clientGroups.reduce((sum, c) => sum + c.areas.reduce((s, a) => s + a.employees.length, 0), 0)
  const totalSchedules = calendarRows.reduce((sum, row) => sum + Object.values(row.schedules).filter(Boolean).length, 0)

  const renderMiniCalendar = (row: EmployeeScheduleRow) => (
    <div className="flex gap-px overflow-x-auto pb-1 w-full">
      {monthDates.map((date) => {
        const schedule = row.schedules[date] ?? null
        const today = isToday(date)
        return (
          <div key={date} className={`shrink-0 flex-1 min-w-6 max-w-[40px] text-center flex flex-col ${today ? 'bg-primary/10' : ''}`}>
            <div className="text-[8px] text-muted-foreground py-0.5">{getDayName(date)}</div>
            <button
              onClick={() => handleCellClick(row, date, schedule)}
              className={`w-full aspect-square mx-auto text-xs rounded flex items-center justify-center transition-colors ${schedule ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-gray-300'} ${today ? 'font-bold' : ''}`}
            >
              {getDayNumber(date)}
            </button>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <SchedulesFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />Tambah
        </Button>
      </div>

      <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">{currentMonthLabel}</span>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {clientGroups.length} Client • {totalEmployees} Karyawan • {totalSchedules} Jadwal
          </span>
          <Button variant="outline" size="sm" onClick={handleGoToToday}>Bulan Ini</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Klik tanggal untuk menambah/mengubah jadwal. Data dikelompokkan per Client dan Area.</p>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Memuat jadwal...</div>
        ) : clientGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Tidak ada data</div>
        ) : (
          clientGroups.map((client) => {
            const isExpanded = expandedClients.has(client.client_id) || expandedClients.size === 0
            const totalAreaEmp = client.areas.reduce((s, a) => s + a.employees.length, 0)
            const clientSched = client.areas.reduce((s, a) => s + a.employees.reduce((ss, emp) => ss + Object.values(emp.schedules).filter(Boolean).length, 0), 0)
            return (
              <div key={client.client_id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleClient(client.client_id)}
                  className="w-full flex items-center justify-between bg-gray-100 px-4 py-3 hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-gray-700">{client.client_name}</span>
                    <span className="text-xs text-gray-500">({client.areas.length} Area • {totalAreaEmp} Karyawan • {clientSched} Jadwal)</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y bg-gray-50">
                    {client.areas.map((area) => {
                      const areaKey = `${client.client_id}-${area.area_id}`
                      const isAreaExpanded = expandedAreas.has(areaKey) || expandedAreas.size === 0
                      return (
                        <div key={area.area_id}>
                          <div className="bg-gray-100">
                            <button
                              onClick={() => toggleArea(areaKey)}
                              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-200 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronDown className={`h-3 w-3 text-gray-600 transition-transform ${isAreaExpanded ? '' : '-rotate-90'}`} />
                                <MapPin className="h-3 w-3 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-800">{area.area_name}</span>
                                <span className="text-xs text-gray-500">({area.employees.length} karyawan)</span>
                              </div>
                            </button>
                          </div>

                          {isAreaExpanded && (
                            <div className="divide-y bg-gray-50">
                              {area.employees.map((row) => {
                                const empSched = Object.values(row.schedules).filter(Boolean).length
                                return (
                                  <div key={row.employee_id} className="px-4 py-2 hover:bg-gray-100">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm">{row.employee_name}</span>
                                      <span className="text-xs text-gray-500">({empSched} jadwal)</span>
                                    </div>
                                    {renderMiniCalendar(row)}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-primary rounded flex items-center justify-center text-[8px] text-primary-foreground font-semibold">15</div>
          <span>Hari dengan jadwal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 border rounded flex items-center justify-center text-[8px]">20</div>
          <span>Hari tanpa jadwal</span>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>Hapus jadwal yang dipilih?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isDeleting || isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
