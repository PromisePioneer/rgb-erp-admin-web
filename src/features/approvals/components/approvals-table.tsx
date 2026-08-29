/**
 * Approvals Table Component
 * Includes approve/reject actions with confirmation dialogs
 */
import { useEffect, useCallback, useState } from 'react'
import { Check, X, FileText } from 'lucide-react'
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
import { useApprovalsStore } from '../store/approvals-store'
import { ApprovalsFilters } from './approvals-filters'
import type { Approval } from '../types/approvals.types'
import { toast } from 'sonner'

export function ApprovalsTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchApprovals,
    filters,
    act,
    isActing,
  } = useApprovalsStore()

  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [note, setNote] = useState('')

  // Fetch approvals on mount
  useEffect(() => {
    fetchApprovals({ page: 1, per_page: 50 })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) return
    fetchApprovals({ ...filters, page: newPage })
  }, [fetchApprovals, filters, pagination.last_page])

  const handleAction = (approval: Approval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval)
    setActionType(action)
    setNote('')
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    if (!selectedApproval || !actionType) return

    try {
      await act(selectedApproval.id, {
        decision: actionType,
        note: note || undefined,
      })
      toast.success(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`)
      setShowConfirm(false)
    } catch {
      toast.error('Failed to process approval')
    }
  }

  // Format date
  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Format amount
  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Define columns
  const columns: DataTableColumn<Approval>[] = [
    {
      accessorKey: 'type_label',
      header: 'Type',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.type_label}</span>
        </div>
      ),
    },
    {
      accessorKey: 'requester',
      header: 'Requester',
      cell: (row) => (
        <span className={row.requester ? 'font-medium' : 'text-muted-foreground'}>
          {row.requester?.name ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'request_date',
      header: 'Request Date',
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatDate(row.request_date)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (row) => (
        <span className={row.amount ? 'font-medium' : 'text-muted-foreground'}>
          {formatAmount(row.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason/Description',
      cell: (row) => (
        <span className="max-w-[250px] truncate block" title={row.reason ?? ''}>
          {row.reason ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: (row) => (
        <span className="text-muted-foreground">
          Step {row.level}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={(e) => {
              e.stopPropagation()
              handleAction(row, 'approve')
            }}
            disabled={isActing}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation()
              handleAction(row, 'reject')
            }}
            disabled={isActing}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <ApprovalsFilters />

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No pending approvals"
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  {actionType === 'approve'
                    ? 'Are you sure you want to approve this request?'
                    : 'Are you sure you want to reject this request?'}
                </p>
                {selectedApproval && (
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    <p><strong>Type:</strong> {selectedApproval.type_label}</p>
                    <p><strong>Requester:</strong> {selectedApproval.requester?.name ?? 'Unknown'}</p>
                    {selectedApproval.amount && (
                      <p><strong>Amount:</strong> {formatAmount(selectedApproval.amount)}</p>
                    )}
                  </div>
                )}
                <div className="mt-3">
                  <label className="text-sm font-medium block mb-1">Note (optional)</label>
                  <textarea
                    className="w-full p-2 border rounded-md text-sm"
                    rows={2}
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isActing}
              className={actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isActing ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
