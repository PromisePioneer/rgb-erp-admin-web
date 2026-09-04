/**
 * Distribution Requests Table Component
 * List view with filters, pagination, and row actions
 */
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Pencil, Eye, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from 'sonner'
import { useDistributionRequestsStore } from '../store/distribution-requests-store'
import type { DistributionRequestStatus } from '../types/distribution-requests.types'

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
  const [selectedIds, setSelectedIds] = useState<number[]>([])

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

  // Handle row selection
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((item) => item.id))
    }
  }

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

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
    if (selectedIds.length === 0) {
      toast.error('Select items to delete')
      return
    }

    try {
      await bulkDelete(selectedIds)
      toast.success(`${selectedIds.length} distribution request(s) deleted successfully`)
      setSelectedIds([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete'
      toast.error(message)
    }
  }

  // Navigate to detail/edit
  const handleView = (id: number) => {
    navigate({ to: `/distribution-requests/${id}` })
  }

  const handleEdit = (id: number) => {
    navigate({ to: `/distribution-requests/${id}/edit` })
  }

  // Clear error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Distribution Requests</h1>
          <p className="text-muted-foreground">Kelola request distribusi barang</p>
        </div>
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-muted rounded-lg border p-3 flex items-center justify-between">
          <span className="text-sm">
            {selectedIds.length} item(s) selected
          </span>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected</AlertDialogTitle>
                  <AlertDialogDescription>
                    Delete {selectedIds.length} distribution request(s)?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4"
                />
              </TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Sumber</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">No data</p>
                    <p className="text-sm">No distribution requests found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectRow(item.id)}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-medium">{item.code}</span>
                  </TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.warehouse_source_name || '-'}</TableCell>
                  <TableCell>
                    <span className="truncate max-w-[200px] block" title={item.destination_display || '-'}>
                      {item.destination_display || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(item.id)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.can_edit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item.id)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete this distribution request?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {pagination.total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                const page = pagination.current_page - 2 + i
                if (page < 1 || page > pagination.last_page) return null
                return (
                  <Button
                    key={page}
                    variant={pagination.current_page === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
