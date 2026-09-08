/**
 * Products Table Component
 * Using standardized DataTable with modal form
 */
import {useEffect, useState, useCallback} from 'react'
import {Plus, Trash2, Package} from 'lucide-react'
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {DataTable, type DataTableColumn} from '@/components/ui/data-table'
import {useProductsStore} from '@/features/products'
import {ProductsFilters} from './products-filters'
import {ProductsFormModal} from '@/features/products'
import {productsApi, type StockDetail} from '../api/products-api'
import type {Product} from '../types/products.types'
import {
    calculateCondition,
    getConditionColor,
    getConditionLabel,
    type Condition,
} from '@/types/condition'

// Get condition based on category and stock
// Chemical: Full (>=75%), Half (>=50%), Quarter (>=25%), Habis (<25%)
// Non-chemical: Sangat Baik (>=85%), Baik (>=65%), Cukup Baik (>=45%), Kurang Baik (>=25%), Rusak (<25%)
function getProductCondition(categoryName: string | null, stock: number): Condition {
    return calculateCondition(categoryName, stock, 100)
}

// Modal component for stock detail
function StockDetailModal({
                              open,
                              onOpenChange,
                              product,
                          }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: Product | null
}) {
    const [stockDetails, setStockDetails] = useState<StockDetail[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (open && product) {
            setIsLoading(true)
            productsApi.getStock(product.id)
                .then((res) => {
                    setStockDetails(res.data)
                })
                .catch(console.error)
                .finally(() => setIsLoading(false))
        }
    }, [open, product])

    const totalStock = stockDetails.reduce((sum, s) => sum + s.stock, 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg" style={{width: '900px', maxWidth: '95vw'}}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5"/>
                        Stock Detail: {product?.name}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8 text-muted-foreground">
                        Memuat...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Total Stock Summary with Condition */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Stock</p>
                                    <p className="text-2xl font-bold">{totalStock} unit</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Kondisi</p>
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(getProductCondition(product?.category_name || null, totalStock))}`}>
                    {getConditionLabel(getProductCondition(product?.category_name || null, totalStock))}
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Stock per Warehouse */}
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Barcode</th>
                                    <th className="px-4 py-2 text-left font-medium">Gudang</th>
                                    <th className="px-4 py-2 text-right font-medium">Stock</th>
                                    <th className="px-4 py-2 text-right font-medium">Harga</th>
                                    <th className="px-4 py-2 text-center font-medium">Kondisi</th>
                                </tr>
                                </thead>
                                <tbody>
                                {stockDetails.map((detail) => {
                                    const condition = getProductCondition(product?.category_name || null, detail.stock)
                                    return (
                                        <tr key={detail.warehouse_id} className="border-b">
                                            <td className="px-4 py-2">
                                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                                    {detail.barcode}
                                                </code>
                                            </td>
                                            <td className="px-4 py-2">{detail.warehouse_name}</td>
                                            <td className="px-4 py-2 text-right font-mono">{detail.stock}</td>
                                            <td className="px-4 py-2 text-right font-mono">
                                                Rp {detail.base_price.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                          <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(condition)}`}>
                            {getConditionLabel(condition)}
                          </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend */}
                        <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-1">Legenda Kondisi:</p>
                            <div className="flex flex-wrap gap-2">
                                {product?.category_name?.toLowerCase().includes('chemical') ||
                                product?.category_name?.toLowerCase().includes('kimia') ? (
                                    <>
                                        <span
                                            className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Penuh (≥75)</span>
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Setengah (≥30)</span>
                                        <span
                                            className="bg-red-100 text-red-800 px-2 py-0.5 rounded">Habis (&lt;30)</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Sangat Baik (≥80)</span>
                                        <span
                                            className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Baik (≥50)</span>
                                        <span
                                            className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Cukup (≥30)</span>
                                        <span
                                            className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Kurang (≥10)</span>
                                        <span
                                            className="bg-red-100 text-red-800 px-2 py-0.5 rounded">Ganti (&lt;10)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

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
    const [showStockDetail, setShowStockDetail] = useState(false)
    const [stockProduct, setStockProduct] = useState<Product | null>(null)
    const [stockCache, setStockCache] = useState<Record<number, StockDetail[]>>({})

    // Fetch stock for all products on mount
    useEffect(() => {
        items.forEach((item) => {
            if (!stockCache[item.id]) {
                productsApi.getStock(item.id)
                    .then((res) => {
                        setStockCache((prev) => ({...prev, [item.id]: res.data}))
                    })
                    .catch(console.error)
            }
        })
    }, [items])

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

    const handleStockClick = (product: Product) => {
        setStockProduct(product)
        setShowStockDetail(true)
    }

    // Get total stock for a product
    const getTotalStock = (productId: number): number => {
        const details = stockCache[productId]
        if (!details) return 0
        return details.reduce((sum, d) => sum + d.stock, 0)
    }

    // Get condition for a product
    const getProductConditionForRow = (product: Product): Condition => {
        const totalStock = getTotalStock(product.id)
        return getProductCondition(product.category_name, totalStock)
    }

    // Define columns
    const columns: DataTableColumn<Product>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-left">
                        {row.name}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'category_name',
            header: 'Kategori',
            cell: (row) => (
                <span className="px-2 py-0.5 bg-muted rounded text-xs">
          {row.category_name ?? '-'}
        </span>
            ),
        },
        {
            id: 'stock',
            header: 'Stock',
            cell: (row) => {
                const totalStock = getTotalStock(row.id)
                const condition = getProductConditionForRow(row)
                return (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleStockClick(row)
                            }}
                            className="flex items-center gap-2"
                        >
                            <span className="font-mono">{totalStock > 0 ? totalStock : '-'}</span>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(condition)}`}>
                {getConditionLabel(condition)}
              </span>
                        </button>
                    </div>
                )
            },
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

    const columnsWithActions = columns

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
                Delete Selected
            </Button>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <ProductsFilters/>
                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-1"/>
                    Add Product
                </Button>
            </div>

            <DataTable
                columns={columnsWithActions}
                data={items}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                emptyMessage="No products found"
                enableRowSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                bulkActions={bulkActions}
                onRowClick={handleEdit}
            />

            {/* Form Modal */}
            <ProductsFormModal
                open={showFormModal}
                onOpenChange={setShowFormModal}
                product={editingProduct}
            />

            {/* Stock Detail Modal */}
            <StockDetailModal
                open={showStockDetail}
                onOpenChange={setShowStockDetail}
                product={stockProduct}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus {selectedIds.size} product yang dipilih? Tindakan ini
                            tidak dapat dibatalkan.
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
