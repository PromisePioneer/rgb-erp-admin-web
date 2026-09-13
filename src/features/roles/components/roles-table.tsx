/**
 * Roles Table Component
 * Unlimited hierarchy levels:
 * - Card 1: Shared roles (company_id = NULL)
 * - Card 2: Company-specific roles (company_id = selected company)
 */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Trash2, Shield, ChevronRight, ChevronDown, Building2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { RolesFormModal } from './roles-form-modal'
import { useRolesStore } from '../store/roles-store'
import { RolesFilters } from './roles-filters'
import type { Role } from '../types/roles.types'
import { cn } from '@/lib/utils'

interface RoleNode extends Role {
  level: number
  children: RoleNode[]
}

export function RolesTable() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    fetchRoles,
    fetchAllRoles,
    filters,
    bulkDelete,
    isSubmitting,
  } = useRolesStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | undefined>(undefined)

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchRoles(filters)
    fetchAllRoles() // Fetch all for parent dropdown
  }, [fetchRoles, fetchAllRoles, filters])

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

  // Build hierarchy tree (recursive, unlimited levels)
  const buildHierarchyTree = useCallback((roles: Role[]): RoleNode[] => {
    const roleMap = new Map<number, RoleNode>()
    const roots: RoleNode[] = []

    // First pass: create all nodes
    roles.forEach((role) => {
      roleMap.set(role.id, { ...role, level: 0, children: [] })
    })

    // Second pass: build tree structure
    roles.forEach((role) => {
      const node = roleMap.get(role.id)!
      if (role.parent_role_id && roleMap.has(role.parent_role_id)) {
        const parent = roleMap.get(role.parent_role_id)!
        node.level = parent.level + 1
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    })

    // Sort children by name at each level
    const sortChildren = (nodes: RoleNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach((node) => sortChildren(node.children))
    }
    sortChildren(roots)

    return roots
  }, [])

  // Flatten tree for rendering (with expand/collapse state)
  const flattenTree = useCallback((nodes: RoleNode[], expandedIds: Set<number>): { node: RoleNode, isVisible: boolean }[] => {
    const result: { node: RoleNode, isVisible: boolean }[] = []

    const traverse = (nodeList: RoleNode[], parentExpanded: boolean) => {
      nodeList.forEach((node) => {
        const isExpanded = expandedIds.has(node.id)
        const isVisible = parentExpanded || node.level === 0 // Root level always visible, others depend on parent expansion
        result.push({ node, isVisible })

        if (node.children.length > 0) {
          traverse(node.children, isExpanded && parentExpanded)
        }
      })
    }

    traverse(nodes, true) // Start with root level visible
    return result
  }, [])

  // Group items into shared (null company) and company-specific
  const { sharedRoles, companyRoles } = useMemo(() => {
    const shared = items.filter((item) => item.company_id === null)
    const company = items.filter((item) => item.company_id !== null)
    return { sharedRoles: shared, companyRoles: company }
  }, [items])

  // Build trees
  const sharedTree = useMemo(() => buildHierarchyTree(sharedRoles), [sharedRoles, buildHierarchyTree])
  const companyTree = useMemo(() => buildHierarchyTree(companyRoles), [companyRoles, buildHierarchyTree])

  // Flatten for rendering
  const sharedFlat = useMemo(() => flattenTree(sharedTree, expandedIds), [sharedTree, expandedIds, flattenTree])
  const companyFlat = useMemo(() => flattenTree(companyTree, expandedIds), [companyTree, expandedIds, flattenTree])

  // Toggle expand
  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
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

  // Handle select all for visible items
  const handleSelectAllVisible = useCallback((checked: boolean, visibleItems: RoleNode[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      visibleItems.forEach((item) => {
        if (checked) {
          next.add(String(item.id))
        } else {
          next.delete(String(item.id))
        }
      })
      return next
    })
  }, [])

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

  const handleEdit = (item: Role) => {
    setFormMode('edit')
    setEditingId(item.id)
    setShowFormModal(true)
  }

  // Status badge helper
  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Aktif
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Tidak Aktif
      </span>
    )
  }

  // Get indent spacing based on level
  const getIndent = (level: number) => {
    return level * 8 // 8px per level
  }

  // Render a single role row
  const renderRoleRow = (node: RoleNode, isVisible: boolean, treeType: 'shared' | 'company') => {
    const isSelected = selectedIds.has(String(node.id))
    const isExpanded = expandedIds.has(node.id)
    const hasChildren = node.children.length > 0

    // Indent based on level
    const indentPx = getIndent(node.level)

    // Get parent name from items
    const parentItem = items.find((i) => i.id === node.parent_role_id)

    return (
      <TableRow
        key={`${treeType}-${node.id}`}
        className={cn(
          'cursor-pointer hover:bg-muted/50',
          isSelected && 'bg-muted/50',
          node.level > 0 && 'bg-muted/30',
          !isVisible && 'hidden'
        )}
        onClick={() => handleEdit(node)}
      >
        <TableCell className="w-[40px]">
          <Checkbox
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              handleSelect(node.id, e.target.checked)
            }}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indentPx}px` }}>
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(node.id)
                }}
                className="p-0.5 hover:bg-muted rounded flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <span className="w-5 flex-shrink-0" />
            )}
            {node.level === 0 ? (
              <span className="text-yellow-600">👑</span>
            ) : (
              <span className="text-muted-foreground text-xs">└</span>
            )}
            <span className={cn(node.level === 0 && 'font-medium')}>{node.name}</span>
            {hasChildren && (
              <span className="text-xs text-muted-foreground ml-2">
                ({node.children.length})
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {node.parent_role_id ? (
              parentItem?.parent_role_name || node.parent_role_name || '-'
            ) : (
              <span className="text-green-600 font-medium">Auto Approve</span>
            )}
          </span>
        </TableCell>
        <TableCell>{getStatusBadge(node.status)}</TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate({ to: '/roles/$id/privileges', params: { id: String(node.id) } })
            }}
          >
            <Shield className="h-4 w-4 mr-1" />
            Privilege
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  // Render table
  const renderTable = (
    flatList: { node: RoleNode, isVisible: boolean }[],
    allNodes: RoleNode[],
    type: 'shared' | 'company'
  ) => {
    const visibleNodes = flatList.filter((f) => f.isVisible)
    const isAllSelected = visibleNodes.length > 0 && visibleNodes.every((f) => selectedIds.has(String(f.node.id)))

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={isAllSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked, allNodes)}
              />
            </TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Approver (Parent)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))
          ) : flatList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Tidak ada data
              </TableCell>
            </TableRow>
          ) : (
            flatList.map((item) => renderRoleRow(item.node, item.isVisible, type))
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <RolesFilters />
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Role
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Card 1: Shared Roles (company_id = NULL) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Roles Bersama</CardTitle>
          </div>
          <CardDescription>
            Roles yang bisa digunakan oleh semua company ({sharedRoles.length} roles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {renderTable(sharedFlat, sharedTree, 'shared')}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Company-Specific Roles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Roles Company</CardTitle>
          </div>
          <CardDescription>
            Roles spesifik untuk company ini ({companyRoles.length} roles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {renderTable(companyFlat, companyTree, 'company')}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} role
              yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

      {/* Role Form Modal */}
      <RolesFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        mode={formMode}
        roleId={editingId}
      />
    </div>
  )
}
