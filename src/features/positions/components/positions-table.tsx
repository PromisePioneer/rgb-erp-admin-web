/**
 * Positions Table Component
 * Display positions grouped by company with hierarchical indentation
 */
import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Smartphone, ChevronRight, ChevronDown, Building2 } from 'lucide-react'
import { navigateToPositionPrivileges } from '@/lib/navigation'
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
import { PositionsFormModal } from './positions-form-modal'
import { usePositionsStore } from '../store/positions-store'
import type { Position } from '../types/positions.types'

interface PositionWithLevel extends Position {
  level: number
  companyName: string
  isExpanded: boolean
}

interface CompanyGroup {
  companyId: number | null
  companyName: string
  positions: PositionWithLevel[]
}

export function PositionsTable() {
  const {
    items,
    isLoading,
    fetchPositions,
    bulkDelete,
    isSubmitting,
  } = usePositionsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number | null>>(new Set([null])) // Start with universal expanded

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingPositionId, setEditingPositionId] = useState<number | undefined>(undefined)

  // Fetch all positions (no pagination for hierarchy view)
  useEffect(() => {
    fetchPositions({ per_page: 'all' as any })
  }, [fetchPositions])

  // Build company groups with hierarchy
  const companyGroups = useMemo(() => {
    const groups: Map<number | null, CompanyGroup> = new Map()

    // Initialize groups
    groups.set(null, { companyId: null, companyName: 'Universal (All Companies)', positions: [] })
    groups.set(1, { companyId: 1, companyName: 'SATPAM (RGB)', positions: [] })
    groups.set(2, { companyId: 2, companyName: 'NON-SATPAM (RBM)', positions: [] })

    // Add level to each position
    const positionsWithLevel: PositionWithLevel[] = items.map(p => {
      let level = 0
      let current = p
      // Calculate level by walking up the tree
      const positionMap = new Map(items.map(item => [item.id, item]))
      while (current.parent_position_id) {
        level++
        const parent = positionMap.get(current.parent_position_id)
        if (parent) {
          current = parent
        } else {
          break
        }
      }
      return {
        ...p,
        level,
        companyName: p.company_id === 1 ? 'SATPAM (RGB)' : p.company_id === 2 ? 'NON-SATPAM (RBM)' : 'Universal',
        isExpanded: true,
      }
    })

    // Group by company
    positionsWithLevel.forEach(pos => {
      const group = groups.get(pos.company_id)
      if (group) {
        group.positions.push(pos)
      }
    })

    // Sort positions within each group by level
    groups.forEach(group => {
      group.positions.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level
        return a.name.localeCompare(b.name)
      })
    })

    return Array.from(groups.values()).filter(g => g.positions.length > 0)
  }, [items])

  const toggleCompany = (companyId: number | null) => {
    setExpandedCompanies(prev => {
      const next = new Set(prev)
      if (next.has(companyId)) {
        next.delete(companyId)
      } else {
        next.add(companyId)
      }
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsDeleting(true)
    try {
      await bulkDelete(Array.from(selectedIds))
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
    setEditingPositionId(undefined)
    setShowFormModal(true)
  }

  const handleEdit = (position: Position) => {
    setFormMode('edit')
    setEditingPositionId(position.id)
    setShowFormModal(true)
  }

  const handleMobilePrivileges = (position: Position) => {
    navigateToPositionPrivileges(position.id)
  }

  const toggleSelectAll = (companyPositions: PositionWithLevel[]) => {
    const allSelected = companyPositions.every(p => selectedIds.has(p.id))
    if (allSelected) {
      // Deselect all in this company
      setSelectedIds(prev => {
        const next = new Set(prev)
        companyPositions.forEach(p => next.delete(p.id))
        return next
      })
    } else {
      // Select all in this company
      setSelectedIds(prev => {
        const next = new Set(prev)
        companyPositions.forEach(p => next.add(p.id))
        return next
      })
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Position Hierarchy</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length} positions)
          </span>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-1" />
            Add Position
          </Button>
        </div>
      </div>

      {/* Company Groups with Hierarchy */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          companyGroups.map(group => {
            const isExpanded = expandedCompanies.has(group.companyId)
            const allSelected = group.positions.length > 0 && group.positions.every(p => selectedIds.has(p.id))
            const someSelected = group.positions.some(p => selectedIds.has(p.id))

            return (
              <div key={group.companyId ?? 'universal'} className="border rounded-lg overflow-hidden">
                {/* Company Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleCompany(group.companyId)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{group.companyName}</span>
                  <span className="text-sm text-muted-foreground">
                    ({group.positions.length} positions)
                  </span>
                  <div className="ml-auto">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelectAll(group.positions)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>
                </div>

                {/* Positions List */}
                {isExpanded && (
                  <div className="divide-y">
                    {group.positions.map(position => (
                      <div
                        key={position.id}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        {/* Indent based on level */}
                        <div style={{ width: position.level * 24 + 20 }} className="flex-shrink-0">
                          {position.level > 0 && (
                            <div className="flex items-center">
                              <div className="w-4 border-b border-l h-4 ml-2" />
                              <div className="w-4 border-b h-0" />
                            </div>
                          )}
                        </div>

                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedIds.has(position.id)}
                          onChange={() => toggleSelect(position.id)}
                          className="w-4 h-4 rounded border-gray-300 flex-shrink-0"
                        />

                        {/* Position Name */}
                        <button
                          type="button"
                          onClick={() => handleEdit(position)}
                          className="font-medium text-primary hover:underline text-left cursor-pointer flex-1"
                        >
                          {position.name}
                        </button>

                        {/* Status */}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                            position.status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {position.status === 1 ? 'Active' : 'Inactive'}
                        </span>

                        {/* Privilege Button */}
                        <button
                          type="button"
                          onClick={() => handleMobilePrivileges(position)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex-shrink-0"
                          title="Manage Mobile Privileges"
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                          Privilege
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} position yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

      {/* Position Form Modal */}
      <PositionsFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        positionId={editingPositionId}
      />
    </div>
  )
}
