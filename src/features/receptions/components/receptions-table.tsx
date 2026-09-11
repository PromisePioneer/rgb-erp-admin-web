/**
 * Receptions Table Component
 * Using standardized DataTable with CRUD operations
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
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
    submitForApproval,
    isSubmitting,
  } = useReceptionsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submittingId, setSubmittingId] = useState<number | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

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
      toast.success(`${selectedIds.size} item(s) deleted`)
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddNew = () => {
    navigate({ to: '/receptions/new' })
  }

  const handleEdit = (reception: Reception) => {
    // Only navigate to edit if can_edit is true
    if (reception.can_edit === false) {
      return
    }
    navigate({ to: '/receptions/$id/edit', params: { id: String(reception.id) } })
  }

  const handleSubmitClick = (row: Reception) => {
    setSubmittingId(row.id)
    setShowSubmitConfirm(true)
  }

  const handleSubmit = async () => {
    if (!submittingId) return
    try {
      await submitForApproval(submittingId)
      toast.success('Submitted for approval')
      setShowSubmitConfirm(false)
      setSubmittingId(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit')
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      case 'pending': return 'Pending'
      case 'draft': return 'Draft'
      default: return 'Unknown'
    }
  }

  // Define columns
  const columns: DataTableColumn<Reception>[] = [
    {
      accessorKey: 'code',
      header: 'Kode',
      cell: (row) => (
        <span className="font-mono text-sm font-medium text-primary">
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
      accessorKey: 'purchase_order_code',
      header: 'No. PO',
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.purchase_order_code ?? '-'}
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
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      accessorKey: 'current_level',
      header: 'Level',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.status === 'pending' ? `Level ${row.current_level}` : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: Reception) => (
        <div className="flex items-center gap-2">
          {(row.status === 'draft' || row.status === 'rejected') && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleSubmitClick(row)
              }}
            >
              <Send className="h-4 w-4 mr-1" />
              Submit
            </Button>
          )}
        </div>
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
        Klik pada kode untuk melihat detail atau mengedit data
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
        onRowClick={handleEdit}
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

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit untuk Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Reception akan diajukan untuk persetujuan. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowSubmitConfirm(false)
              setSubmittingId(null)
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Ya, Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
