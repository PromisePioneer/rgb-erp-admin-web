/**
 * Employees Table Component
 * Using standardized DataTable with row selection
 */
import { useEffect, useState, useCallback } from 'react'
import { Trash2, UserPlus, CreditCard } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
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
import { useEmployeesStore } from '@/features/employees'
import { EmployeesFilters } from './employees-filters'
import type { Employee } from '@/features/employees'
import { apiClient } from '@/lib/api-client'

export function EmployeesTable() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    pagination,
    fetchEmployees,
    filters,
    bulkDelete,
    isSubmitting,
  } = useEmployeesStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees({ search: filters.search, company_id: filters.company_id, page: 1, per_page: 15 })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.company_id])

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
    fetchEmployees({ search: filters.search, company_id: filters.company_id, page: newPage, per_page: 15 })
  }, [fetchEmployees, filters.search, filters.company_id, pagination.last_page])

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
    navigate({ to: '/employees/new' })
  }

  const handleRowClick = (employee: Employee) => {
    navigate({ to: '/employees/$id/edit', params: { id: String(employee.id) } })
  }

  const handleGenerateIdCard = (employee: Employee) => {
    // Open in new tab or download directly
    window.open(`/api/admin/employees/${employee.id}/id-card`, '_blank')
  }

  // Define columns
  const columns: DataTableColumn<Employee>[] = [
    {
      accessorKey: 'photo',
      header: 'Photo',
      cell: (row) => {
        const photoUrl = row.photo ? `/storage/${row.photo}` : null
        return photoUrl ? (
          <img
            src={photoUrl}
            alt={row.name}
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              // Hide broken image and show initial instead
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null
      },
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: (row) => (
        <span className="font-mono text-sm">{row.code || '-'}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleRowClick(row)
          }}
          className="font-medium text-primary hover:underline text-left cursor-pointer"
        >
          {row.name}
        </button>
      ),
    },
    {
      accessorKey: 'company_name',
      header: 'Company',
      cell: (row) => (
          <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRowClick(row)
              }}
              className="font-medium text-primary hover:underline text-left cursor-pointer"
          >
            {row.company_name}
          </button>
      ),
    },
    {
      accessorKey: 'position_name',
      header: 'Position',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.position_name ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'client_name',
      header: 'Client',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.client_name ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'area_name',
      header: 'Area',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.area_name ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'pos_name',
      header: 'POS',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.pos_name ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: (row) => (
        <span className="font-mono text-sm">
          {row.phone ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 1
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleGenerateIdCard(row)
          }}
        >
          <CreditCard className="h-4 w-4 mr-1" />
          ID Card
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
        <EmployeesFilters />
        <Button onClick={handleAddNew}>
          <UserPlus className="h-4 w-4 mr-1" />
          Add Employee
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
        emptyMessage="No employees found"
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
              Apakah Anda yakin ingin menghapus {selectedIds.size} employee yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  )
}
