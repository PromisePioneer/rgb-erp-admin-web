/**
 * Purchase Orders Table Component
 * Using standardized DataTable
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Send, Pencil } from 'lucide-react'
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
import { usePurchaseOrdersStore } from '../store/purchase-orders-store'
import { PurchaseOrdersFilters } from './purchase-orders-filters'
import type { PurchaseOrder } from '../types/purchase-orders.types'
import { toast } from 'sonner'

export function PurchaseOrdersTable() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    pagination,
    fetchPurchaseOrders,
    filters,
    bulkDelete,
    submitForApproval,
    isSubmitting,
  } = usePurchaseOrdersStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchaseOrders({
        search: filters.search,
        page: 1,
        per_page: 15
      })
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
    fetchPurchaseOrders({
      search: filters.search,
      page: newPage,
      per_page: 15
    })
  }, [fetchPurchaseOrders, filters.search, pagination.last_page])

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
    navigate({ to: '/purchase-orders/new' })
  }

  const handleEdit = (po: PurchaseOrder) => {
    navigate({ to: '/purchase-orders/$id/edit', params: { id: String(po.id) } })
  }

  const handleSubmit = async (po: PurchaseOrder) => {
    setSubmittingId(po.id)
    try {
      await submitForApproval(po.id)
      toast.success(`PO ${po.code} submitted for approval`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit'
      toast.error(message)
    } finally {
      setSubmittingId(null)
    }
  }

  // Define columns
  const baseColumns: DataTableColumn<PurchaseOrder>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (row) => (
        <span className="text-muted-foreground">
          {new Date(row.date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: (row) => (
        <span className="font-mono text-sm font-medium text-primary">
          {row.code}
        </span>
      ),
    },
    {
      accessorKey: 'purchase_request_code',
      header: 'PR Code',
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.purchase_request_code ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.supplier ?? '-'}
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
            minimumFractionDigits: 0,
          }).format(row.total)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => {
        const statusConfig: Record<string, { label: string; class: string }> = {
          draft: { label: 'Draft', class: 'bg-gray-100 text-gray-800' },
          pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
          approved: { label: 'Approved', class: 'bg-green-100 text-green-800' },
          rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800' },
        }
        const config = statusConfig[row.status] || statusConfig.draft
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
            {config.label}
          </span>
        )
      },
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
  ]

  const columns = baseColumns

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
        <PurchaseOrdersFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Purchase Order
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No purchase orders found"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
        onRowClick={handleEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} purchase order yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
