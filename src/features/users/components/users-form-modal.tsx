/**
 * Users Form Modal Component
 * Create and edit form using react-hook-form + AsyncSelect
 */
import { useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useUsersStore } from '../store/users-store'
import { usersApi } from '../api/users-api'
import { companyApi } from '@/features/companies/api/companies-api'

interface UsersFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  userId?: number
}

const userFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Maksimal 255 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Maksimal 255 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(50, 'Maksimal 50 karakter'),
  role_id: z.number({ required_error: 'Role wajib dipilih' }),
  department_id: z.number({ required_error: 'Department wajib dipilih' }),
  company_id: z.number().nullable().optional(),
  status: z.number(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export function UsersFormModal({
  open,
  onOpenChange,
  mode,
  userId,
}: UsersFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useUsersStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role_id: undefined as unknown as number,
      department_id: undefined as unknown as number,
      company_id: null,
      status: 1,
    },
  })

  // Build schema based on mode (password required only on create)
  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        email: '',
        password: '',
        role_id: undefined as unknown as number,
        department_id: undefined as unknown as number,
        company_id: null,
        status: 1,
      })
      hasShownValidationToast.current = false
    }
  }, [open, form])

  // Watch password field to dynamically update validation
  useEffect(() => {
    const password = form.watch('password')
    if (mode === 'edit' && password && password.length > 0) {
      // If password is filled on edit, validate it
      if (password.length < 8) {
        form.setError('password', {
          type: 'minLength',
          message: 'Password minimal 8 karakter',
        })
      }
    }
  }, [form.watch('password'), mode]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Fetch user data when editing
  useEffect(() => {
    if (mode === 'edit' && userId && open) {
      fetchById(userId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, userId, open, fetchById, resetForm])

  // Populate form when selectedItem loads
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        email: selectedItem.email,
        password: '', // Don't prefill password
        role_id: selectedItem.role_id,
        department_id: selectedItem.department_id,
        company_id: selectedItem.company_id ?? null,
        status: selectedItem.status,
      })
    }
  }, [mode, selectedItem, open, form])

  const loadRoles = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await usersApi.getRolesSelectOptions({ q: search })
      return response.map((item) => ({
        value: item.id,
        label: item.name,
      }))
    } catch {
      return []
    }
  }, [])

  const loadDepartments = useCallback(
    async (search: string): Promise<SelectOption[]> => {
      try {
        const response = await usersApi.getDepartmentsSelectOptions({ q: search })
        return response.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      } catch {
        return []
      }
    },
    []
  )

  const loadCompanies = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await companyApi.getSelectOptions({ q: search })
      return response.map((item) => ({
        value: item.id,
        label: item.name,
      }))
    } catch {
      return []
    }
  }, [])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: UserFormValues) => {
    // Password is only required on create
    if (mode === 'create' && !values.password) {
      toast.error('Password wajib diisi')
      return
    }

    // Build payload - omit password if empty on edit
    const payload = {
      name: values.name,
      email: values.email,
      role_id: values.role_id,
      department_id: values.department_id,
      company_id: values.company_id,
      status: values.status,
      ...(values.password ? { password: values.password } : {}),
    }

    try {
      if (mode === 'create') {
        await create(payload as Parameters<typeof create>[0])
        toast.success('User created successfully')
        handleClose()
      } else if (userId) {
        await update(userId, payload as Parameters<typeof update>[1])
        toast.success('User updated successfully')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nama *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama lengkap"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Password{' '}
                    {mode === 'create' ? '*' : '(kosongkan jika tidak diubah)'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        mode === 'create'
                          ? 'Minimal 8 karakter'
                          : 'Kosongkan jika tidak diubah'
                      }
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Role *</FormLabel>
                  <FormControl>
                    <AsyncSelect
                      value={field.value ?? null}
                      onChange={(value) =>
                        field.onChange(value as number | undefined)
                      }
                      loadOptions={loadRoles}
                      placeholder="Pilih atau cari role..."
                      isDisabled={isLoading}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Department *</FormLabel>
                  <FormControl>
                    <AsyncSelect
                      value={field.value ?? null}
                      onChange={(value) =>
                        field.onChange(value as number | undefined)
                      }
                      loadOptions={loadDepartments}
                      placeholder="Pilih atau cari department..."
                      isDisabled={isLoading}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Company (Optional) */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Company (Optional)
                  </FormLabel>
                  <FormControl>
                    <AsyncSelect
                      value={field.value ?? null}
                      onChange={(value) =>
                        field.onChange(value as number | null)
                      }
                      loadOptions={loadCompanies}
                      placeholder="Pilih atau cari company..."
                      isDisabled={isLoading}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Status *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            <Button type="submit" disabled={isSubmitting} className="px-6">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
