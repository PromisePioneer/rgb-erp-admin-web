/**
 * Poss Table Component
 * Using standardized DataTable with row selection and modal form
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { PossFormModal } from './poss-form-modal'
import { usePossStore } from '../store/poss-store'
import { PossFilters } from './poss-filters'
import type { Pos } from '../types/poss.types'

interface PossTableProps {
  areaId?: number
  areaName?: string
  clientId?: number
  clientName?: string
}

export function PossTable({ areaId, clientId }: PossTableProps) {
  const {
    items,
    isLoading,
    pagination,
    fetchPoss,
    filters,
    bulkDelete,
    isSubmitting,
  } = usePossStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingPosId, setEditingPosId] = useState<number | undefined>(undefined)

  // Single source of truth for fetch - debounced, primitive dependencies, includes areaId/clientId
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPoss({
        search: filters.search,
        status: filters.status,
        area_id: areaId,
        client_id: areaId ? undefined : clientId,
        page: 1,
        per_page: 15,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.status, areaId, clientId])

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
      fetchPoss({
        search: filters.search,
        status: filters.status,
        area_id: areaId,
        client_id: areaId ? undefined : clientId,
        page: newPage,
        per_page: 15,
      })
    },
    [fetchPoss, filters.search, filters.status, areaId, clientId, pagination.last_page]
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
    setEditingPosId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (pos: Pos) => {
    setFormMode('edit')
    setEditingPosId(pos.id)
    setShowFormModal(true)
  }

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Aktif
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Tidak Aktif
      </span>
    )
  }

  // Define columns
  const columns: DataTableColumn<Pos>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Pos',
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
    ...(clientId
      ? []
      : [
          {
            accessorKey: 'area_name' as keyof Pos,
            header: 'Area',
            cell: (row: Pos) => (
              <span className="max-w-[150px] truncate block" title={row.area_name}>
                {row.area_name}
              </span>
            ),
          },
        ]),
    {
      accessorKey: 'latitude',
      header: 'Lat',
      cell: (row) => row.latitude ?? '-',
    },
    {
      accessorKey: 'longitude',
      header: 'Lng',
      cell: (row) => row.longitude ?? '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => getStatusBadge(row.status),
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
        <PossFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Pos
        </Button>
      </div>

      {/* Click to edit hint */}
      <p className="text-xs text-muted-foreground">
        Klik pada nama pos untuk mengedit data
      </p>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No poss found"
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
              Apakah Anda yakin ingin menghapus {selectedIds.size} pos yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Batal</AlertDialogCancel>
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

      {/* Pos Form Modal */}
      <PossFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        posId={editingPosId}
        defaultAreaId={areaId}
        defaultClientId={clientId}
      />
    </div>
  )
}
