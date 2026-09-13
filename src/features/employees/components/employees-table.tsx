/**
 * Employees Table Component
 * Using standardized DataTable with row selection
 */
import { useEffect, useState, useCallback } from 'react'
import { Trash2, UserPlus, Upload, Globe, Smartphone } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { useEmployeesStore } from '@/features/employees'
import { EmployeesFilters } from './employees-filters'
import { EmployeesImportModal } from './employees-import-modal'
import { employeesApi } from '@/features/employees/api/employees-api'
import type { Employee } from '@/features/employees'

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
  const [showImportModal, setShowImportModal] = useState(false)

  // Toggle login access handlers
  const handleToggleLoginAccess = async (employee: Employee, type: 'web' | 'mobile', enabled: boolean) => {
    if (!employee.user_id) {
      toast.error('Employee has no user account')
      return
    }
    try {
      await employeesApi.toggleLoginAccess(employee.id, type, enabled)
      toast.success(`${type === 'web' ? 'Web' : 'Mobile'} login ${enabled ? 'enabled' : 'disabled'}`)
      // Refresh data
      fetchEmployees({
        search: filters.search,
        client_id: filters.client_id,
        area_id: filters.area_id,
        backoffice: filters.backoffice,
        page: 1,
        per_page: 15
      })
    } catch {
      toast.error('Failed to update login access')
    }
  }

  // Single source of truth for fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees({
        search: filters.search,
        client_id: filters.client_id,
        area_id: filters.area_id,
        backoffice: filters.backoffice,
        page: 1,
        per_page: 15
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.client_id, filters.area_id, filters.backoffice])

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
    fetchEmployees({
      search: filters.search,
      client_id: filters.client_id,
      area_id: filters.area_id,
      backoffice: filters.backoffice,
      page: newPage,
      per_page: 15
    })
  }, [fetchEmployees, filters, pagination.last_page])

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

  const handleEdit = (employee: Employee) => {
    navigate({ to: '/employees/$id/edit', params: { id: String(employee.id) } })
  }

  // Define columns
  const columns: DataTableColumn<Employee>[] = [
    {
      accessorKey: 'photo',
      header: '',
      cell: (row) => {
        const photoUrl = row.photo ? `/storage/${row.photo}` : null
        if (photoUrl) {
          return (
            <img
              src={photoUrl}
              alt={row.name}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )
        }
        return (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {row.name?.charAt(0).toUpperCase()}
          </div>
        )
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-medium block">{row.name || '-'}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="font-mono">NIK: {row.code || '-'}</span>
            {row.role_name && (
              <>
                <span>|</span>
                <span>{row.role_name}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'client_name',
      header: 'Placement',
      cell: (row) => (
        <div className="text-xs">
          {row.client_name ? (
            <div className="space-y-0.5">
              <span className="font-medium text-foreground">{row.client_name}</span>
              {row.area_name && <div className="text-muted-foreground">{row.area_name}</div>}
              {row.pos_name && <div className="text-muted-foreground/70">{row.pos_name}</div>}
            </div>
          ) : (
            <span className="italic text-yellow-600">No placement</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'user_email',
      header: 'Login Access',
      cell: (row) => (
        <div className="text-xs" onClick={(e) => e.stopPropagation()}>
          {row.user_email ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground truncate max-w-[120px]">{row.user_email}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    row.user_status === 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {row.user_status === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
              {/* Login Access Toggles */}
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <Switch
                    checked={row.can_login_web ?? true}
                    onCheckedChange={(checked) => handleToggleLoginAccess(row, 'web', checked)}
                    disabled={!row.user_id}
                    className="h-4 w-7"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3 text-muted-foreground" />
                  <Switch
                    checked={row.can_login_mobile ?? true}
                    onCheckedChange={(checked) => handleToggleLoginAccess(row, 'mobile', checked)}
                    disabled={!row.user_id}
                    className="h-4 w-7"
                  />
                </div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground italic">No user account</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === 1
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button onClick={handleAddNew}>
            <UserPlus className="h-4 w-4 mr-1" />
            Add Employee
          </Button>
        </div>
      </div>

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
        onRowClick={handleEdit}
      />

      {/* Delete Confirmation */}
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

      {/* Import Modal */}
      {showImportModal && (
        <EmployeesImportModal
          open={showImportModal}
          onOpenChange={setShowImportModal}
        />
      )}
    </div>
  )
}
