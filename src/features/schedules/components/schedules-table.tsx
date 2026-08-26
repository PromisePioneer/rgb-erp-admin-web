/**
 * Schedules Table Component
 * Using standardized DataTable with row selection and modal form
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { SchedulesFormModal } from './schedules-form-modal'
import { useSchedulesStore } from '../store/schedules-store'
import { SchedulesFilters } from './schedules-filters'
import type { Schedule } from '../types/schedules.types'

export function SchedulesTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchSchedules,
    filters,
    bulkDelete,
    isSubmitting,
  } = useSchedulesStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingScheduleId, setEditingScheduleId] = useState<number | undefined>(undefined)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchedules({
        search: filters.search,
        month: filters.month,
        page: 1,
        per_page: 15,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.month])

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds((prev) => {
      const newSelection = new Set<number | string>()
      prev.forEach((id) => {
        if (items.some((item) => item.id === id)) {
          newSelection.add(id)
        }
      })
      return newSelection
    })
  }, [items])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) return
    fetchSchedules({ search: filters.search, month: filters.month, page: newPage, per_page: 15 })
  }, [fetchSchedules, filters.search, filters.month, pagination.last_page])

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsDeleting(true)
    try {
      await bulkDelete(Array.from(selectedIds).map(Number))
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
    } catch {
      // Error handled in store
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddNew = () => {
    setFormMode('create')
    setEditingScheduleId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (schedule: Schedule) => {
    setFormMode('edit')
    setEditingScheduleId(schedule.id)
    setShowFormModal(true)
  }

  // Define columns
  const columns: DataTableColumn<Schedule>[] = [
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {new Date(row.date).toLocaleDateString('id-ID', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'employee_name',
      header: 'Karyawan',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.employee_name ?? '-'}</div>
          <div className="text-xs text-muted-foreground">{row.employee_code ?? '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'shift_name',
      header: 'Shift',
      cell: (row) => (
        <div>
          <div className="text-sm">{row.shift_name ?? '-'}</div>
          {row.shift_start && row.shift_end && (
            <div className="text-xs text-muted-foreground">
              {row.shift_start} - {row.shift_end}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'area_name',
      header: 'Area',
      cell: (row) => (
        <span className="text-sm">
          {row.area_name ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'pos_name',
      header: 'POS Absensi',
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.pos_name ? (
            <>
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-sm font-medium text-primary">{row.pos_name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: (row: Schedule) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row)}
          className="text-primary hover:text-primary/80"
        >
          Edit
        </Button>
      ),
    },
  ]

  // Bulk actions
  const bulkActions = (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={selectedIds.size === 0}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Hapus Terpilih ({selectedIds.size})
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SchedulesFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Jadwal
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Klik pada tanggal atau tombol Edit untuk mengubah jadwal. POS menentukan lokasi absensi karyawan.
      </p>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="Tidak ada jadwal ditemukan"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} jadwal yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting || isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Form Modal */}
      <SchedulesFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        scheduleId={editingScheduleId}
      />
    </div>
  )
}
