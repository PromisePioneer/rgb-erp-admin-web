import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { useFundRequestsStore } from '../store/fund-requests-store'
import { toast } from 'sonner'
import type { FundRequest } from '../types/fund-requests.types'
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

export function FundRequestsTable() {
  const navigate = useNavigate()
  const store = useFundRequestsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  useEffect(() => {
    store.fetchFundRequests()
  }, [])

  const handleSelectionChange = (newSelectedIds: Set<number | string>) => {
    setSelectedIds(newSelectedIds)
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds).map(Number)
    if (ids.length === 0) return
    try {
      await store.bulkRemove(ids)
      toast.success(`${ids.length} item(s) deleted`)
      setSelectedIds(new Set())
      setShowBulkDeleteDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const handleEdit = (row: FundRequest) => {
    navigate({ to: '/fund-requests/$id/edit', params: { id: String(row.id) } })
  }

  const handleSubmit = async (id: number) => {
    try {
      await store.submitForApproval(id)
      toast.success('Submitted for approval')
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    }
  }

  const statusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns: DataTableColumn<FundRequest>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      className: 'font-mono',
    },
    {
      accessorKey: 'po_code',
      header: 'PO',
      cell: (row) => row.po_code || '-',
    },
    {
      accessorKey: 'vendor_name',
      header: 'Vendor',
      cell: (row) => row.vendor_name || '-',
    },
    {
      accessorKey: 'requested_amount',
      header: 'Amount',
      className: 'text-right',
      cell: (row) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(row.requested_amount),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      className: 'text-center',
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClass(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      accessorKey: 'can_submit',
      header: '',
      className: 'text-center',
      cell: (row) => (
        row.can_submit && (
          <Button size="sm" variant="outline" onClick={() => handleSubmit(row.id)} disabled={store.isSubmitting}>
            <Send className="h-4 w-4 mr-1" />
            Submit
          </Button>
        )
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate({ to: '/fund-requests/new' })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fund Request
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={store.items}
        pagination={store.pagination}
        isLoading={store.isLoading}
        onPageChange={(page) => store.fetchFundRequests({ page })}
        emptyMessage="No fund requests"
        onRowClick={handleEdit}
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        bulkActions={
          selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete {selectedIds.size} item(s)
            </Button>
          )
        }
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fund Requests</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected item(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
