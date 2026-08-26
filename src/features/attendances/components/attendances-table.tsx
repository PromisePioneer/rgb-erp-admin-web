/**
 * Attendances Table Component
 * READ-ONLY module with two views: Raw List and Recap
 */
import { useEffect, useState, useCallback } from 'react'
import { Clock, TrendingUp, Users, MapPin, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { DataTable } from '@/components/ui/data-table'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useAttendancesStore } from '../store/attendances-store'
import { attendancesApi } from '../api/attendances-api'
import { AttendancesFilters } from './attendances-filters'
import type { Attendance, AttendanceRecap } from '../types/attendances.types'

type ViewMode = 'raw' | 'recap'

export function AttendancesTable() {
  const {
    items,
    recapItems,
    isLoading,
    pagination,
    stats,
    filters,
    fetchAttendance,
    fetchRecap,
    setFilters,
  } = useAttendancesStore()

  const [viewMode, setViewMode] = useState<ViewMode>('recap')
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false)

  // Fetch data based on view mode
  useEffect(() => {
    if (viewMode === 'raw') {
      fetchAttendance({ ...filters, page: 1 })
    } else {
      fetchRecap({ ...filters, page: 1 })
    }
  }, [viewMode, filters.month])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) return
    if (viewMode === 'raw') {
      fetchAttendance({ ...filters, page: newPage })
    } else {
      fetchRecap({ ...filters, page: newPage })
    }
  }, [viewMode, filters, pagination.last_page, fetchAttendance, fetchRecap])

  const loadEmployees = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await attendancesApi.getEmployeesSelectOptions({ q: search })
      return response.data.map((emp) => ({
        value: emp.id,
        label: `${emp.name} (${emp.code})`,
      }))
    } catch {
      return []
    }
  }, [])

  const handleEmployeeSelect = (value: number | string | null) => {
    setFilters({ employee_id: value as number | undefined })
    setShowEmployeeSelect(false)
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

  const selectedEmployeeName = filters.employee_id
    ? recapItems.find((r) => r.employee_id === filters.employee_id)?.employee_name ?? 'Loading...'
    : null

  // Raw Attendance Columns
  const rawColumns = [
    {
      accessorKey: 'recorded_at' as const,
      header: 'Waktu',
      cell: (row: Attendance) => (
        <span className="text-sm">
          {new Date(row.recorded_at).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'employee_name' as const,
      header: 'Karyawan',
      cell: (row: Attendance) => (
        <div className="text-sm">
          <div className="font-medium">{row.employee_name ?? '-'}</div>
          <div className="text-muted-foreground text-xs">{row.employee_code ?? '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'type' as const,
      header: 'Tipe',
      cell: (row: Attendance) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.type === 'check_in'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {row.type === 'check_in' ? 'Check In' : 'Check Out'}
        </span>
      ),
    },
    {
      accessorKey: 'distance_meters' as const,
      header: 'Jarak',
      cell: (row: Attendance) => (
        <span className="text-sm text-muted-foreground">
          {row.distance_meters != null ? `${row.distance_meters}m` : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'notes' as const,
      header: 'Catatan',
      cell: (row: Attendance) => (
        <span className="text-sm max-w-[200px] truncate block" title={row.notes ?? ''}>
          {row.notes ?? '-'}
        </span>
      ),
    },
  ]

  // Recap Columns
  const recapColumns = [
    {
      accessorKey: 'date' as const,
      header: 'Tanggal',
      cell: (row: AttendanceRecap) => (
        <span className="text-sm font-medium">
          {new Date(row.date).toLocaleDateString('id-ID', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'employee_name' as const,
      header: 'Karyawan',
      cell: (row: AttendanceRecap) => (
        <div className="text-sm">
          <div className="font-medium">{row.employee_name}</div>
          <div className="text-muted-foreground text-xs">{row.employee_code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'checkin' as const,
      header: 'Check In',
      cell: (row: AttendanceRecap) => (
        <span className="text-sm font-mono">
          {row.checkin ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'checkout' as const,
      header: 'Check Out',
      cell: (row: AttendanceRecap) => (
        <span className="text-sm font-mono">
          {row.checkout ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'late' as const,
      header: 'Terlambat',
      cell: (row: AttendanceRecap) => (
        <span className={`text-sm ${row.late ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
          {row.late ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'early_leave' as const,
      header: 'Pulang Awal',
      cell: (row: AttendanceRecap) => (
        <span className={`text-sm ${row.early_leave ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`}>
          {row.early_leave ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status' as const,
      header: 'Status',
      cell: (row: AttendanceRecap) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${row.status_class}`}>
          {row.status_text}
        </span>
      ),
    },
    {
      accessorKey: 'pos_name' as const,
      header: 'POS / Lokasi',
      cell: (row: AttendanceRecap) => (
        <div className="text-sm max-w-[180px]">
          {row.pos_name ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 font-medium">
                <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="truncate">{row.pos_name}</span>
              </div>
              {row.client_name && (
                <div className="text-xs text-muted-foreground truncate">
                  {row.client_name}
                </div>
              )}
            </div>
          ) : row.client_name ? (
            <div className="text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{row.client_name}</span>
              </div>
              <div className="text-xs italic">POS belum diatur</div>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check In</p>
                <p className="text-2xl font-bold">{stats.check_in_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check Out</p>
                <p className="text-2xl font-bold">{stats.check_out_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Jarak</p>
                <p className="text-2xl font-bold">{stats.avg_distance}m</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Record</p>
                <p className="text-2xl font-bold">{stats.total_records}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and View Toggle */}
      <div className="flex justify-between items-end gap-4">
        <AttendancesFilters />
        <div className="flex items-center gap-2">
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

          {/* Employee Filter Button */}
          <Button
            variant={filters.employee_id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowEmployeeSelect(true)}
            className="h-9"
          >
            <Users className="h-4 w-4 mr-1" />
            {selectedEmployeeName ?? 'Filter Karyawan'}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('recap')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'recap'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Rekap
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'raw'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Raw Data
            </button>
          </div>
        </div>
      </div>

      {/* Raw Data Table */}
      {viewMode === 'raw' && (
        <DataTable
          columns={rawColumns}
          data={items}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          emptyMessage="Tidak ada data attendance"
        />
      )}

      {/* Recap Table */}
      {viewMode === 'recap' && (
        <DataTable
          columns={recapColumns}
          data={recapItems}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          emptyMessage="Tidak ada data rekap attendance"
        />
      )}

      {/* Employee Select Dialog */}
      <AlertDialog open={showEmployeeSelect} onOpenChange={setShowEmployeeSelect}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Filter Karyawan</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih karyawan untuk melihat attendance mereka
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <AsyncSelect
              value={filters.employee_id ?? null}
              onChange={handleEmployeeSelect}
              loadOptions={loadEmployees}
              placeholder="Cari karyawan..."
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEmployeeSelect(false)}>
              Batal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
