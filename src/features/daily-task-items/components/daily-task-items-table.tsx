"use client"

import { useEffect, useState, useCallback } from "react"
import { useDailyTaskItemsStore } from "../store/daily-task-items-store"
import { dailyTaskItemsApi } from "../api/daily-task-items-api"
import { rolesApi, type RoleOption } from "@/features/roles"
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
import { Plus, Search, Trash2, X } from "lucide-react"
import { STATUS_ACTIVE, STATUS_INACTIVE, type DailyTaskItem } from "../types/daily-task-items.types"
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'

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
  role_id: z.number().optional().nullable(),
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
  const [roleFilter, setRoleFilter] = useState<string>(filters.role_id === undefined ? "all" : String(filters.role_id))
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<number | null>(null)

  // Roles dropdown state
  const [roles, setRoles] = useState<RoleOption[]>([])

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      role_id: undefined,
    },
  })

  // Fetch roles for dropdown
  const fetchRoles = useCallback(async () => {
    try {
      const response = await rolesApi.getSelectOptions()
      if (response.success) {
        setRoles(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchItems()
    fetchRoles()
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

  // Handle role filter
  const handleRoleFilter = useCallback(
    (value: string | null) => {
      const val = value || "all"
      setRoleFilter(val)
      const roleId = val === "all" ? undefined : Number(val)
      setFilters({ role_id: roleId })
      fetchItems({ ...filters, role_id: roleId, page: 1 })
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
    setRoleFilter("all")
    resetFilters()
    fetchItems({})
  }, [])

  // Open create modal
  const handleAddNew = () => {
    form.reset({ name: "", description: "", status: "active", role_id: undefined })
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
          role_id: response.data.role_id || undefined,
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
  const hasActiveFilters = searchValue || statusFilter !== "all" || roleFilter !== "all"

  // Column definitions
  const columns: DataTableColumn<DailyTaskItem>[] = [
    {
      accessorKey: 'name',
      header: 'Nama',
    },
    {
      accessorKey: 'role_name',
      header: 'Role',
      cell: (row) => row.role_name || '-',
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: (row) => row.description || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge className={STATUS_COLORS[row.status]}>
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
  ]

  // Create edit handler for onRowClick
  const handleRowEdit = (item: DailyTaskItem) => handleEdit(item.id)

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

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
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

      {/* Table */}
      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="Tidak ada data"
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Hapus Terpilih
          </Button>
        }
        onRowClick={handleRowEdit}
      />

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
              <label className="text-sm font-medium">Role</label>
              <select
                {...form.register("role_id", { valueAsNumber: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Pilih Role (Opsional)</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
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
