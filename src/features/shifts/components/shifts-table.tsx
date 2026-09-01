/**
 * Shifts Table Component
 * Using standardized DataTable with row selection and modal form
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { ShiftsFormModal } from './shifts-form-modal'
import { useShiftsStore } from '../store/shifts-store'
import { ShiftsFilters } from './shifts-filters'
import type { Shift } from '../types/shifts.types'

const SHIFT_TYPE_LABELS: Record<string, string> = {
  morning: 'Morning',
  middle: 'Middle',
  night: 'Night',
  off: 'Off',
  back_office: 'Back Office',
}

export function ShiftsTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchShifts,
    filters,
    bulkDelete,
    isSubmitting,
  } = useShiftsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingShiftId, setEditingShiftId] = useState<number | undefined>(undefined)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShifts({ search: filters.search, page: 1, per_page: 15 })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

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
    fetchShifts({ search: filters.search, page: newPage, per_page: 15 })
  }, [fetchShifts, filters.search, pagination.last_page])

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
    setEditingShiftId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (shift: Shift) => {
    setFormMode('edit')
    setEditingShiftId(shift.id)
    setShowFormModal(true)
  }

  // Define columns
  const columns: DataTableColumn<Shift>[] = [
    {
      accessorKey: 'name',
      header: 'Shift Name',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleEdit(row)
          }}
          className="font-medium text-primary hover:underline text-left cursor-pointer"
        >
          {row.name}
        </button>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.type === 'morning'
              ? 'bg-yellow-100 text-yellow-800'
              : row.type === 'night'
              ? 'bg-blue-100 text-blue-800'
              : row.type === 'middle'
              ? 'bg-orange-100 text-orange-800'
              : row.type === 'off'
              ? 'bg-gray-100 text-gray-800'
              : row.type === 'back_office'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.type ? SHIFT_TYPE_LABELS[row.type] || row.type : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'area_name',
      header: 'Area',
      cell: (row) => (
        <span className="text-sm">
          {row.area_name ?? <span className="text-muted-foreground">Global</span>}
        </span>
      ),
    },
    {
      accessorKey: 'start_time',
      header: 'Start Time',
      cell: (row) => (
        <span className="font-mono">
          {row.start_time ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'end_time',
      header: 'End Time',
      cell: (row) => (
        <span className="font-mono">
          {row.end_time ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 1
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
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
        Delete Selected
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ShiftsFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Shift
        </Button>
      </div>

      {/* Click to edit hint */}
      <p className="text-xs text-muted-foreground">
        Klik pada nama untuk mengedit data
      </p>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No shifts found"
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
              Apakah Anda yakin ingin menghapus {selectedIds.size} shift yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

      {/* Shift Form Modal */}
      <ShiftsFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        shiftId={editingShiftId}
      />
    </div>
  )
}
