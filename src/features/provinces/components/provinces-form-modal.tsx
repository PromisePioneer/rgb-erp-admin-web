/**
 * Provinces Form Modal Component
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProvincesStore } from '../store/provinces-store'

interface ProvincesFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  provinceId?: number
}

type FormValues = {
  name: string
  latin_code: string
  romawi_code: string
}

export function ProvincesFormModal({ open, onOpenChange, mode, provinceId }: ProvincesFormModalProps) {
  const { selectedItem, isLoading, isSubmitting, fetchById, create, update, resetForm } = useProvincesStore()

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      latin_code: '',
      romawi_code: '',
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({ name: '', latin_code: '', romawi_code: '' })
    }
  }, [open, form])

  useEffect(() => {
    if (mode === 'edit' && provinceId && open) {
      fetchById(provinceId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, provinceId, open, fetchById, resetForm])

  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        latin_code: selectedItem.latin_code ?? '',
        romawi_code: selectedItem.romawi_code ?? '',
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => onOpenChange(false)

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === 'create') {
        await create(values)
      } else if (provinceId) {
        await update(provinceId, values)
      }
      handleClose()
    } catch (err) {
      // handled in store
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Tambah Province' : 'Edit Province'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latin Code</label>
              <Input
                placeholder="jawa-barat"
                {...form.register('latin_code')}
              />
              <p className="text-xs text-muted-foreground">Lowercase dengan hyphen</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Romawi Code</label>
              <Input
                placeholder="IX"
                {...form.register('romawi_code')}
              />
              <p className="text-xs text-muted-foreground">Romawi (I, II, III...)</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
