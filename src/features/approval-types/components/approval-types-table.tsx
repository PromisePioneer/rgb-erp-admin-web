/**
 * Approval Types Table Component (User-Friendly)
 * Single table with inline flow display
 */
import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
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
import { useApprovalTypesStore } from '../store/approval-types-store'
import { ApprovalTypesFormModal } from './approval-types-form-modal'
import type { ApprovalType } from '../types/approval-types.types'

export function ApprovalTypesTable() {
  const { items, fetchTypes, isLoading, bulkDelete, isSubmitting } = useApprovalTypesStore()
  const [showModal, setShowModal] = useState(false)
  const [editingType, setEditingType] = useState<ApprovalType | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  useEffect(() => {
    fetchTypes()
  }, [fetchTypes])

  const handleAdd = () => {
    setEditingType(null)
    setShowModal(true)
  }

  const handleEdit = (type: ApprovalType) => {
    setEditingType(type)
    setShowModal(true)
  }

  const handleSelectionChange = (newSelectedIds: Set<number | string>) => {
    setSelectedIds(newSelectedIds)
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds).map(Number)
    if (ids.length === 0) return
    try {
      await bulkDelete(ids)
      toast.success(`${ids.length} items deleted`)
      setSelectedIds(new Set())
      setShowBulkDeleteDialog(false)
    } catch {
      toast.error('Delete failed')
    }
  }

  // Render approval flow as visual horizontal flow
  const renderFlow = (type: ApprovalType) => {
    if (type.steps_count === 0) {
      return (
        <span className="text-muted-foreground text-sm italic">
          Langsung disetujui (tanpa approver)
        </span>
      )
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {/* Start */}
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
          📝 Submit
        </span>

        {type.steps_summary.map((step, index) => (
          <div key={index} className="flex items-center">
            <span className="text-muted-foreground mx-1">→</span>
            <Badge variant="outline" className="gap-1 text-xs bg-primary/5">
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {index + 1}
              </span>
              {step.approver_name || 'Step ' + (index + 1)}
            </Badge>
          </div>
        ))}

        {/* End */}
        <span className="text-muted-foreground mx-1">→</span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
          ✓ Selesai
        </span>
      </div>
    )
  }

  const columns: DataTableColumn<ApprovalType>[] = [
    {
      accessorKey: 'name',
      header: 'Jenis Pengajuan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.name}</span>
          <span className="text-muted-foreground text-xs">{row.type}</span>
        </div>
      ),
    },
    {
      accessorKey: 'steps_summary',
      header: 'Alur Persetujuan',
      cell: (row) => renderFlow(row),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Kelola alur persetujuan untuk berbagai jenis pengajuan</span>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Jenis
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={{ current_page: 1, per_page: items.length || 10, total: items.length, last_page: 1 }}
        isLoading={isLoading}
        onPageChange={() => {}}
        emptyMessage="Belum ada jenis pengajuan. Klik 'Tambah Jenis' untuk membuat."
        onRowClick={handleEdit}
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        bulkActions={
          selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)}>
              Delete {selectedIds.size} item(s)
            </Button>
          )
        }
      />

      {showModal && (
        <ApprovalTypesFormModal
          type={editingType}
          onClose={() => {
            setShowModal(false)
            setEditingType(null)
          }}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selectedIds.size} items?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBulkDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
