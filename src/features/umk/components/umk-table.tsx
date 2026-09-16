/**
 * UMK Table Component
 * Upah Minimum Kota with year filter and grouping by city
 */
import {useEffect, useState, useCallback, useMemo} from 'react'
import {Plus, Trash2} from 'lucide-react'
import {toast} from 'sonner'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {DataTable, type DataTableColumn} from '@/components/ui/data-table'
import {useUmkStore} from '../store/umk-store'
import {UmkFormModal} from './umk-form-modal'
import type {UMK} from '../types/umk.types'

export function UmkTable() {
    const {
        items,
        isLoading,
        pagination,
        filters,
        fetchItems,
        bulkDelete,
        isSubmitting,
        setFilters,
    } = useUmkStore()

    const [search, setSearch] = useState('')
    const [yearFilter, setYearFilter] = useState<string>('')
    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
    const [editingId, setEditingId] = useState<number | undefined>(undefined)

    // Get available years from data
    const availableYears = useMemo(() => {
        const years = new Set<number>()
        items.forEach((item) => years.add(item.year))
        return Array.from(years).sort((a, b) => b - a)
    }, [items])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters({search})
        }, 300)
        return () => clearTimeout(timer)
    }, [search, setFilters])

    // Fetch on year filter change
    useEffect(() => {
        const year = yearFilter ? parseInt(yearFilter, 10) : undefined
        fetchItems({...filters, year, page: 1})
    }, [yearFilter]) // eslint-disable-line react-hooks/exhaustive-deps

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
        fetchItems({...filters, page: newPage})
    }, [fetchItems, filters, pagination.last_page])

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        setIsDeleting(true)
        try {
            await bulkDelete(Array.from(selectedIds).map(Number))
            toast.success(`${selectedIds.size} UMK berhasil dihapus`)
            setSelectedIds(new Set())
            setShowDeleteConfirm(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Gagal menghapus UMK')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleAddNew = () => {
        setFormMode('create')
        setEditingId(undefined)
        setShowFormModal(true)
    }

    const handleEdit = (umk: UMK) => {
        setFormMode('edit')
        setEditingId(umk.id)
        setShowFormModal(true)
    }

    // Bulk actions
    const bulkActions = (
        <div className="flex gap-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedIds.size === 0}
                className="text-white"
            >
                <Trash2 className="h-4 w-4 mr-1"/>
                Hapus ({selectedIds.size})
            </Button>
        </div>
    )

    const columns: DataTableColumn<UMK>[] = [
        {
            accessorKey: 'city',
            header: 'Kota',
            cell: (row) => (
                <span className="font-medium">{row.city}</span>
            ),
        },
        {
            accessorKey: 'province',
            header: 'Provinsi',
            cell: (row) => (
                <span className="text-muted-foreground">{row.province}</span>
            ),
        },
        {
            accessorKey: 'year',
            header: 'Tahun',
            cell: (row) => (
                <span className="font-mono">{row.year}</span>
            ),
        },
        {
            accessorKey: 'value',
            header: 'Nilai UMK',
            cell: (row) => (
                <span className="font-semibold text-green-700">
          {row.formatted_value}
        </span>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {/* Year Filter */}
                    <div className="w-40">
                        <Select
                            value={yearFilter}
                            onValueChange={(value) => setYearFilter(value || '')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Tahun"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Semua Tahun</SelectItem>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="relative w-64">
                        <Input
                            type="text"
                            placeholder="Cari kota atau provinsi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                </div>

                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2"/>
                    Tambah UMK
                </Button>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={items}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                emptyMessage="Tidak ada data UMK"
                enableRowSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                bulkActions={bulkActions}
                onRowClick={handleEdit}
            />

            {/* Bulk Delete Confirmation */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus {selectedIds.size} UMK yang dipilih? Tindakan ini tidak
                            dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting || isSubmitting}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Form Modal */}
            <UmkFormModal
                open={showFormModal}
                onOpenChange={setShowFormModal}
                mode={formMode}
                umkId={editingId}
                onSuccess={() => fetchItems(filters)}
            />
        </div>
    )
}
