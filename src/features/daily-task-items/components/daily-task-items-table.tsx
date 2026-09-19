/**
 * Daily Task Items Table Component
 * With proper hierarchy display (parent -> children)
 */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Plus, Trash2, Upload, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { DailyTaskItemsFormModal } from './daily-task-items-form-modal'
import { DailyTaskItemsFilters } from './daily-task-items-filters'
import { DailyTaskItemsImportModal } from './daily-task-items-import-modal'
import { useDailyTaskItemsStore } from '../store/daily-task-items-store'
import { useCanAccess } from '@/lib/privilege-guard'
import { cn } from '@/lib/utils'
import type { DailyTaskItem } from '../types/daily-task-items.types'

export function DailyTaskItemsTable() {
  const {
    items,
    isLoading,
    pagination,
    filters,
    fetchItems,
    bulkDelete,
    isSubmitting,
  } = useDailyTaskItemsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [showImportModal, setShowImportModal] = useState(false)

  const canAdd = useCanAccess('Daily Task Item', 'Add')

  // Debounced fetch on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems({ ...filters, page: 1 })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.status, filters.role_id])

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

  // Group items into parents and children
  const { parents, childrenByParent } = useMemo(() => {
    const parentItems = items.filter((item) => item.is_root)
    const childItems = items.filter((item) => !item.is_root)
    const childrenMap = new Map<number, DailyTaskItem[]>()

    childItems.forEach((child) => {
      if (child.parent_item_id) {
        const existing = childrenMap.get(child.parent_item_id) || []
        childrenMap.set(child.parent_item_id, [...existing, child])
      }
    })

    // Sort children by name
    childrenMap.forEach((children) => {
      children.sort((a, b) => a.name.localeCompare(b.name))
    })

    return { parents: parentItems, childrenByParent: childrenMap }
  }, [items])

  // Toggle parent expansion
  const toggleExpand = useCallback((parentId: number) => {
    setExpandedParents((prev) => {
      const next = new Set(prev)
      if (next.has(parentId)) {
        next.delete(parentId)
      } else {
        next.add(parentId)
      }
      return next
    })
  }, [])

  // Handle row selection
  const handleSelect = useCallback((id: number | string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(String(id))
      } else {
        next.delete(String(id))
      }
      return next
    })
  }, [])

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map((item) => String(item.id))))
    } else {
      setSelectedIds(new Set())
    }
  }, [items])

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.has(String(item.id)))

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > pagination.last_page) return
      fetchItems({ ...filters, page: newPage })
    },
    [fetchItems, filters, pagination.last_page]
  )

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
    setEditingId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (item: DailyTaskItem) => {
    setFormMode('edit')
    setEditingId(item.id)
    setShowFormModal(true)
  }

  // Status badge helper
  const getStatusBadge = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Aktif
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Tidak Aktif
      </span>
    )
  }

  // Render parent row with children
  const renderParentRow = (parent: DailyTaskItem) => {
    const children = childrenByParent.get(parent.id) || []
    const isExpanded = expandedParents.has(parent.id)
    const isSelected = selectedIds.has(String(parent.id))
    const hasChildren = children.length > 0

    return (
      <TableRow
        key={parent.id}
        className={cn(
          'cursor-pointer hover:bg-muted/50',
          isSelected && 'bg-muted/50'
        )}
        onClick={() => handleEdit(parent)}
      >
        <TableCell className="w-[40px]">
          <Checkbox
            checked={isSelected}
            onChange={(e) => handleSelect(parent.id, e.target.checked)}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(parent.id)
                }}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className="text-yellow-600">📁</span>
            <span className="font-medium">{parent.name}</span>
            {hasChildren && (
              <span className="text-xs text-muted-foreground ml-2">
                ({children.length} anak)
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {parent.role_name || '-'}
          </span>
        </TableCell>
        <TableCell>{getStatusBadge(parent.status)}</TableCell>
      </TableRow>
    )
  }

  // Render child rows
  const renderChildRow = (child: DailyTaskItem) => {
    const isSelected = selectedIds.has(String(child.id))

    return (
      <TableRow
        key={child.id}
        className={cn(
          'cursor-pointer hover:bg-muted/50 bg-muted/30',
          isSelected && 'bg-muted'
        )}
        onClick={() => handleEdit(child)}
      >
        <TableCell className="w-[40px]">
          <Checkbox
            checked={isSelected}
            onChange={(e) => handleSelect(child.id, e.target.checked)}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 pl-8">
            <span className="text-muted-foreground">└──</span>
            <span>{child.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground italic">
            {child.parent_item_name || '-'}
          </span>
        </TableCell>
        <TableCell>{getStatusBadge(child.status)}</TableCell>
      </TableRow>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DailyTaskItemsFilters />
        {canAdd && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Item
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md border">
          <span className="text-sm font-medium">{selectedIds.size} dipilih</span>
          <div className="flex-1" />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Hapus Terpilih
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              parents.map((parent) => {
                const children = childrenByParent.get(parent.id) || []
                const isExpanded = expandedParents.has(parent.id)

                return [
                  renderParentRow(parent),
                  isExpanded && children.map((child) => renderChildRow(child))
                ]
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} item yang dipilih?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Batal</AlertDialogCancel>
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

      {/* Item Form Modal */}
      <DailyTaskItemsFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        itemId={editingId}
        onSuccess={() => fetchItems(filters)}
      />

      {/* Import Modal */}
      <DailyTaskItemsImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onSuccess={() => fetchItems(filters)}
      />
    </div>
  )
}
