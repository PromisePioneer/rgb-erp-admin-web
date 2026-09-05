/**
 * Accounts Table Component
 * Using standardized DataTable with modal form
 */
import {useEffect, useState, useCallback} from 'react'
import {Plus, Trash2} from 'lucide-react'
import {Button} from '@/components/ui/button'
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
import {DataTable, type DataTableColumn} from '@/components/ui/data-table'
import {useAccountsStore} from '../store/accounts-store'
import {AccountsFilters} from './accounts-filters'
import {AccountsFormModal} from './accounts-form-modal'
import type {Account} from '../types/accounts.types'

export function AccountsTable() {
    const {
        items,
        isLoading,
        pagination,
        fetchAccounts,
        filters,
        bulkDelete,
        isSubmitting,
    } = useAccountsStore()

    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Form modal state
    const [showFormModal, setShowFormModal] = useState(false)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

    // Single source of truth for fetch - debounced, primitive dependencies
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAccounts({
                search: filters.search,
                type: filters.type,
                page: 1,
                per_page: 15,
            })
        }, 300)
        return () => clearTimeout(timer)
    }, [filters.search, filters.type])

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
        fetchAccounts({
            search: filters.search,
            type: filters.type,
            page: newPage,
            per_page: 15,
        })
    }, [fetchAccounts, filters.search, filters.type, pagination.last_page])

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
        setSelectedAccount(null)
        setShowFormModal(true)
    }

    const handleEdit = (account: Account) => {
        setFormMode('edit')
        setSelectedAccount(account)
        setShowFormModal(true)
    }

    // Define columns
    const columns: DataTableColumn<Account>[] = [
        {
            accessorKey: 'code',
            header: 'Kode',
            cell: (row) => (
                <span className="font-mono text-sm font-medium">
            {row.code}
          </span>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Nama Akun',
            cell: (row) => (
                <span className="font-medium text-left">
            {row.name}
          </span>
            ),
        },
        {
            accessorKey: 'type_label',
            header: 'Tipe',
            cell: (row) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getTypeColorClass(row.type)
                    }`}
                >
            {row.type_label}
          </span>
            ),
        },
];

    // Bulk actions
    const bulkActions = (
        <div className="flex gap-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedIds.size === 0}
            >
                <Trash2 className="h-4 w-4 mr-1"/>
                Delete Selected ({selectedIds.size})
            </Button>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <AccountsFilters/>
                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-1"/>
                    Tambah Akun
                </Button>
            </div>


            <DataTable
                columns={columns}
                data={items}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                emptyMessage="Tidak ada akun ditemukan"
                enableRowSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                bulkActions={bulkActions}
                onRowClick={handleEdit}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus {selectedIds.size} akun yang dipilih? Tindakan ini tidak
                            dapat dibatalkan.
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

            {/* Create/Edit Form Modal */}
            <AccountsFormModal
                open={showFormModal}
                onOpenChange={setShowFormModal}
                mode={formMode}
                account={selectedAccount}
            />
        </div>
    )
}

// Helper function to get badge color based on account type
function getTypeColorClass(type: string): string {
    switch (type) {
        case 'asset':
            return 'bg-blue-100 text-blue-800'
        case 'liability':
            return 'bg-red-100 text-red-800'
        case 'equity':
            return 'bg-purple-100 text-purple-800'
        case 'revenue':
            return 'bg-green-100 text-green-800'
        case 'expense':
            return 'bg-orange-100 text-orange-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}
