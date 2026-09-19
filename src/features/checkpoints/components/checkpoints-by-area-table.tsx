/**
 * Checkpoints Table - Grouped by Client > Area
 * Displays checkpoints organized by client and area with collapsible sections
 */
import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, MapPin, Key, Edit2, Building2 } from 'lucide-react'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useCheckpointsStore } from '@/features/checkpoints'
import { CheckpointsFormModal } from '@/features/checkpoints'
import type { Checkpoint } from '@/features/checkpoints'
import { toast } from 'sonner'

interface CheckpointWithRelations extends Checkpoint {
  area_name: string | null
  client_name: string | null
}

interface AreaGroup {
  area_name: string
  area_id: number
  checkpoints: CheckpointWithRelations[]
}

interface ClientGroup {
  client_name: string
  areas: AreaGroup[]
}

// Expand state key: "clientName" or "clientName|areaName"
type ExpandKey = string

export function CheckpointsByAreaTable() {
  const {
    items,
    isLoading,
    fetchCheckpoints,
    bulkDelete,
    isSubmitting,
  } = useCheckpointsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<ExpandKey>>(new Set())
  const [search, setSearch] = useState('')

  // Group checkpoints by Client > Area
  const groupedCheckpoints = useCallback((): ClientGroup[] => {
    const clientMap: Record<string, Record<string, AreaGroup>> = {}

    items.forEach((cp) => {
      const cpWithRelations = cp as CheckpointWithRelations
      const clientKey = cpWithRelations.client_name || 'Tanpa Klien'
      const areaKey = cpWithRelations.area_name || 'Tanpa Area'

      if (!clientMap[clientKey]) {
        clientMap[clientKey] = {}
      }
      if (!clientMap[clientKey][areaKey]) {
        clientMap[clientKey][areaKey] = {
          area_name: areaKey,
          area_id: (cp as any).area_id || 0,
          checkpoints: [],
        }
      }
      clientMap[clientKey][areaKey].checkpoints.push(cpWithRelations)
    })

    // Convert to array format
    return Object.entries(clientMap)
      .map(([clientName, areas]) => ({
        client_name: clientName,
        areas: Object.values(areas).sort((a, b) =>
          a.area_name.localeCompare(b.area_name)
        ),
      }))
      .sort((a, b) => a.client_name.localeCompare(b.client_name))
  }, [items])

  // Count totals
  const countByType = useCallback(() => {
    const groups = groupedCheckpoints()
    const clientCount = groups.length
    const areaCount = groups.reduce((sum, g) => sum + g.areas.length, 0)
    const checkpointCount = items.length
    return { clientCount, areaCount, checkpointCount }
  }, [groupedCheckpoints, items])

  // Fetch checkpoints without area filter (show all)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCheckpoints({
        search: search,
        area_id: undefined, // Show all areas
        status: undefined,
        page: 1,
        per_page: 100, // API limit
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchCheckpoints])

  // Expand all by default when data loads
  useEffect(() => {
    const groups = groupedCheckpoints()
    if (groups.length > 0 && expandedKeys.size === 0) {
      const keys = new Set<ExpandKey>()
      groups.forEach((g) => {
        keys.add(g.client_name) // Expand all clients
        g.areas.forEach((a) => {
          keys.add(`${g.client_name}|${a.area_name}`) // Expand all areas
        })
      })
      setExpandedKeys(keys)
    }
  }, [items, groupedCheckpoints])

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds((prev) => {
      const newSelection = new Set<number | string>()
      prev.forEach((id) => {
        if (items.some((item: Checkpoint) => item.id === id)) {
          newSelection.add(id)
        }
      })
      return newSelection
    })
  }, [items])

  const toggleExpand = (key: ExpandKey) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const groups = groupedCheckpoints()
    const keys = new Set<ExpandKey>()
    groups.forEach((g) => {
      keys.add(g.client_name)
      g.areas.forEach((a) => {
        keys.add(`${g.client_name}|${a.area_name}`)
      })
    })
    setExpandedKeys(keys)
  }

  const collapseAll = () => {
    setExpandedKeys(new Set())
  }

  const handleEdit = (checkpoint: Checkpoint) => {
    setEditingCheckpoint(checkpoint)
    setShowFormModal(true)
  }

  const handleAddNew = () => {
    setEditingCheckpoint(null)
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingCheckpoint(null)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsDeleting(true)
    try {
      await bulkDelete(Array.from(selectedIds).map(Number))
      toast.success(`Deleted ${selectedIds.size} checkpoints`)
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
    } catch {
      toast.error('Failed to delete checkpoints')
    } finally {
      setIsDeleting(false)
    }
  }

  // Selection helpers
  const toggleAreaSelection = (area: AreaGroup) => {
    const areaIds = area.checkpoints.map((cp) => cp.id)
    const allSelected = areaIds.every((id) => selectedIds.has(id))

    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (allSelected) {
        areaIds.forEach((id) => newSet.delete(id))
      } else {
        areaIds.forEach((id) => newSet.add(id))
      }
      return newSet
    })
  }

  const toggleClientSelection = (client: ClientGroup) => {
    const allCheckpointIds = client.areas.flatMap((a) => a.checkpoints.map((cp) => cp.id))
    const allSelected = allCheckpointIds.every((id) => selectedIds.has(id))

    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (allSelected) {
        allCheckpointIds.forEach((id) => newSet.delete(id))
      } else {
        allCheckpointIds.forEach((id) => newSet.add(id))
      }
      return newSet
    })
  }

  const isAreaFullySelected = (area: AreaGroup) => {
    if (area.checkpoints.length === 0) return false
    return area.checkpoints.every((cp) => selectedIds.has(cp.id))
  }

  const isAreaPartiallySelected = (area: AreaGroup) => {
    if (area.checkpoints.length === 0) return false
    const selected = area.checkpoints.filter((cp) => selectedIds.has(cp.id)).length
    return selected > 0 && selected < area.checkpoints.length
  }

  const isClientFullySelected = (client: ClientGroup) => {
    const allIds = client.areas.flatMap((a) => a.checkpoints.map((cp) => cp.id))
    if (allIds.length === 0) return false
    return allIds.every((id) => selectedIds.has(id))
  }

  const isClientPartiallySelected = (client: ClientGroup) => {
    const allIds = client.areas.flatMap((a) => a.checkpoints.map((cp) => cp.id))
    if (allIds.length === 0) return false
    const selected = allIds.filter((id) => selectedIds.has(id)).length
    return selected > 0 && selected < allIds.length
  }

  const counts = countByType()
  const clientGroups = groupedCheckpoints()

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Cari checkpoint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-1" />
            Tambah Checkpoint
          </Button>
        </div>
      </div>

      {/* Expand/Collapse All */}
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <span className="text-muted-foreground">|</span>
        <Button variant="ghost" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
        <span className="ml-4 text-muted-foreground">
          {counts.clientCount} klien, {counts.areaCount} area, {counts.checkpointCount} checkpoint
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && clientGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Tidak ada checkpoint</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tambahkan checkpoint baru untuk memulai
          </p>
        </div>
      )}

      {/* Grouped Checkpoints: Client > Area > Checkpoint */}
      {!isLoading && clientGroups.length > 0 && (
        <div className="space-y-3">
          {clientGroups.map((client) => {
            const clientKey = client.client_name
            const clientExpanded = expandedKeys.has(clientKey)
            const clientFullySelected = isClientFullySelected(client)
            const clientPartiallySelected = isClientPartiallySelected(client)
            const totalCheckpoints = client.areas.reduce((sum, a) => sum + a.checkpoints.length, 0)

            return (
              <div key={clientKey} className="border rounded-lg overflow-hidden">
                {/* Client Header */}
                <Collapsible
                  open={clientExpanded}
                  onOpenChange={() => toggleExpand(clientKey)}
                >
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={clientFullySelected}
                      ref={(el) => {
                        if (el) el.indeterminate = clientPartiallySelected
                      }}
                      onChange={() => toggleClientSelection(client)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-gray-300"
                    />

                    <Building2 className="h-4 w-4 text-primary" />

                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 flex-1">
                        {clientExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-foreground">{client.client_name}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {client.areas.length} area, {totalCheckpoints} checkpoint
                        </span>
                      </button>
                    </CollapsibleTrigger>
                  </div>

                  {/* Areas */}
                  <CollapsibleContent>
                    <div className="border-t bg-background">
                      {client.areas.map((area) => {
                        const areaKey = `${clientKey}|${area.area_name}`
                        const areaExpanded = expandedKeys.has(areaKey)
                        const areaFullySelected = isAreaFullySelected(area)
                        const areaPartiallySelected = isAreaPartiallySelected(area)

                        return (
                          <Collapsible
                            key={areaKey}
                            open={areaExpanded}
                            onOpenChange={() => toggleExpand(areaKey)}
                            className="border-t first:border-t-0"
                          >
                            {/* Area Header */}
                            <div className="flex items-center gap-3 px-6 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors pl-10">
                              <input
                                type="checkbox"
                                checked={areaFullySelected}
                                ref={(el) => {
                                  if (el) el.indeterminate = areaPartiallySelected
                                }}
                                onChange={() => toggleAreaSelection(area)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 rounded border-gray-300"
                              />

                              <CollapsibleTrigger asChild>
                                <button className="flex items-center gap-2 flex-1">
                                  {areaExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                  )}
                                  <span className="font-medium text-sm">{area.area_name}</span>
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    {area.checkpoints.length} checkpoint
                                  </span>
                                </button>
                              </CollapsibleTrigger>
                            </div>

                            {/* Checkpoints Table */}
                            <CollapsibleContent>
                              <div className="bg-background">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-2 px-8 py-2 bg-muted/20 text-xs font-medium text-muted-foreground pl-16">
                                  <div className="col-span-1"></div>
                                  <div className="col-span-2">Kode</div>
                                  <div className="col-span-3">Nama</div>
                                  <div className="col-span-2">Lokasi</div>
                                  <div className="col-span-1">Radius</div>
                                  <div className="col-span-1">Status</div>
                                  <div className="col-span-2">Aksi</div>
                                </div>

                                {/* Checkpoint Rows */}
                                {area.checkpoints.map((checkpoint) => (
                                  <div
                                    key={checkpoint.id}
                                    className="grid grid-cols-12 gap-2 px-8 py-3 border-t items-center hover:bg-muted/20 transition-colors pl-16"
                                  >
                                    <div className="col-span-1">
                                      <input
                                        type="checkbox"
                                        checked={selectedIds.has(checkpoint.id)}
                                        onChange={() => {
                                          setSelectedIds((prev) => {
                                            const newSet = new Set(prev)
                                            if (newSet.has(checkpoint.id)) {
                                              newSet.delete(checkpoint.id)
                                            } else {
                                              newSet.add(checkpoint.id)
                                            }
                                            return newSet
                                          })
                                        }}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                        {checkpoint.code}
                                      </code>
                                    </div>
                                    <div className="col-span-3">
                                      <span className="font-medium text-sm">{checkpoint.name}</span>
                                      {checkpoint.has_secret_key && (
                                        <span title="Requires OTP">
                                          <Key className="inline-block h-3 w-3 ml-1 text-green-600" />
                                        </span>
                                      )}
                                    </div>
                                    <div className="col-span-2">
                                      <div className="flex items-center gap-1 text-xs">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-mono text-muted-foreground">
                                          {checkpoint.lat}, {checkpoint.lng}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-span-1">
                                      <span className="text-xs text-muted-foreground">
                                        {checkpoint.radius_meters ? `${checkpoint.radius_meters}m` : '-'}
                                      </span>
                                    </div>
                                    <div className="col-span-1">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          checkpoint.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                      >
                                        {checkpoint.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                      </span>
                                    </div>
                                    <div className="col-span-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(checkpoint)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Checkpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} checkpoint?
              Checkpoint yang memiliki data scan akan dinonaktifkan daripada dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting || isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Modal */}
      <CheckpointsFormModal
        checkpoint={editingCheckpoint}
        open={showFormModal}
        onOpenChange={handleCloseModal}
      />
    </div>
  )
}
