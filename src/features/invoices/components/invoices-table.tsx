/**
 * Invoices Table Component
 * Using standardized DataTable with row selection
 * Note: Invoice editing is complex (has items), so we'll implement read-only list with mark-as-paid action
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, CheckCircle, Eye } from 'lucide-react'
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
import { useInvoicesStore } from '../store/invoices-store'
import { InvoicesFilters } from './invoices-filters'
import { InvoiceDetailModal } from './invoice-detail-modal'
import { InvoiceFormModal } from './invoice-form-modal'
import type { Invoice } from '../types/invoices.types'

export function InvoicesTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchInvoices,
    filters,
    markPaid,
    isSubmitting,
  } = useInvoicesStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false)
  const [markingId, setMarkingId] = useState<number | null>(null)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices({
        search: filters.search,
        client_id: filters.client_id,
        status: filters.status,
        page: 1,
        per_page: 15
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.client_id, filters.status])

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
    fetchInvoices({
      search: filters.search,
      client_id: filters.client_id,
      status: filters.status,
      page: newPage,
      per_page: 15
    })
  }, [fetchInvoices, filters.search, filters.client_id, filters.status, pagination.last_page])

  const handleAddNew = () => {
    setShowFormModal(true)
  }

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowDetailModal(true)
  }

  const handleMarkPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowMarkPaidDialog(true)
  }

  const confirmMarkPaid = async () => {
    if (!selectedInvoice) return
    setMarkingId(selectedInvoice.id)
    try {
      await markPaid(selectedInvoice.id)
      setShowMarkPaidDialog(false)
      setSelectedInvoice(null)
    } catch {
      // Error handled in store
    } finally {
      setMarkingId(null)
    }
  }

  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Define columns
  const columns: DataTableColumn<Invoice>[] = [
    {
      accessorKey: 'invoice_number',
      header: 'Invoice #',
      cell: (row) => (
        <span className="font-mono font-medium">{row.invoice_number}</span>
      ),
    },
    {
      accessorKey: 'client_name',
      header: 'Client',
      cell: (row) => (
        <span>{row.client_name ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'issue_date',
      header: 'Issue Date',
      cell: (row) => (
        <span className="text-muted-foreground">{formatDate(row.issue_date)}</span>
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: (row) => (
        <span className="text-muted-foreground">{formatDate(row.due_date)}</span>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: (row) => (
        <span className="font-mono font-medium">{formatCurrency(row.total)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'paid'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status === 'paid' ? 'Paid' : 'Unpaid'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetail(row)
            }}
            className="h-8 px-2"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status !== 'paid' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleMarkPaid(row)
              }}
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <InvoicesFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Create Invoice
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No invoices found"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Create Invoice Form Modal */}
      <InvoiceFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        invoice={selectedInvoice}
      />

      {/* Mark as Paid Confirmation Dialog */}
      <AlertDialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark invoice <strong>{selectedInvoice?.invoice_number}</strong> as paid?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowMarkPaidDialog(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkPaid}
              disabled={markingId !== null || isSubmitting}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {markingId !== null ? 'Processing...' : 'Mark as Paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
