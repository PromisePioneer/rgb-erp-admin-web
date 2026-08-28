/**
 * Petty Cash Form Modal Component
 * Modal form for create and edit petty cash records
 */
import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { usePettyCashStore } from '../store/petty-cash-store'
import { pettyCashApi } from '../api/petty-cash-api'
import type { PettyCash, CreatePettyCashPayload, UpdatePettyCashPayload } from '../types/petty-cash.types'

type FormValues = {
  company_id: number | undefined
  date: string
  cash: string
  status: string
}

interface PettyCashFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem: PettyCash | null
}

export function PettyCashFormModal({ open, onOpenChange, editItem }: PettyCashFormModalProps) {
  const isEdit = Boolean(editItem)
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = usePettyCashStore()

  const form = useForm<FormValues>({
    defaultValues: {
      company_id: undefined,
      date: new Date().toISOString().split('T')[0],
      cash: '',
      status: '1',
    },
  })

  // Reset form when modal opens/closes or editItem changes
  useEffect(() => {
    if (open) {
      if (isEdit && editItem) {
        fetchById(editItem.id)
      } else {
        resetForm()
        form.reset({
          company_id: undefined,
          date: new Date().toISOString().split('T')[0],
          cash: '',
          status: '1',
        })
      }
    }
  }, [open, isEdit, editItem, fetchById, resetForm, form])

  // Populate form when data is loaded
  useEffect(() => {
    if (isEdit && selectedItem) {
      form.reset({
        company_id: selectedItem.company_id,
        date: selectedItem.date,
        cash: selectedItem.cash.toString(),
        status: selectedItem.status?.toString() ?? '1',
      })
    }
  }, [isEdit, selectedItem, form])

  const loadCompanies = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await pettyCashApi.getSelectOptions({ q: search })
      return response.data.map((company) => ({
        value: company.id,
        label: company.name,
      }))
    } catch {
      return []
    }
  }, [])

  const onSubmit = async (values: FormValues) => {
    if (!values.company_id) {
      toast.error('Company wajib dipilih')
      return
    }
    if (!values.date) {
      toast.error('Date wajib diisi')
      return
    }
    if (!values.cash || isNaN(parseFloat(values.cash))) {
      toast.error('Amount wajib diisi dan harus angka')
      return
    }

    try {
      if (!isEdit) {
        const payload: CreatePettyCashPayload = {
          company_id: values.company_id,
          date: values.date,
          cash: parseFloat(values.cash),
          status: Number(values.status),
        }
        await create(payload)
        toast.success('Petty cash berhasil ditambahkan')
      } else if (editItem) {
        const payload: UpdatePettyCashPayload = {
          company_id: values.company_id,
          date: values.date,
          cash: parseFloat(values.cash),
          status: Number(values.status),
        }
        await update(editItem.id, payload)
        toast.success('Petty cash berhasil diperbarui')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Petty Cash' : 'Tambah Petty Cash Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui informasi petty cash' : 'Lengkapi informasi petty cash baru'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company *</label>
            <AsyncSelect
              value={form.watch('company_id') ?? null}
              onChange={(value) => form.setValue('company_id', value as number | undefined)}
              loadOptions={loadCompanies}
              placeholder="Pilih company..."
              isDisabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date *</label>
            <Input
              type="date"
              {...form.register('date', { required: 'Date wajib diisi' })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount *</label>
            <Input
              type="number"
              placeholder="Jumlah kas"
              {...form.register('cash', {
                required: 'Amount wajib diisi',
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value ?? '1')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
