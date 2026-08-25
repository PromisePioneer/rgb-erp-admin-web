/**
 * Roles Table Component
 * Using standardized DataTable with row selection and modal form
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Shield } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
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
import { RolesFormModal } from './roles-form-modal'
import { useRolesStore } from '../store/roles-store'
import { RolesFilters } from './roles-filters'
import type { Role } from '../types/roles.types'

export function RolesTable() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    pagination,
    fetchRoles,
    filters,
    bulkDelete,
    isSubmitting,
  } = useRolesStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | undefined>(undefined)

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchRoles(filters)
  }, [fetchRoles, filters])

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

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > pagination.last_page) return
      fetchRoles({ ...filters, page: newPage })
    },
    [fetchRoles, filters, pagination.last_page]
  )

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
    setFormMode('create')
    setEditingId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (item: Role) => {
    setFormMode('edit')
    setEditingId(item.id)
    setShowFormModal(true)
  }

  // Status badge helper
  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Aktif
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Tidak Aktif
      </span>
    )
  }

  // Define columns
  const columns: DataTableColumn<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleEdit(row)
          }}
          className="font-medium text-primary hover:underline text-left cursor-pointer"
        >
          {row.name}
        </button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      cell: (row: Role) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate({ to: '/roles/$id/privileges', params: { id: row.id.toString() } })
          }}
          className="text-muted-foreground hover:text-primary h-8 px-2"
        >
          <Shield className="h-4 w-4 mr-1" />
          Privileges
        </Button>
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
        Delete Selected
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <RolesFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Role
        </Button>
      </div>

      {/* Click to edit hint */}
      <p className="text-xs text-muted-foreground">
        Klik pada nama untuk mengedit data
      </p>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No roles found"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} role
              yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

      {/* Role Form Modal */}
      <RolesFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        roleId={editingId}
      />
    </div>
  )
}
