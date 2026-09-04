/**
 * Approval Types Table Component (User-Friendly)
 * Single table with inline flow display
 */
import { useEffect, useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useApprovalTypesStore } from '../store/approval-types-store'
import { ApprovalTypesFormModal } from './approval-types-form-modal'
import type { ApprovalType } from '../types/approval-types.types'
import { toast } from 'sonner'

export function ApprovalTypesTable() {
  const { items, fetchTypes, deleteType, isLoading } = useApprovalTypesStore()
  const [showModal, setShowModal] = useState(false)
  const [editingType, setEditingType] = useState<ApprovalType | null>(null)

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

  const handleDelete = async (type: ApprovalType) => {
    if (!confirm(`Hapus jenis pengajuan "${type.name}"?`)) return

    try {
      await deleteType(type.id)
      toast.success('Jenis pengajuan berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus jenis pengajuan')
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
    {
      id: 'actions',
      header: 'Aksi',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
    </div>
  )
}
