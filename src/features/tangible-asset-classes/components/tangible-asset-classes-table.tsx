"use client"
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Trash2, Plus } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTangibleAssetClassesStore } from '../store/tangible-asset-class-store'
import type { TangibleAssetClass } from '../types/tangible-asset-class.types'

type FormValues = {
  name: string
  useful_life: number
  notes: string
}

export function TangibleAssetClassesTable() {
  const {
    items,
    isLoading,
    isSubmitting,
    fetchItems,
    create,
    update,
    remove,
  } = useTangibleAssetClassesStore()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<TangibleAssetClass | null>(null)

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      useful_life: 12,
      notes: '',
    },
  })

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!formOpen) {
      setEditItem(null)
      form.reset({ name: '', useful_life: 12, notes: '' })
    }
  }, [formOpen, form])

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      form.reset({
        name: editItem.name,
        useful_life: editItem.useful_life,
        notes: editItem.notes ?? '',
      })
    }
  }, [editItem, form])

  const handleOpenForm = (item?: TangibleAssetClass) => {
    if (item) {
      setEditItem(item)
    } else {
      setEditItem(null)
    }
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditItem(null)
    form.reset({ name: '', useful_life: 12, notes: '' })
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (editItem) {
        await update(editItem.id, values)
      } else {
        await create(values)
      }
      handleCloseForm()
    } catch {
      // Error handled by store
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    try {
      await remove(deleteId)
      setDeleteId(null)
    } catch {
      // Error handled by store
    }
  }

  // Filter items by search
  const filteredItems = search
    ? items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Kelas Aktiva Tetap</h2>
          <p className="text-sm text-muted-foreground">
            Kelola kelas aktiva tetap (Tangible Asset Class)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchItems()} disabled={isLoading}>
            Refresh
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Cari kelas aktiva..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nama Kelas</th>
              <th className="px-4 py-3 text-left font-medium">Umur Manfaat (bulan)</th>
              <th className="px-4 py-3 text-left font-medium">Umur Manfaat (tahun)</th>
              <th className="px-4 py-3 text-left font-medium">Catatan</th>
              <th className="px-4 py-3 text-center font-medium w-[120px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? 'Tidak ada hasil pencarian' : 'Belum ada data kelas aktiva'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.useful_life} bulan</td>
                  <td className="px-4 py-3">{(item.useful_life / 12).toFixed(1)} tahun</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.notes || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(item)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(item.id)}
                        title="Hapus"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Edit Kelas Aktiva' : 'Tambah Kelas Aktiva'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kelas *</label>
              <Input
                placeholder="Contoh: Kendaraan, Komputer, Furniture"
                {...form.register('name', { required: 'Nama kelas wajib diisi' })}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Umur Manfaat (bulan) *</label>
              <Input
                type="number"
                min="1"
                {...form.register('useful_life', {
                  required: 'Umur manfaat wajib diisi',
                  min: { value: 1, message: 'Minimal 1 bulan' },
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.useful_life && (
                <p className="text-sm text-red-500">{form.formState.errors.useful_life.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan</label>
              <Input
                placeholder="Opsional"
                {...form.register('notes')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kelas aktiva ini?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
