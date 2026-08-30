/**
 * Purchase Orders Table Component
 * Using standardized DataTable
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
import { usePurchaseOrdersStore } from '../store/purchase-orders-store'
import { PurchaseOrdersFilters } from './purchase-orders-filters'
import type { PurchaseOrder } from '../types/purchase-orders.types'

export function PurchaseOrdersTable() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    pagination,
    fetchPurchaseOrders,
    filters,
    bulkDelete,
    isSubmitting,
  } = usePurchaseOrdersStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  // Define columns
  const columns: DataTableColumn<PurchaseOrder>[] = [
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleEdit(row)
          }}
          className="font-mono text-sm font-medium text-primary hover:underline text-left cursor-pointer"
        >
          {row.code}
        </button>
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
        const statusConfig: Record<number, { label: string; class: string }> = {
          1: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
          2: { label: 'Approved', class: 'bg-green-100 text-green-800' },
          0: { label: 'Rejected', class: 'bg-red-100 text-red-800' },
        }
        const config = statusConfig[row.status] || statusConfig[0]
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
            {config.label}
          </span>
        )
      },
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
        <PurchaseOrdersFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Purchase Order
        </Button>
      </div>

      {/* Click to edit hint */}
      <p className="text-xs text-muted-foreground">
        Klik pada tombol edit untuk mengedit data
      </p>

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
