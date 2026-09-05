/**
 * Bank Accounts Table Component
 * Using standardized DataTable with modal form
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
import { useBankAccountsStore } from '../store/bank-accounts-store'
import { BankAccountsFilters } from './bank-accounts-filters'
import { BankAccountsFormModal } from './bank-accounts-form-modal'
import type { BankAccount } from '../types/bank-accounts.types'

export function BankAccountsTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchBankAccounts,
    filters,
    bulkDelete,
    isSubmitting,
  } = useBankAccountsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editItem, setEditItem] = useState<BankAccount | null>(null)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBankAccounts({ search: filters.search, page: 1, per_page: 15 })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

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
    fetchBankAccounts({ search: filters.search, page: newPage, per_page: 15 })
  }, [fetchBankAccounts, filters.search, pagination.last_page])

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
    setEditItem(null)
    setShowFormModal(true)
  }

  const handleEdit = (item: BankAccount) => {
    setEditItem(item)
    setShowFormModal(true)
  }

  // Define columns
  const columns: DataTableColumn<BankAccount>[] = [
    {
      accessorKey: 'bank_name',
      header: 'Bank',
      cell: (row) => (
        <span className="font-medium">{row.bank_name ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'account_number',
      header: 'Account Number',
      cell: (row) => (
        <span className="font-mono text-sm">{row.account_number}</span>
      ),
    },
    {
      accessorKey: 'account_name',
      header: 'Account Name',
    },
    {
      accessorKey: 'branch_name',
      header: 'Branch',
      cell: (row) => (
        <span className="text-muted-foreground">{row.branch_name}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
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
        <BankAccountsFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Bank Account
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No bank accounts found."
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
        onRowClick={handleEdit}
      />

      {/* Form Modal */}
      <BankAccountsFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        editItem={editItem}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} bank account yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
