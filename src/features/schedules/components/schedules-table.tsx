/**
 * Schedules Table Component - Monthly Grid View
 * Displays employee schedules grouped by client -> area with color-coded shifts
 */
import {useEffect, useState, useMemo} from 'react'
import {Plus, Search, X, Calendar, Filter, MapPin, Building2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {Badge} from '@/components/ui/badge'
import {useSchedulesStore} from '@/features/schedules/store/schedules-store'
import {SchedulesFormModal} from '@/features/schedules/components/schedules-form-modal'
import {SchedulesMonthNav} from '@/features/schedules/components/schedules-month-nav'
import {SchedulesToolbar} from '@/features/schedules/components/schedules-toolbar'
import type {CalendarSchedule, EmployeeScheduleRow} from '@/features/schedules/types/schedules.types'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// Grouped structure: Client -> Area -> Employees
interface AreaGroup {
    area_id: number | null
    area_name: string
    employees: EmployeeScheduleRow[]
}

interface ClientGroup {
    client_id: number | null
    client_name: string
    areas: AreaGroup[]
}

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
    const [editingAreaId, setEditingAreaId] = useState<number | undefined>(undefined)
    const [editingDate, setEditingDate] = useState<string | undefined>(undefined)

    const areas = getUniqueAreas()
    const calendarRows = getFilteredCalendarRows()

    // Fetch data when month changes
    useEffect(() => {
        fetchCalendarData({month: currentMonth, search: searchQuery || undefined})
    }, [currentMonth, searchQuery, fetchCalendarData])

    // Generate all dates for the month
    const monthDates = useMemo(() => {
        const [year, month] = currentMonth.split('-').map(Number)
        const daysInMonth = new Date(year, month, 0).getDate()
        const dates: { date: string; dayOfWeek: number }[] = []
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayOfWeek = new Date(year, month - 1, day).getDay()
            dates.push({date: dateStr, dayOfWeek})
        }
        return dates
    }, [currentMonth])

    // Total columns for footer
    const totalColumns = 1 + monthDates.length

    // Group employees by client -> area
    const groupedByClient = useMemo((): ClientGroup[] => {
        const clientMap = new Map<string | number, ClientGroup>()
        const areaMap = new Map<string | number, AreaGroup>()

        calendarRows.forEach((row) => {
            const clientKey = row.client_id ?? 'no-client'
            const clientName = row.client_name ?? 'Tanpa Klien'
            const areaKey = row.area_id ?? 'no-area'
            const areaName = row.area_name ?? 'Tanpa Area'

            // Create or get client group
            if (!clientMap.has(clientKey)) {
                clientMap.set(clientKey, {
                    client_id: row.client_id,
                    client_name: clientName,
                    areas: [],
                })
            }
            const clientGroup = clientMap.get(clientKey)!

            // Create or get area group within client
            const areaFullKey = `${clientKey}-${areaKey}`
            if (!areaMap.has(areaFullKey)) {
                const newArea: AreaGroup = {
                    area_id: row.area_id,
                    area_name: areaName,
                    employees: [],
                }
                areaMap.set(areaFullKey, newArea)
                clientGroup.areas.push(newArea)
            }
            areaMap.get(areaFullKey)!.employees.push(row)
        })

        return Array.from(clientMap.values())
    }, [calendarRows])

    // Calculate stats for an area group
    const getAreaStats = (group: AreaGroup) => {
        const totalSchedules = group.employees.reduce(
            (sum, row) => sum + Object.values(row.schedules).filter(Boolean).length,
            0
        )
        return {
            employeeCount: group.employees.length,
            scheduleCount: totalSchedules,
        }
    }

    // Calculate stats for a client group
    const getClientStats = (group: ClientGroup) => {
        const totalEmployees = group.areas.reduce((sum, area) => sum + area.employees.length, 0)
        const totalSchedules = group.areas.reduce(
            (sum, area) => sum + area.employees.reduce((s, row) => s + Object.values(row.schedules).filter(Boolean).length, 0),
            0
        )
        return {
            employeeCount: totalEmployees,
            scheduleCount: totalSchedules,
        }
    }

    // Handle cell click to open form
    const handleCellClick = (
        employeeId: number,
        areaId: number | null,
        date: string,
        scheduleId: number | null
    ) => {
        setEditingEmployeeId(employeeId)
        setEditingAreaId(areaId ?? undefined)
        setEditingDate(date)
        setEditingScheduleId(scheduleId ?? undefined)
        setFormMode(scheduleId ? 'edit' : 'create')
        setShowFormModal(true)
    }

    // Handle add new button
    const handleAddNew = () => {
        setEditingScheduleId(undefined)
        setEditingEmployeeId(undefined)
        setEditingAreaId(undefined)
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

    // Get shift color based on code
    const getShiftColor = (shiftCode: string | null | undefined) => {
        if (!shiftCode) return ''
        switch (shiftCode.toUpperCase()) {
            case 'P':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'M':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'MD':
                return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'PM':
                return 'bg-purple-100 text-purple-800 border-purple-200'
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200'
        }
    }

    // Get shift abbreviation
    const getShiftAbbr = (shiftCode: string | null | undefined) => {
        if (!shiftCode) return ''
        return shiftCode.toUpperCase()
    }

    // Render table header
    const renderTableHeader = () => (
        <tr className="bg-gray-100 border-b">
            <th className="sticky left-0 bg-gray-100 z-30 w-[160px] min-w-[160px] px-3 py-2 border-r text-left font-medium text-sm text-gray-700">
                Nama
            </th>
            {monthDates.map((item) => {
                const today = isToday(item.date)
                const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6
                return (
                    <th
                        key={item.date}
                        className={`w-[50px] min-w-[50px] px-1 py-2 text-center border-r last:border-r-0 ${
                            today ? 'bg-primary/10' : isWeekend ? 'bg-gray-50' : ''
                        }`}
                    >
                        <div className={`text-xs font-medium ${today ? 'text-primary' : 'text-gray-500'}`}>
                            {DAYS[item.dayOfWeek]}
                        </div>
                        <div className={`text-sm font-semibold ${today ? 'text-primary' : 'text-gray-800'}`}>
                            {item.date.split('-')[2]}
                        </div>
                    </th>
                )
            })}
        </tr>
    )

    // Render employee row
    const renderEmployeeRow = (row: EmployeeScheduleRow) => (
        <tr key={row.employee_id} className="border-t hover:bg-gray-50/30">
            <th className="sticky left-0 bg-white z-10 w-[160px] min-w-[160px] px-3 py-2 border-r text-left">
                <div className="font-medium text-sm truncate">{row.employee_name}</div>
                <div className="text-xs text-gray-400 truncate">{row.employee_code}</div>
            </th>
            {monthDates.map((item) => {
                const schedule = getSchedule(row, item.date)
                const today = isToday(item.date)
                const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6

                return (
                    <td
                        key={`${row.employee_id}-${item.date}`}
                        className={`w-[50px] min-w-[50px] px-1 py-2 border-r last:border-r-0 text-center ${
                            today ? 'bg-primary/5' : isWeekend ? 'bg-gray-50/50' : ''
                        }`}
                    >
                        <button
                            onClick={() => handleCellClick(row.employee_id, row.area_id, item.date, schedule?.id ?? null)}
                            className="w-full h-full flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                            title={item.date}
                        >
                            {schedule?.shift_code ? (
                                <span
                                    className={`inline-block px-1 py-0.5 rounded text-xs font-semibold border ${getShiftColor(
                                        schedule.shift_code
                                    )}`}
                                >
                  {getShiftAbbr(schedule.shift_code)}
                </span>
                            ) : (
                                <span className="text-gray-300 text-sm">+</span>
                            )}
                        </button>
                    </td>
                )
            })}
        </tr>
    )

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-primary"/>
                        Scheduler
                    </h1>
                </div>

                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-1"/>
                    Tambah
                </Button>
            </div>

            {/* Month Navigation */}
            <SchedulesMonthNav/>

            {/* Import/Export Toolbar */}
            <SchedulesToolbar
                currentMonth={currentMonth}
                onRefresh={() => fetchCalendarData({month: currentMonth, search: searchQuery || undefined})}
            />

            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Area Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground"/>
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
                            <SelectValue placeholder="Semua Area"/>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
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
                            <X className="h-4 w-4"/>
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
                Klik tanggal untuk menambah atau mengubah jadwal. Data dikelompokkan per klien dan area.
            </p>

            {/* Grid - Grouped by Client -> Area */}
            <div className="border rounded-lg overflow-hidden bg-white">
                {/* Loading state */}
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div
                            className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"/>
                        <p className="mt-2 text-muted-foreground">Memuat jadwal...</p>
                    </div>
                ) : calendarRows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300"/>
                        <p>Tidak ada data jadwal</p>
                        <p className="text-sm">Pilih bulan lain atau tambah jadwal baru</p>
                    </div>
                ) : (
                    <div className="overflow-auto max-h-[calc(100vh-400px)]">
                        {/* Render each client group */}
                        {groupedByClient.map((client) => {
                            const clientStats = getClientStats(client)
                            return (
                                <div key={client.client_id ?? 'no-client'} className="border-b last:border-b-0">
                                    {/* Client Header */}
                                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b">
                                        <Building2 className="h-5 w-5 text-slate-600"/>
                                        <span className="font-bold text-slate-800">{client.client_name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {clientStats.employeeCount} karyawan
                                        </Badge>
                                    </div>

                                    {/* Areas within this client */}
                                    {client.areas.map((area) => {
                                        const areaStats = getAreaStats(area)
                                        return (
                                            <div key={area.area_id ?? 'no-area'}
                                                 className="border-b last:border-b-0 bg-gray-50/30">
                                                {/* Area Header */}
                                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b">
                                                    <MapPin className="h-4 w-4 text-primary"/>
                                                    <span
                                                        className="font-semibold text-gray-700">{area.area_name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {areaStats.employeeCount} karyawan
                                                    </Badge>
                                                </div>

                                                {/* Area Table */}
                                                <table className="border-collapse min-w-max w-full">
                                                    <thead>{renderTableHeader()}</thead>
                                                    <tbody>
                                                    {area.employees.map((row) => renderEmployeeRow(row))}
                                                    </tbody>
                                                    <tfoot>
                                                    <tr className="bg-gray-50 border-t">
                                                        <td colSpan={1} className="px-4 py-2 text-xs text-gray-500">
                                                            {areaStats.employeeCount} karyawan
                                                        </td>
                                                        <td colSpan={totalColumns - 1}
                                                            className="px-4 py-2 text-xs text-gray-500">
                                                            {areaStats.scheduleCount} jadwal
                                                        </td>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )
                                    })}

                                    {/* Client Footer Stats */}
                                    <div className="px-4 py-2 bg-slate-50 border-t text-xs text-slate-600">
                                        {client.client_name}: {clientStats.employeeCount} karyawan, {clientStats.scheduleCount} jadwal
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"/>
                    <span>P (Pagi)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"/>
                    <span>M (Malam)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"/>
                    <span>MD (Middle)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"/>
                    <span>PM (Back Office)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"/>
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
                defaultAreaId={editingAreaId}
                defaultDate={editingDate}
            />
        </div>
    )
}
