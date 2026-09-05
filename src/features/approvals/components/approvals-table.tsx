/**
 * Approvals Table Component
 * Includes approve/reject actions with confirmation dialogs
 */
import { useEffect, useCallback, useState } from 'react'
import { FileText, FileSpreadsheet } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [showDetail, setShowDetail] = useState(false)
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

  const handleViewDetail = (approval: Approval) => {
    setSelectedApproval(approval)
    setShowDetail(true)
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
      accessorKey: 'request_code',
      header: 'Code',
      cell: (row) => (
        <span className="font-mono font-medium">{row.request_code ?? '-'}</span>
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
        onRowClick={handleViewDetail}
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

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {selectedApproval?.type_label} Details
            </DialogTitle>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-mono font-medium">{selectedApproval.request_code ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requester</p>
                  <p className="font-medium">{selectedApproval.requester?.name ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{formatDate(selectedApproval.request_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-lg">{formatAmount(selectedApproval.amount)}</p>
                </div>
              </div>

              {/* Notes / Reason */}
              {selectedApproval.reason && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="bg-muted p-3 rounded-md">{selectedApproval.reason}</p>
                </div>
              )}

              {/* Supplier */}
              {selectedApproval.request_details && 'supplier' in selectedApproval.request_details && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Supplier</p>
                  <p className="font-medium">{selectedApproval.request_details.supplier ?? '-'}</p>
                </div>
              )}

              {/* Purchase Request Code (for PO) */}
              {selectedApproval.request_details && 'purchase_request_code' in selectedApproval.request_details && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Linked Purchase Request</p>
                  <p className="font-mono">{selectedApproval.request_details.purchase_request_code ?? '-'}</p>
                </div>
              )}

              {/* Items Table */}
              {selectedApproval.request_details && selectedApproval.request_details.items.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2 font-medium">Product</th>
                          <th className="text-right p-2 font-medium">Qty</th>
                          <th className="text-right p-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApproval.request_details.items.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{item.product_name ?? '-'}</td>
                            <td className="p-2 text-right">{item.qty}</td>
                            <td className="p-2 text-right">{formatAmount(item.total)}</td>
                          </tr>
                        ))}
                        <tr className="border-t bg-muted/50 font-medium">
                          <td className="p-2" colSpan={2}>Total</td>
                          <td className="p-2 text-right">{formatAmount(selectedApproval.amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
