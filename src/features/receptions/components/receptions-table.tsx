/**
 * Receptions Table Component
 * Using standardized DataTable with CRUD operations
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
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
import { useReceptionsStore } from '../store/receptions-store'
import { ReceptionsFilters } from './receptions-filters'
import type { Reception } from '../types/receptions.types'

export function ReceptionsTable() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    pagination,
    fetchReceptions,
    filters,
    bulkDelete,
    isSubmitting,
  } = useReceptionsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReceptions({
        search: filters.search,
        warehouse_id: filters.warehouse_id,
        start_date: filters.start_date,
        end_date: filters.end_date,
        page: 1,
        per_page: 15
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.warehouse_id, filters.start_date, filters.end_date])

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
    fetchReceptions({
      search: filters.search,
      warehouse_id: filters.warehouse_id,
      start_date: filters.start_date,
      end_date: filters.end_date,
      page: newPage,
      per_page: 15
    })
  }, [fetchReceptions, filters, pagination.last_page])

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
    navigate({ to: '/receptions/new' })
  }

  // Define columns
  const columns: DataTableColumn<Reception>[] = [
    {
      accessorKey: 'code',
      header: 'Kode',
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.code ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'order_code',
      header: 'No. PO',
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.order_code ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: (row) => (
        <span className="font-medium">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(row.total)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === 1
              ? 'bg-green-100 text-green-800'
              : row.status === 2
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status === 1 ? 'Aktif' : row.status === 2 ? 'Dihapus' : 'Draft'}
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
        Hapus Terpilih
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ReceptionsFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Penerimaan
        </Button>
      </div>

      {/* Click to edit hint */}
      <p className="text-xs text-muted-foreground">
        Klik pada baris untuk melihat detail atau mengedit data
      </p>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="Tidak ada data penerimaan"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
        rowKey="id"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} data penerimaan yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  )
}
