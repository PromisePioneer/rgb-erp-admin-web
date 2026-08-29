/**
 * Approval Flows Table Component
 * Read-only view with edit button to open modal
 */
import { useEffect, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { useApprovalFlowsStore } from '../store/approval-flows-store'
import { ApprovalFlowsFormModal } from './approval-flows-form-modal'
import type { ApprovalFlow } from '../types/approval-flows.types'

export function ApprovalFlowsTable() {
  const { items, fetchFlows, isLoading } = useApprovalFlowsStore()
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Dummy pagination for non-paginated table
  const pagination = {
    current_page: 1,
    per_page: items.length || 10,
    total: items.length,
    last_page: 1,
  }

  useEffect(() => {
    fetchFlows()
  }, [fetchFlows])

  const handlePageChange = () => {}

  const handleEdit = (flow: ApprovalFlow) => {
    setEditingFlow(flow)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFlow(null)
  }

  // Define columns
  const columns: DataTableColumn<ApprovalFlow>[] = [
    {
      accessorKey: 'name',
      header: 'Request Type',
      cell: (row) => (
        <span className="font-medium">{row.name}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type Code',
      cell: (row) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">{row.type}</code>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      accessorKey: 'steps',
      header: 'Steps',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.steps.length} step{row.steps.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      accessorKey: 'steps',
      header: 'Approvers',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.steps.slice(0, 3).map((step, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted"
            >
              L{step.level}: {step.approver_label}
            </span>
          ))}
          {row.steps.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{row.steps.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleEdit(row)
          }}
        >
          <Settings2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Settings2 className="h-4 w-4" />
        <span>Configure approval workflows for different request types</span>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No approval flows configured"
      />

      {showModal && editingFlow && (
        <ApprovalFlowsFormModal
          flow={editingFlow}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
