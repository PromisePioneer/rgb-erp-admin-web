/**
 * Provinces Form Page Component
 */
import { useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProvincesStore } from '../store/provinces-store'

type FormValues = {
  name: string
  latin_code: string
  romawi_code: string
}

export function ProvincesForm() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false }) as { id?: string }
  const isEdit = Boolean(id)
  const provinceId = isEdit ? Number(id) : undefined

  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useProvincesStore()

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      latin_code: '',
      romawi_code: '',
    },
  })

  useEffect(() => {
    if (isEdit && provinceId) {
      fetchById(provinceId)
    } else {
      resetForm()
    }
  }, [isEdit, provinceId, fetchById, resetForm])

  useEffect(() => {
    if (isEdit && selectedItem) {
      form.reset({
        name: selectedItem.name,
        latin_code: selectedItem.latin_code ?? '',
        romawi_code: selectedItem.romawi_code ?? '',
      })
    }
  }, [isEdit, selectedItem, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (!isEdit) {
        await create(values)
        toast.success('Province berhasil ditambahkan')
      } else if (provinceId) {
        await update(provinceId, values)
        toast.success('Province berhasil diperbarui')
      }
      navigate({ to: '/provinces' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/provinces' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Province' : 'Tambah Province'}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Perbarui data province' : 'Lengkapi data province baru'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Province *</label>
            <Input
              placeholder="Contoh: Jawa Barat"
              {...form.register('name', { required: 'Nama province wajib diisi' })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latin Code</label>
              <Input
                placeholder="Contoh: jawa-barat"
                {...form.register('latin_code')}
              />
              <p className="text-xs text-muted-foreground">Kode lowercase dengan hyphen</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Romawi Code</label>
              <Input
                placeholder="Contoh: IX"
                {...form.register('romawi_code')}
              />
              <p className="text-xs text-muted-foreground">Kode romawi (I, II, III, dst)</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/provinces' })}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
