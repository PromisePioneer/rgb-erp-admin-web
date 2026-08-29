/**
 * Checkpoints Table Component
 * Full CRUD with DataTable and modal form
 */
import { useEffect, useCallback, useState } from 'react'
import { Plus, Trash2, Edit, MapPin } from 'lucide-react'
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
import { useCheckpointsStore } from '../store/checkpoints-store'
import { CheckpointsFilters } from './checkpoints-filters'
import { CheckpointsFormModal } from './checkpoints-form-modal'
import type { Checkpoint } from '../types/checkpoints.types'
import { toast } from 'sonner'

export function CheckpointsTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchCheckpoints,
    filters,
    bulkDelete,
    remove,
    isSubmitting,
  } = useCheckpointsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCheckpoints({
        search: filters.search,
        project_id: filters.project_id,
        status: filters.status,
        page: 1,
        per_page: 15,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.project_id, filters.status])

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
    fetchCheckpoints({ ...filters, page: newPage })
  }, [fetchCheckpoints, filters, pagination.last_page])

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsDeleting(true)
    try {
      await bulkDelete(Array.from(selectedIds).map(Number))
      toast.success(`Deleted ${selectedIds.size} checkpoints`)
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
    } catch {
      toast.error('Failed to delete checkpoints')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDelete = async (checkpoint: Checkpoint) => {
    try {
      await remove(checkpoint.id)
      toast.success('Checkpoint deleted')
    } catch {
      toast.error('Failed to delete checkpoint')
    }
  }

  const handleEdit = (checkpoint: Checkpoint) => {
    setEditingCheckpoint(checkpoint)
    setShowFormModal(true)
  }

  const handleAddNew = () => {
    setEditingCheckpoint(null)
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingCheckpoint(null)
  }

  // Define columns
  const columns: DataTableColumn<Checkpoint>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: (row) => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
          {row.code}
        </code>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.project_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'sequence_order',
      header: 'Seq',
      cell: (row) => (
        <span className="text-muted-foreground">{row.sequence_order}</span>
      ),
    },
    {
      accessorKey: 'lat',
      header: 'Location',
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono">
            {row.lat?.toFixed(4)}, {row.lng?.toFixed(4)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'radius_meters',
      header: 'Radius',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">
          {row.radius_meters ? `${row.radius_meters}m` : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">
          {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
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
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(row)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row)
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
        Delete ({selectedIds.size})
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CheckpointsFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Checkpoint
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No checkpoints found"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checkpoints</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} checkpoint(s)?
              Checkpoints with existing scan records will be deactivated instead of deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting || isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Modal */}
      <CheckpointsFormModal
        checkpoint={editingCheckpoint}
        open={showFormModal}
        onOpenChange={handleCloseModal}
      />
    </div>
  )
}
