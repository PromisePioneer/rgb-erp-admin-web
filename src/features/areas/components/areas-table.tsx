/**
 * Areas Table Component
 * Using standardized DataTable with row selection and modal form
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, MapPin } from 'lucide-react'
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
import { AreasFormModal } from './areas-form-modal'
import { useAreasStore } from '../store/areas-store'
import { AreasFilters } from './areas-filters'
import type { Area } from '../types/areas.types'

interface AreasTableProps {
  clientId?: number
  clientName?: string
}

export function AreasTable({ clientId, clientName }: AreasTableProps) {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    pagination,
    fetchAreas,
    filters,
    bulkDelete,
    isSubmitting,
  } = useAreasStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingAreaId, setEditingAreaId] = useState<number | undefined>(undefined)

  // Single source of truth for fetch - debounced, primitive dependencies, includes clientId
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAreas({ search: filters.search, status: filters.status, client_id: clientId, page: 1, per_page: 15 })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.status, clientId])

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
      fetchAreas({ search: filters.search, status: filters.status, client_id: clientId, page: newPage, per_page: 15 })
    },
    [fetchAreas, filters.search, filters.status, clientId, pagination.last_page]
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
    setEditingAreaId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (area: Area) => {
    setFormMode('edit')
    setEditingAreaId(area.id)
    setShowFormModal(true)
  }

  const handleViewPoss = (area: Area) => {
    navigate({
      to: '/poss',
      search: {
        client_id: area.client_id,
        client_name: area.client_name,
        area_id: area.id,
        area_name: area.name,
      },
    })
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
  const columns: DataTableColumn<Area>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Area',
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
            accessorKey: 'client_name' as keyof Area,
            header: 'Client',
            cell: (row: Area) => (
              <span className="max-w-[150px] truncate block" title={row.client_name}>
                {row.client_name}
              </span>
            ),
          },
        ]),
    {
      accessorKey: 'pos_count',
      header: 'Pos',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleViewPoss(row)
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <MapPin className="h-3 w-3" />
          {row.pos_count}
        </button>
      ),
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
        <AreasFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Area
        </Button>
      </div>

      {/* Click to edit hint */}
      <p className="text-xs text-muted-foreground">
        Klik pada nama area untuk mengedit data, klik jumlah pos untuk mengelola pos
      </p>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No areas found"
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
              Apakah Anda yakin ingin menghapus {selectedIds.size} area yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

      {/* Area Form Modal */}
      <AreasFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        areaId={editingAreaId}
        defaultClientId={clientId}
        defaultClientName={clientName}
      />
    </div>
  )
}
