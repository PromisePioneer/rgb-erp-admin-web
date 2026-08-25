/**
 * Departments Form Component
 * Create and edit form using react-hook-form + zod
 */
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect } from '@/components/async-select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useDepartmentsStore } from '../store/departments-store'

const departmentFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  status: z.number().min(0).max(2),
})

type DepartmentFormValues = z.infer<typeof departmentFormSchema>

interface DepartmentsFormProps {
  mode: 'create' | 'edit'
  departmentId?: number
}

export function DepartmentsForm({ mode, departmentId }: DepartmentsFormProps) {
  const navigate = useNavigate()
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    error,
    fetchById,
    create,
    update,
    clearError,
  } = useDepartmentsStore()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const hasShownValidationToast = useRef(false)

  // Fetch department data if editing
  useEffect(() => {
    if (mode === 'edit' && departmentId) {
      fetchById(departmentId)
    }
  }, [mode, departmentId, fetchById])

  // Set form with existing data when available
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: '',
      status: 1,
    },
  })

  // Update form values when selectedItem is loaded
  useEffect(() => {
    if (mode === 'edit' && selectedItem) {
      form.reset({
        name: selectedItem.name,
        status: selectedItem.status,
      })
    }
  }, [mode, selectedItem, form])

  // Show consolidated validation errors as a single toast
  useEffect(() => {
    const errors = form.formState.errors
    const errorCount = Object.keys(errors).length

    if (errorCount > 0 && form.formState.submitCount > 0 && !hasShownValidationToast.current) {
      hasShownValidationToast.current = true

      const errorMessages = Object.values(errors)
        .map((error) => error?.message)
        .filter(Boolean) as string[]

      if (errorMessages.length === 1) {
        toast.error(errorMessages[0])
      } else if (errorMessages.length > 1) {
        toast.error(`${errorMessages.length} validation errors found. Please check the form.`)
      }
    }

    if (errorCount === 0) {
      hasShownValidationToast.current = false
    }
  }, [form.formState.errors, form.formState.submitCount])

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const onSubmit = async (values: DepartmentFormValues) => {
    setSubmitError(null)
    try {
      if (mode === 'create') {
        await create(values)
        navigate({ to: '/departments' })
      } else if (departmentId) {
        await update(departmentId, values)
        navigate({ to: '/departments' })
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/departments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Add New Department' : 'Edit Department'}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {submitError}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter department name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <AsyncSelect
                  value={field.value ?? 1}
                  onChange={(value) => field.onChange(value ?? 1)}
                  loadOptions={async () => [
                    { value: 1, label: 'Aktif' },
                    { value: 0, label: 'Tidak Aktif' },
                  ]}
                  placeholder="Pilih status..."
                  className="w-full"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Link to="/departments">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
    </div>
  )
}
