/**
 * Approval Types Table Component
 * CRUD management for approval types with flow configuration
 */
import { useEffect, useState } from 'react'
import { Plus, Settings2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Switch } from '@/components/ui/switch'
import { useApprovalTypesStore } from '../store/approval-types-store'
import { ApprovalTypesFormModal } from './approval-types-form-modal'
import { ApprovalFlowsFormModal } from './approval-flows-form-modal'
import type { ApprovalType } from '../types/approval-types.types'
import { toast } from 'sonner'

export function ApprovalTypesTable() {
  const { items, fetchTypes, saveType, deleteType, isLoading } = useApprovalTypesStore()
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [editingType, setEditingType] = useState<ApprovalType | null>(null)
  const [showFlowModal, setShowFlowModal] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)

  useEffect(() => {
    fetchTypes()
  }, [fetchTypes])

  const handleToggleActive = async (type: ApprovalType, isActive: boolean) => {
    try {
      await saveType({ name: type.name, is_active: isActive }, type.id)
      toast.success(`Type ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch {
      toast.error('Failed to update type status')
    }
  }

  const handleEdit = (type: ApprovalType) => {
    setEditingType(type)
    setShowTypeModal(true)
  }

  const handleConfigureFlow = (type: ApprovalType) => {
    setSelectedTypeId(type.id)
    setShowFlowModal(true)
  }

  const handleDelete = async (type: ApprovalType) => {
    if (!confirm(`Delete approval type "${type.name}"?`)) return

    try {
      await deleteType(type.id)
      toast.success('Type deleted successfully')
    } catch (error) {
      toast.error('Failed to delete type')
    }
  }

  const columns: DataTableColumn<ApprovalType>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type Code',
      cell: (row) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">{row.type}</code>
      ),
    },
    {
      accessorKey: 'steps_count',
      header: 'Steps',
      cell: (row) => (
        <span className={`text-sm ${row.steps_count > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
          {row.steps_count > 0 ? `${row.steps_count} step(s)` : 'Not configured'}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Active',
      cell: (row) => (
        <Switch
          checked={row.is_active}
          onCheckedChange={(checked) => handleToggleActive(row, checked)}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleConfigureFlow(row)}>
            <Settings2 className="h-4 w-4 mr-1" />
            Flow
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
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
          <Settings2 className="h-4 w-4" />
          <span>Manage request types that support approval workflows</span>
        </div>
        <Button onClick={() => { setEditingType(null); setShowTypeModal(true) }}>
          <Plus className="h-4 w-4 mr-1" />
          Add Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={{ current_page: 1, per_page: items.length || 10, total: items.length, last_page: 1 }}
        isLoading={isLoading}
        onPageChange={() => {}}
        emptyMessage="No approval types configured"
      />

      {showTypeModal && (
        <ApprovalTypesFormModal
          type={editingType}
          onClose={() => { setShowTypeModal(false); setEditingType(null) }}
        />
      )}

      {showFlowModal && selectedTypeId && (
        <ApprovalFlowsFormModal
          typeId={selectedTypeId}
          onClose={() => { setShowFlowModal(false); setSelectedTypeId(null) }}
        />
      )}
    </div>
  )
}
