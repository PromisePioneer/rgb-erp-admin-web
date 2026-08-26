/**
 * Bank Accounts Form Modal Component
 * Modal form for create and edit bank accounts
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
import { useBankAccountsStore } from '../store/bank-accounts-store'
import { bankAccountsApi } from '../api/bank-accounts-api'
import type { BankAccount, CreateBankAccountPayload, UpdateBankAccountPayload } from '../types/bank-accounts.types'

type FormValues = {
  bank_id: number | undefined
  branch_name: string
  account_number: string
  account_name: string
  status: string
}

interface BankAccountsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem: BankAccount | null
}

export function BankAccountsFormModal({ open, onOpenChange, editItem }: BankAccountsFormModalProps) {
  const isEdit = Boolean(editItem)
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useBankAccountsStore()

  const form = useForm<FormValues>({
    defaultValues: {
      bank_id: undefined,
      branch_name: '',
      account_number: '',
      account_name: '',
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
          bank_id: undefined,
          branch_name: '',
          account_number: '',
          account_name: '',
          status: '1',
        })
      }
    }
  }, [open, isEdit, editItem, fetchById, resetForm, form])

  // Populate form when data is loaded
  useEffect(() => {
    if (isEdit && selectedItem) {
      form.reset({
        bank_id: selectedItem.bank_id,
        branch_name: selectedItem.branch_name,
        account_number: selectedItem.account_number,
        account_name: selectedItem.account_name,
        status: selectedItem.status?.toString() ?? '1',
      })
    }
  }, [isEdit, selectedItem, form])

  const loadBanks = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await bankAccountsApi.getSelectOptions({ q: search })
      return response.data.map((bank) => ({
        value: bank.id,
        label: bank.name,
      }))
    } catch {
      return []
    }
  }, [])

  const onSubmit = async (values: FormValues) => {
    if (!values.bank_id) {
      toast.error('Bank wajib dipilih')
      return
    }
    if (!values.branch_name.trim()) {
      toast.error('Branch name wajib diisi')
      return
    }
    if (!values.account_number.trim()) {
      toast.error('Account number wajib diisi')
      return
    }
    if (!values.account_name.trim()) {
      toast.error('Account name wajib diisi')
      return
    }

    try {
      if (!isEdit) {
        const payload: CreateBankAccountPayload = {
          bank_id: values.bank_id,
          branch_name: values.branch_name.trim(),
          account_number: values.account_number.trim(),
          account_name: values.account_name.trim(),
          status: Number(values.status),
        }
        await create(payload)
        toast.success('Bank account berhasil ditambahkan')
      } else if (editItem) {
        const payload: UpdateBankAccountPayload = {
          bank_id: values.bank_id,
          branch_name: values.branch_name.trim(),
          account_number: values.account_number.trim(),
          account_name: values.account_name.trim(),
          status: Number(values.status),
        }
        await update(editItem.id, payload)
        toast.success('Bank account berhasil diperbarui')
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
          <DialogTitle>{isEdit ? 'Edit Bank Account' : 'Tambah Bank Account Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui informasi bank account' : 'Lengkapi informasi bank account baru'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bank *</label>
            <AsyncSelect
              value={form.watch('bank_id') ?? null}
              onChange={(value) => form.setValue('bank_id', value as number | undefined)}
              loadOptions={loadBanks}
              placeholder="Pilih bank..."
              isDisabled={isLoading}
              className="w-full"
            />
            {form.formState.errors.bank_id && (
              <p className="text-sm text-red-500">{form.formState.errors.bank_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Number *</label>
            <Input
              placeholder="Nomor rekening"
              {...form.register('account_number', { required: 'Account number wajib diisi' })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Name *</label>
            <Input
              placeholder="Nama pemilik rekening"
              {...form.register('account_name', { required: 'Account name wajib diisi' })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Branch Name *</label>
            <Input
              placeholder="Nama cabang bank"
              {...form.register('branch_name', { required: 'Branch name wajib diisi' })}
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
