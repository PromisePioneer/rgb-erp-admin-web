/**
 * Purchase Orders Form Component
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
import { usePurchaseOrdersStore } from '../store/purchase-orders-store'
import { purchaseOrdersApi } from '../api/purchase-orders-api'

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
  purchase_request_id: z.number().min(1, 'Purchase Request wajib dipilih'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  supplier: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function PurchaseOrdersForm() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const { fetchById, create, update, selectedItem, isSubmitting, isLoading, resetForm } = usePurchaseOrdersStore()

  const isEdit = !!params.id
  const [initialized, setInitialized] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', product_id: 0, product_name: '', qty: 0, total: 0 }
  ])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchase_request_id: 0,
      date: new Date().toISOString().split('T')[0],
      supplier: '',
    },
  })

  // Load purchase requests options
  const loadPurchaseRequests = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await purchaseOrdersApi.getPurchaseRequestsSelectOptions({ q: search })
      const options = response.data.map((pr) => ({
        value: pr.id,
        label: `${pr.code} - ${pr.supplier ?? 'No Supplier'} (${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(pr.total)})`,
      }))
      return options
    } catch {
      return []
    }
  }, [])

  // Auto-fill details when purchase request is selected
  const watchPurchaseRequestId = form.watch('purchase_request_id')

  useEffect(() => {
    const loadPRDetails = async () => {
      if (watchPurchaseRequestId > 0 && !isEdit && !initialized) {
        try {
          const response = await purchaseOrdersApi.getPurchaseRequestsSelectOptions()
          const selectedPR = response.data.find((pr) => pr.id === watchPurchaseRequestId)
          if (selectedPR) {
            // Update supplier if empty
            if (!form.getValues('supplier')) {
              form.setValue('supplier', selectedPR.supplier ?? '')
            }
            // Populate details from PR
            const newDetails = selectedPR.details.map((d, i) => ({
              id: String(i + 1),
              product_id: d.product_id,
              product_name: d.product_name ?? '',
              qty: d.qty,
              total: d.total,
            }))
            if (newDetails.length > 0) {
              setLineItems(newDetails)
              setInitialized(true)
            }
          }
        } catch {
          // Ignore errors
        }
      }
    }
    loadPRDetails()
  }, [watchPurchaseRequestId, isEdit, form, initialized])

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
        purchase_request_id: selectedItem.purchase_request_id,
        date: selectedItem.date.split('T')[0],
        supplier: selectedItem.supplier ?? '',
      })
      setLineItems(selectedItem.details.map((d, i) => ({
        id: String(i + 1),
        product_id: d.product_id,
        product_name: d.product_name ?? '',
        qty: d.qty,
        total: d.total,
      })))
      setInitialized(true)
    }
  }, [selectedItem, isEdit, form, initialized])

  const handleBack = () => {
    navigate({ to: '/purchase-orders' })
  }

  const handleAddLine = () => {
    setLineItems([
      ...lineItems,
      { id: String(Date.now()), product_id: 0, product_name: '', qty: 0, total: 0 }
    ])
  }

  const handleRemoveLine = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
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
        purchase_request_id: values.purchase_request_id,
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
        toast.success('Purchase order updated successfully')
      } else {
        await create(payload)
        toast.success('Purchase order created successfully')
      }
      navigate({ to: '/purchase-orders' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save purchase order'
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
          Kembali ke Purchase Orders
        </button>
        <h2 className="text-2xl font-bold">
          {isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
        </h2>
        <p className="text-muted-foreground">
          {isEdit ? 'Edit data purchase order' : 'Tambah purchase order baru'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Informasi Dasar</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Purchase Request */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Request *</label>
              <AsyncSelect
                value={form.watch('purchase_request_id') || null}
                onChange={(val) => form.setValue('purchase_request_id', val ? Number(val) : 0)}
                loadOptions={loadPurchaseRequests}
                placeholder="Pilih purchase request..."
                className="w-full"
              />
              {form.formState.errors.purchase_request_id && (
                <p className="text-sm text-red-500">{form.formState.errors.purchase_request_id.message}</p>
              )}
            </div>

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
                {/* Product (read-only, filled from PR) */}
                <div className="col-span-5">
                  <Input
                    value={item.product_name || 'Pilih PR untuk auto-fill'}
                    placeholder="Pilih PR untuk auto-fill"
                    className="bg-muted"
                    readOnly
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
