/**
 * Purchase Requests Form Component
 * Full page form with dynamic line items
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { usePurchaseRequestsStore } from '../store/purchase-requests-store'
import { purchaseRequestsApi } from '../api/purchase-requests-api'

// Line item type
interface LineItem {
  id: string
  product_id: number
  product_name: string
  qty: number
  total: number
}

// Form schema
const formSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  supplier: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function PurchaseRequestsForm() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const { fetchById, create, update, selectedItem, isSubmitting, isLoading, resetForm } = usePurchaseRequestsStore()

  const isEdit = !!params.id
  const [initialized, setInitialized] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', product_id: 0, product_name: '', qty: 0, total: 0 }
  ])
  // Track selected product options for each line
  const [selectedProducts, setSelectedProducts] = useState<Record<string, SelectOption | null>>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      supplier: '',
    },
  })

  // Load data for edit
  useEffect(() => {
    if (isEdit && params.id) {
      fetchById(Number(params.id))
    }
    return () => {
      resetForm()
    }
  }, [isEdit, params.id])

  // Populate form when selectedItem is loaded
  useEffect(() => {
    if (selectedItem && isEdit && !initialized) {
      form.reset({
        date: selectedItem.date.split('T')[0],
        supplier: selectedItem.supplier ?? '',
      })
      const newLineItems = selectedItem.details.map((d, i) => ({
        id: String(i + 1),
        product_id: d.product_id,
        product_name: d.product_name ?? '',
        qty: d.qty,
        total: d.total,
      }))
      setLineItems(newLineItems)
      // Set selected products
      const newSelectedProducts: Record<string, SelectOption | null> = {}
      newLineItems.forEach((item) => {
        if (item.product_id > 0) {
          newSelectedProducts[item.id] = { value: item.product_id, label: item.product_name || '' }
        }
      })
      setSelectedProducts(newSelectedProducts)
      setInitialized(true)
    }
  }, [selectedItem, isEdit, form, initialized])

  const handleBack = () => {
    navigate({ to: '/purchase-requests' })
  }

  const handleAddLine = () => {
    const newId = String(Date.now())
    setLineItems([
      ...lineItems,
      { id: newId, product_id: 0, product_name: '', qty: 0, total: 0 }
    ])
    setSelectedProducts({ ...selectedProducts, [newId]: null })
  }

  const handleRemoveLine = (index: number) => {
    if (lineItems.length > 1) {
      const itemToRemove = lineItems[index]
      const newItems = lineItems.filter((_, i) => i !== index)
      setLineItems(newItems)
      // Remove from selected products
      const newSelected = { ...selectedProducts }
      delete newSelected[itemToRemove.id]
      setSelectedProducts(newSelected)
    }
  }

  // Load products for dropdown
  const loadProducts = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await purchaseRequestsApi.getProductsSelectOptions({ q: search })
      return response.data.map((p) => ({
        value: p.id,
        label: p.name,
      }))
    } catch {
      return []
    }
  }, [])

  // Handle product selection
  const handleProductChange = (lineId: string, productId: number | null) => {
    setLineItems(lineItems.map((item) =>
      item.id === lineId ? { ...item, product_id: productId ?? 0 } : item
    ))
    if (!productId) {
      setSelectedProducts({ ...selectedProducts, [lineId]: null })
    }
  }

  // Calculate grand total
  const grandTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)

  const onSubmit = async (values: FormValues) => {
    // Validate line items
    const validItems = lineItems.filter(item => item.product_id > 0)
    if (validItems.length === 0) {
      toast.error('Minimal harus ada 1 item produk')
      return
    }

    try {
      const payload = {
        date: values.date,
        supplier: values.supplier || undefined,
        details: validItems.map((d) => ({
          product_id: d.product_id,
          qty: d.qty,
          total: d.total,
        })),
      }

      if (isEdit && params.id) {
        await update(Number(params.id), payload)
        toast.success('Purchase request updated successfully')
      } else {
        await create(payload)
        toast.success('Purchase request created successfully')
      }
      navigate({ to: '/purchase-requests' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save purchase request'
      toast.error(message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Purchase Requests
        </button>
        <h2 className="text-2xl font-bold">
          {isEdit ? 'Edit Purchase Request' : 'New Purchase Request'}
        </h2>
        <p className="text-muted-foreground">
          {isEdit ? 'Edit data purchase request' : 'Tambah purchase request baru'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Informasi Dasar</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal *</label>
              <Input
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <Input
                {...form.register('supplier')}
                placeholder="Masukkan nama supplier (opsional)"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Item Produk</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Item
            </Button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-1">
            <div className="col-span-5">Produk</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-3">Total</div>
            <div className="col-span-2"></div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                {/* Product */}
                <div className="col-span-5">
                  <AsyncSelect
                    value={selectedProducts[item.id]?.value ?? null}
                    onChange={(val) => {
                      const numVal = typeof val === 'string' ? parseInt(val, 10) || null : val
                      const selected = numVal ? { value: numVal, label: selectedProducts[item.id]?.label || '' } : null
                      setSelectedProducts({ ...selectedProducts, [item.id]: selected })
                      handleProductChange(item.id, numVal)
                    }}
                    loadOptions={loadProducts}
                    placeholder="Pilih produk..."
                    className="w-full"
                  />
                </div>

                {/* Qty */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    min={0}
                    value={item.qty}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0
                      setLineItems(lineItems.map((it, i) =>
                        i === index ? { ...it, qty } : it
                      ))
                    }}
                    placeholder="0"
                  />
                </div>

                {/* Total */}
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={0}
                    value={item.total}
                    onChange={(e) => {
                      const total = parseFloat(e.target.value) || 0
                      setLineItems(lineItems.map((it, i) =>
                        i === index ? { ...it, total } : it
                      ))
                    }}
                    placeholder="0"
                  />
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLine(index)}
                    disabled={lineItems.length <= 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(grandTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleBack}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
