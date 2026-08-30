/**
 * Products Form Modal Component
 * Create and Edit product in a modal dialog
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useProductsStore } from '../store/products-store'
import { productCategoriesApi } from '@/features/product-categories/api/product-categories-api'
import type { Product } from '../types/products.types'

// Form schema
const formSchema = z.object({
  product_category_id: z.number().min(1, 'Kategori produk wajib dipilih'),
  name: z.string().min(1, 'Nama produk wajib diisi').max(255, 'Nama produk maksimal 255 karakter'),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  status: z.number().min(0).max(2),
})

type FormValues = z.infer<typeof formSchema>

interface ProductsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

export function ProductsFormModal({ open, onOpenChange, product }: ProductsFormModalProps) {
  const { create, update, fetchById, isSubmitting, isLoading, selectedItem } = useProductsStore()

  const isEdit = !!product

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_category_id: 0,
      name: '',
      description: '',
      status: 1,
    },
  })

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        // Fetch fresh data for edit
        fetchById(product.id)
      } else {
        // Reset form for create
        form.reset({
          product_category_id: 0,
          name: '',
          description: '',
          status: 1,
        })
      }
    }
  }, [open, product, form, fetchById])

  // Update form values when selectedItem is loaded
  useEffect(() => {
    if (selectedItem && isEdit) {
      form.reset({
        product_category_id: selectedItem.category_id,
        name: selectedItem.name,
        description: selectedItem.description ?? '',
        status: selectedItem.status,
      })
    }
  }, [selectedItem, isEdit, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && product) {
        await update(product.id, values)
        toast.success('Product updated successfully')
      } else {
        await create(values)
        toast.success('Product created successfully')
      }
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save product'
      toast.error(message)
    }
  }

  // Load categories for dropdown
  const loadCategories = async (search: string): Promise<SelectOption[]> => {
    const response = await productCategoriesApi.getSelectOptions({ q: search })
    return response.data.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori Produk *</label>
            <AsyncSelect
              value={form.watch('product_category_id') || null}
              onChange={(val) => form.setValue('product_category_id', val ? Number(val) : 0)}
              loadOptions={loadCategories}
              placeholder="Pilih kategori..."
              className="w-full"
            />
            {form.formState.errors.product_category_id && (
              <p className="text-sm text-red-500">{form.formState.errors.product_category_id.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Produk *</label>
            <Input
              {...form.register('name')}
              placeholder="Masukkan nama produk"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Textarea
              {...form.register('description')}
              value={form.watch('description') ?? ''}
              placeholder="Masukkan deskripsi produk (opsional)"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              {...form.register('status', { valueAsNumber: true })}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Tidak Aktif</option>
            </select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
