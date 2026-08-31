/**
 * Accounts Form Modal Component
 * Create and edit form using react-hook-form
 */
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAccountsStore } from '../store/accounts-store'
import type { Account, AccountType, CreateAccountPayload, UpdateAccountPayload } from '../types/accounts.types'

const accountFormSchema = z.object({
  code: z.string().min(1, 'Kode akun wajib diisi').max(50),
  name: z.string().min(1, 'Nama akun wajib diisi').max(255),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense'], {
    required_error: 'Tipe akun wajib dipilih',
  }),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

interface AccountsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  account?: Account | null
}

export function AccountsFormModal({
  open,
  onOpenChange,
  mode,
  account,
}: AccountsFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useAccountsStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      type: undefined as AccountType | undefined,
    },
  })

  const isEdit = mode === 'edit'
  const accountId = account?.id ?? selectedItem?.id

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        code: '',
        name: '',
        type: undefined,
      })
      hasShownValidationToast.current = false
    }
  }, [open, form])

  // Show toast on validation errors
  useEffect(() => {
    const errors = form.formState.errors
    const errorCount = Object.keys(errors).length

    if (
      errorCount > 0 &&
      form.formState.submitCount > 0 &&
      !hasShownValidationToast.current
    ) {
      hasShownValidationToast.current = true

      const errorMessages = Object.values(errors)
        .map((error) => error?.message)
        .filter(Boolean) as string[]

      if (errorMessages.length === 1) {
        toast.error(errorMessages[0])
      } else if (errorMessages.length > 1) {
        toast.error(
          `${errorMessages.length} validation errors found. Please check the form.`
        )
      }
    }

    if (errorCount === 0) {
      hasShownValidationToast.current = false
    }
  }, [form, form.formState.errors, form.formState.submitCount])

  // Fetch data when editing
  useEffect(() => {
    if (isEdit && accountId && open) {
      fetchById(accountId)
    }
    if (isEdit === false && open) {
      resetForm()
    }
  }, [isEdit, accountId, open, fetchById, resetForm])

  // Populate form when selectedItem loads
  useEffect(() => {
    if (isEdit && selectedItem && open) {
      form.reset({
        code: selectedItem.code,
        name: selectedItem.name,
        type: selectedItem.type as AccountType,
      })
    }
  }, [isEdit, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: AccountFormValues) => {
    try {
      if (isEdit && accountId) {
        const payload: UpdateAccountPayload = {
          code: values.code,
          name: values.name,
          type: values.type,
        }
        await update(accountId, payload)
        toast.success('Akun berhasil diperbarui')
        handleClose()
      } else {
        const payload: CreateAccountPayload = {
          code: values.code,
          name: values.name,
          type: values.type,
        }
        await create(payload)
        toast.success('Akun berhasil ditambahkan')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Akun' : 'Tambah Akun Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Skeleton loading state when fetching for edit */}
          {isEdit && isLoading && !selectedItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          )}

          {/* Code */}
          {(!isEdit || selectedItem) && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Kode Akun *
            </label>
            <Input
              placeholder="Contoh: 1-1000"
              {...form.register('code')}
              className="h-11"
            />
            {form.formState.errors.code && (
              <p className="text-sm text-red-500">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>
          )}

          {/* Name */}
          {(!isEdit || selectedItem) && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Nama Akun *
            </label>
            <Input
              placeholder="Contoh: Kas & Bank"
              {...form.register('name')}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          )}

          {/* Type */}
          {(!isEdit || selectedItem) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipe Akun *</label>
            <Select
              onValueChange={(value) => form.setValue('type', value as AccountType, { shouldValidate: true })}
              value={form.watch('type')}
              disabled={isLoading || isSubmitting}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih tipe akun..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset (Aktiva)</SelectItem>
                <SelectItem value="liability">Liability (Kewajiban)</SelectItem>
                <SelectItem value="equity">Equity (Modal)</SelectItem>
                <SelectItem value="revenue">Revenue (Pendapatan)</SelectItem>
                <SelectItem value="expense">Expense (Beban)</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-500">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading || (isEdit && !selectedItem)} className="px-6">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
