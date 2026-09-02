"use client"

import { useEffect, useState, useCallback } from "react"
import { useDailyTaskItemsStore } from "../store/daily-task-items-store"
import { dailyTaskItemsApi } from "../api/daily-task-items-api"
import { positionsApi, type PositionOption } from "../api/positions-api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Search, Trash2, Pencil, X, ChevronDown } from "lucide-react"
import { STATUS_ACTIVE, STATUS_INACTIVE } from "../types/daily-task-items.types"

const STATUS_COLORS: Record<number, string> = {
  [STATUS_ACTIVE]: "bg-green-100 text-green-800",
  [STATUS_INACTIVE]: "bg-gray-100 text-gray-800",
}

const STATUS_LABELS: Record<number, string> = {
  [STATUS_ACTIVE]: "Aktif",
  [STATUS_INACTIVE]: "Tidak Aktif",
}

// Map number to string for form display
const statusToString = (status: number): string => (status === STATUS_ACTIVE ? "active" : "inactive")

// Map string to number for API
const stringToStatus = (str: string): number => (str === "active" ? STATUS_ACTIVE : STATUS_INACTIVE)

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]),
  position_id: z.number().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

export function DailyTaskItemsTable() {
  const {
    items,
    isLoading,
    isSubmitting,
    filters,
    pagination,
    fetchItems,
    create,
    update,
    bulkDelete,
    setFilters,
    resetFilters,
  } = useDailyTaskItemsStore()

  // Local state
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const [statusFilter, setStatusFilter] = useState<string>(filters.status === undefined ? "all" : (filters.status === STATUS_ACTIVE ? "active" : "inactive"))
  const [positionFilter, setPositionFilter] = useState<string>(filters.position_id === undefined ? "all" : String(filters.position_id))
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<number | null>(null)

  // Positions dropdown state
  const [positions, setPositions] = useState<PositionOption[]>([])
  const [isLoadingPositions, setIsLoadingPositions] = useState(false)

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      position_id: undefined,
    },
  })

  // Fetch positions for dropdown
  const fetchPositions = useCallback(async () => {
    setIsLoadingPositions(true)
    try {
      const response = await positionsApi.getSelectOptions()
      if (response.success) {
        setPositions(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error)
    } finally {
      setIsLoadingPositions(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchItems()
    fetchPositions()
  }, [])

  // Handle search
  const handleSearch = useCallback(() => {
    setFilters({ search: searchValue })
    fetchItems({ ...filters, search: searchValue, page: 1 })
  }, [searchValue])

  // Handle status filter - convert string to number for API
  const handleStatusFilter = useCallback(
    (value: string | null) => {
      const val = value || "all"
      setStatusFilter(val)
      // Convert string filter to number for API
      const status = val === "all" ? undefined : (val === "active" ? STATUS_ACTIVE : STATUS_INACTIVE)
      setFilters({ status })
      fetchItems({ ...filters, status, page: 1 })
    },
    [filters]
  )

  // Handle position filter
  const handlePositionFilter = useCallback(
    (value: string | null) => {
      const val = value || "all"
      setPositionFilter(val)
      const positionId = val === "all" ? undefined : Number(val)
      setFilters({ position_id: positionId })
      fetchItems({ ...filters, position_id: positionId, page: 1 })
    },
    [filters]
  )

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page })
      fetchItems({ ...filters, page })
    },
    [filters]
  )

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchValue("")
    setStatusFilter("all")
    setPositionFilter("all")
    resetFilters()
    fetchItems({})
  }, [])

  // Select all
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)))
    }
  }, [items, selectedIds])

  // Select one
  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Open create modal
  const handleAddNew = () => {
    form.reset({ name: "", description: "", status: "active", position_id: undefined })
    setFormMode("create")
    setEditingId(null)
    setShowFormModal(true)
  }

  // Open edit modal
  const handleEdit = async (id: number) => {
    try {
      const response = await dailyTaskItemsApi.getById(id)
      if (response.success) {
        form.reset({
          name: response.data.name,
          description: response.data.description || "",
          status: statusToString(response.data.status) as "active" | "inactive", // Convert number to string
          position_id: response.data.position_id || undefined,
        })
        setFormMode("edit")
        setEditingId(id)
        setShowFormModal(true)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal mengambil data")
    }
  }

  // Submit form - convert status to number for API
  const handleSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      status: stringToStatus(values.status), // Convert string to number
    }

    try {
      if (formMode === "create") {
        await create(payload)
        toast.success("Item berhasil ditambahkan")
      } else if (editingId) {
        await update(editingId, payload)
        toast.success("Item berhasil diperbarui")
      }
      setShowFormModal(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Terjadi kesalahan")
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkDelete(Array.from(selectedIds))
      toast.success(`${selectedIds.size} item berhasil dihapus`)
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menghapus item")
    }
  }

  // Has active filters
  const hasActiveFilters = searchValue || statusFilter !== "all" || positionFilter !== "all"

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>

          {/* Position Filter */}
          <Select value={positionFilter} onValueChange={handlePositionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Posisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Posisi</SelectItem>
              {positions.map((pos) => (
                <SelectItem key={pos.id} value={String(pos.id)}>
                  {pos.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Add Button */}
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Item
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Klik pada nama untuk mengedit data
      </p>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedIds.size === items.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleSelectOne(item.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="text-blue-600 hover:underline text-left"
                    >
                      {item.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.position_name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status]}>
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} -{" "}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Halaman {pagination.current_page} dari {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm">{selectedIds.size} item dipilih</span>
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
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Tambah Item Tugas Harian" : "Edit Item Tugas Harian"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama</label>
              <Input
                {...form.register("name")}
                placeholder="Masukkan nama item"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Posisi</label>
              <select
                {...form.register("position_id", { valueAsNumber: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Pilih Posisi (Opsional)</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <textarea
                {...form.register("description")}
                placeholder="Masukkan deskripsi (opsional)"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                {...form.register("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFormModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
