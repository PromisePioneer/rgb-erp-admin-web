/**
 * Distribution Requests Table Component
 * List view with filters, pagination, and row actions
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { toast } from 'sonner'
import { useDistributionRequestsStore } from '../store/distribution-requests-store'
import type { DistributionRequestStatus, DistributionRequest } from '../types/distribution-requests.types'

// Status badge component
function StatusBadge({ status }: { status: DistributionRequestStatus }) {
  const config: Record<DistributionRequestStatus, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', class: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800' },
  }
  const { label, class: className } = config[status] || config.draft

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function DistributionRequestsTable() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    error,
    filters,
    pagination,
    fetchItems,
    remove,
    bulkDelete,
    setFilters,
  } = useDistributionRequestsStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<DistributionRequestStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  // Initial fetch
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Handle search
  const handleSearch = () => {
    setFilters({ search: searchTerm || undefined })
    fetchItems({ ...filters, search: searchTerm || undefined, page: 1 })
  }

  // Handle status filter
  const handleStatusChange = (value: string | null) => {
    if (value === null) return
    const status = value as DistributionRequestStatus | 'all'
    setSelectedStatuses(status)
    setFilters({ status: status === 'all' ? undefined : status })
    fetchItems({ ...filters, status: status === 'all' ? undefined : status, page: 1 })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchItems({ ...filters, page })
  }

  // Handle row selection change
  const handleSelectionChange = useCallback((newSelectedIds: Set<number | string>) => {
    setSelectedIds(newSelectedIds)
  }, [])

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await remove(id)
      toast.success('Distribution request deleted successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete'
      toast.error(message)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds).map(Number)
    if (ids.length === 0) {
      toast.error('Select items to delete')
      return
    }

    try {
      await bulkDelete(ids)
      toast.success(`${ids.length} distribution request(s) deleted successfully`)
      setSelectedIds(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete'
      toast.error(message)
    }
  }

  // Navigate to detail/edit
  const handleView = (id: number) => {
    navigate({ to: `/distribution-requests/${id}` })
  }

  const handleEdit = (item: DistributionRequest) => {
    navigate({ to: `/distribution-requests/${item.id}/edit` })
  }

  // Clear error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Column definitions
  const columns: DataTableColumn<DistributionRequest>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: (row) => <span className="font-mono font-medium">{row.code}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: (row) => formatDate(row.date),
    },
    {
      accessorKey: 'warehouse_source_name',
      header: 'Sumber',
    },
    {
      accessorKey: 'destination_display',
      header: 'Tujuan',
      cell: (row) => (
        <span className="truncate max-w-[200px] block" title={row.destination_display || '-'}>
          {row.destination_display || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      className: 'text-right',
      cell: (row) => formatCurrency(row.total),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Distribution Requests</h1>
        <Button onClick={() => navigate({ to: '/distribution-requests/new' })}>
          <Send className="h-4 w-4 mr-2" />
          New Distribution
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="flex gap-2">
              <Input
                placeholder="Search by code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>

          <div className="w-[180px]">
            <Select
              value={selectedStatuses}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No distribution requests found"
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
              Delete {selectedIds.size} item(s)
            </Button>
          )
        }
      />

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selectedIds.size} distribution request(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
