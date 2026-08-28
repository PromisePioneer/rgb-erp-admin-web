/**
 * Provinces Table Component
 */
import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useProvincesStore } from '../store/provinces-store'
import { ProvincesFormModal } from './provinces-form-modal'
import type { Province } from '../types/provinces.types'

export function ProvincesTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchProvinces,
    filters,
    remove,
    isSubmitting,
    setFilters,
  } = useProvincesStore()

  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | undefined>(undefined)

  // Debounce search -> store filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, setFilters])

  // Single fetch effect with primitive deps
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProvinces({ page: 1, per_page: 15 })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) return
    fetchProvinces({ search: filters.search, page: newPage, per_page: 15 })
  }, [fetchProvinces, filters.search, pagination.last_page])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await remove(deleteId)
      setDeleteId(null)
    } catch {
      // handled in store
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddNew = () => {
    setFormMode('create')
    setEditingId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (province: Province) => {
    setFormMode('edit')
    setEditingId(province.id)
    setShowFormModal(true)
  }

  const columns: DataTableColumn<Province>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Province',
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleEdit(row)}
          className="font-medium text-primary hover:underline text-left"
        >
          {row.name}
        </button>
      ),
    },
    {
      accessorKey: 'latin_code',
      header: 'Latin Code',
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.latin_code ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'romawi_code',
      header: 'Romawi',
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.romawi_code ?? '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search..."
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Province
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No provinces found"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus province ini? Tindakan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Modal */}
      <ProvincesFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        provinceId={editingId}
      />
    </div>
  )
}
