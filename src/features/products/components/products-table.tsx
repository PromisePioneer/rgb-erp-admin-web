/**
 * Products Table Component
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
import { useProductsStore } from '../store/products-store'
import { ProductsFilters } from './products-filters'
import { ProductsFormModal } from './products-form-modal'
import type { Product } from '../types/products.types'

export function ProductsTable() {
  const {
    items,
    isLoading,
    pagination,
    fetchProducts,
    filters,
    bulkDelete,
    isSubmitting,
  } = useProductsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Single source of truth for fetch - debounced, primitive dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts({
        search: filters.search,
        category_id: filters.category_id,
        page: 1,
        per_page: 15
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.category_id])

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
    fetchProducts({
      search: filters.search,
      category_id: filters.category_id,
      page: newPage,
      per_page: 15
    })
  }, [fetchProducts, filters.search, filters.category_id, pagination.last_page])

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
    setEditingProduct(null)
    setShowFormModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowFormModal(true)
  }

  // Define columns
  const columns: DataTableColumn<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleEdit(row)
          }}
          className="font-medium text-primary hover:underline text-left cursor-pointer"
        >
          {row.name}
        </button>
      ),
    },
    {
      accessorKey: 'category_name',
      header: 'Category',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.category_name ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (row) => (
        <span className="max-w-[200px] truncate block" title={row.description ?? ''}>
          {row.description ?? '-'}
        </span>
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
          {row.status === 1 ? 'Aktif' : 'Tidak Aktif'}
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
        <ProductsFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Product
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
        emptyMessage="No products found"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
      />

      {/* Form Modal */}
      <ProductsFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        product={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} product yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
