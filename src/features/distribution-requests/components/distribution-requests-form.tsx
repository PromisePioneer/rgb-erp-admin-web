/**
 * Distribution Requests Form Component
 * Full page form with dynamic line items
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useDistributionRequestsStore } from '../store/distribution-requests-store'
import { distributionRequestsApi } from '../api/distribution-requests-api'
import { productsApi } from '@/features/products/api/products-api'
import type { DestinationType } from '../types/distribution-requests.types'

// Line item type
interface LineItem {
  id: string
  product_id: number
  product_name: string
  qty: number
  unit_cost: number
  total: number
}

// Form schema
const formSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  warehouse_source_id: z.string().min(1, 'Gudang sumber wajib dipilih'),
  destination_type: z.enum(['area', 'warehouse'], {
    required_error: 'Tipe tujuan wajib dipilih',
  }),
  client_id: z.string().optional(),
  area_id: z.string().optional(),
  warehouse_destination_id: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', class: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800' },
  }
  const { label, class: className } = config[status] || config.draft

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export function DistributionRequestsForm() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const {
    fetchById,
    create,
    update,
    submitForApproval,
    selectedItem,
    isSubmitting,
    isLoading,
    clearSelectedItem,
  } = useDistributionRequestsStore()

  const isEdit = !!params.id
  const [initialized, setInitialized] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', product_id: 0, product_name: '', qty: 0, unit_cost: 0, total: 0 },
  ])
  const [selectedProducts, setSelectedProducts] = useState<Record<string, SelectOption | null>>({})
  const [selectedClient, setSelectedClient] = useState<SelectOption | null>(null)
  const [selectedArea, setSelectedArea] = useState<SelectOption | null>(null)
  const [selectedWarehouseSource, setSelectedWarehouseSource] = useState<SelectOption | null>(null)
  const [selectedWarehouseDest, setSelectedWarehouseDest] = useState<SelectOption | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      warehouse_source_id: '',
      destination_type: 'area',
      client_id: '',
      area_id: '',
      warehouse_destination_id: '',
      notes: '',
    },
  })

  const destinationType = form.watch('destination_type')

  // Load data for edit
  useEffect(() => {
    if (isEdit && params.id) {
      fetchById(Number(params.id))
    }
    return () => {
      clearSelectedItem()
    }
  }, [isEdit, params.id, fetchById, clearSelectedItem])

  // Populate form when selectedItem is loaded
  useEffect(() => {
    if (selectedItem && isEdit && !initialized) {
      form.reset({
        date: selectedItem.date.split('T')[0],
        warehouse_source_id: String(selectedItem.warehouse_source_id ?? ''),
        destination_type: selectedItem.destination_type ?? 'area',
        client_id: String(selectedItem.client_id ?? ''),
        area_id: String(selectedItem.area_id ?? ''),
        warehouse_destination_id: String(selectedItem.warehouse_destination_id ?? ''),
        notes: selectedItem.notes ?? '',
      })

      // Set warehouse source
      if (selectedItem.warehouse_source_id) {
        setSelectedWarehouseSource({
          value: String(selectedItem.warehouse_source_id),
          label: selectedItem.warehouse_source_name ?? '',
        })
      }

      // Set client
      if (selectedItem.client_id) {
        setSelectedClient({
          value: String(selectedItem.client_id),
          label: selectedItem.client_name ?? '',
        })
      }

      // Set area
      if (selectedItem.area_id) {
        setSelectedArea({
          value: String(selectedItem.area_id),
          label: selectedItem.area_name ?? '',
        })
      }

      // Set warehouse destination
      if (selectedItem.warehouse_destination_id) {
        setSelectedWarehouseDest({
          value: String(selectedItem.warehouse_destination_id),
          label: selectedItem.warehouse_destination_name ?? '',
        })
      }

      // Set line items
      const newLineItems = selectedItem.details.map((d, i) => ({
        id: String(i + 1),
        product_id: d.product_id,
        product_name: d.product_name ?? '',
        qty: d.qty,
        unit_cost: d.unit_cost,
        total: d.total,
      }))
      setLineItems(newLineItems)

      const newSelectedProducts: Record<string, SelectOption | null> = {}
      newLineItems.forEach((item) => {
        if (item.product_id > 0) {
          newSelectedProducts[item.id] = { value: String(item.product_id), label: item.product_name || '' }
        }
      })
      setSelectedProducts(newSelectedProducts)
      setInitialized(true)
    }
  }, [selectedItem, isEdit, initialized, form])

  const handleBack = () => {
    navigate({ to: '/distribution-requests' })
  }

  const handleSubmitForApproval = async () => {
    if (!params.id) return

    try {
      await submitForApproval(Number(params.id))
      toast.success('Distribution request submitted for approval')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit for approval'
      toast.error(message)
    }
  }

  // Load products for dropdown (from product_warehouses based on selected source warehouse)
  const loadProducts = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const warehouseId = form.getValues('warehouse_source_id')
      if (!warehouseId) {
        return []
      }
      // Fetch from products/select-options with warehouse_id (uses product_warehouses)
      const response = await productsApi.getSelectOptions({
        q: search,
        category_id: undefined,
        warehouse_id: Number(warehouseId),
      })
      return response.data.map((p: any) => ({
        value: String(p.product_id || p.id),
        label: `${p.name} (Stock: ${p.stock ?? 'N/A'})`,
      }))
    } catch {
      return []
    }
  }, [form])

  // Load warehouses for source
  const loadWarehouses = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await distributionRequestsApi.getWarehousesOptions({ q: search })
      return response.data.map((w) => ({
        value: String(w.id),
        label: w.name,
      }))
    } catch {
      return []
    }
  }, [])

  // Load clients for dropdown
  const loadClients = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await distributionRequestsApi.getClientsOptions({ q: search })
      return response.data.map((c) => ({
        value: String(c.id),
        label: c.name,
      }))
    } catch {
      return []
    }
  }, [])

  // Load areas for dropdown (filtered by selected client)
  const loadAreas = useCallback(
    async (search: string): Promise<SelectOption[]> => {
      try {
        const clientId = form.getValues('client_id')
        const response = await distributionRequestsApi.getAreasOptions({
          q: search,
          client_id: clientId ? Number(clientId) : undefined,
        })
        return response.data.map((a) => ({
          value: String(a.id),
          label: a.text || `${a.name}`,
        }))
      } catch {
        return []
      }
    },
    [form]
  )

  // Load warehouses for destination dropdown
  const loadWarehouseDest = useCallback(
    async (search: string): Promise<SelectOption[]> => {
      try {
        const sourceId = form.getValues('warehouse_source_id')
        const response = await distributionRequestsApi.getWarehousesOptions({
          q: search,
          exclude_id: sourceId ? Number(sourceId) : undefined,
        })
        return response.data.map((w) => ({
          value: String(w.id),
          label: w.name,
        }))
      } catch {
        return []
      }
    },
    [form]
  )

  // Skeleton loading state
  if (isLoading && isEdit) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="bg-card rounded-lg border p-6 space-y-4 mb-6">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const handleAddLine = () => {
    const newId = String(Date.now())
    setLineItems([
      ...lineItems,
      { id: newId, product_id: 0, product_name: '', qty: 0, unit_cost: 0, total: 0 },
    ])
    setSelectedProducts({ ...selectedProducts, [newId]: null })
  }

  const handleRemoveLine = (index: number) => {
    if (lineItems.length > 1) {
      const itemToRemove = lineItems[index]
      const newItems = lineItems.filter((_, i) => i !== index)
      setLineItems(newItems)
      const newSelected = { ...selectedProducts }
      delete newSelected[itemToRemove.id]
      setSelectedProducts(newSelected)
    }
  }

  // Handle product selection
  const handleProductChange = (lineId: string, productId: number | null) => {
    setLineItems(
      lineItems.map((item) => (item.id === lineId ? { ...item, product_id: productId ?? 0 } : item))
    )
    if (!productId) {
      setSelectedProducts({ ...selectedProducts, [lineId]: null })
    }
  }

  // Calculate grand total
  const grandTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)

  const onSubmit = async (values: FormValues) => {
    const validItems = lineItems.filter((item) => item.product_id > 0)
    if (validItems.length === 0) {
      toast.error('Minimal harus ada 1 item produk')
      return
    }

    // Validate destination
    if (values.destination_type === 'area' && !values.area_id) {
      toast.error('Area wajib dipilih')
      return
    }

    if (values.destination_type === 'warehouse' && !values.warehouse_destination_id) {
      toast.error('Gudang tujuan wajib dipilih')
      return
    }

    try {
      const payload = {
        date: values.date,
        warehouse_source_id: Number(values.warehouse_source_id),
        destination_type: values.destination_type as DestinationType,
        client_id: values.client_id ? Number(values.client_id) : null,
        area_id: values.area_id ? Number(values.area_id) : null,
        warehouse_destination_id: values.warehouse_destination_id ? Number(values.warehouse_destination_id) : null,
        notes: values.notes || '',
        details: validItems.map((d) => ({
          product_id: d.product_id,
          qty: d.qty,
          unit_cost: d.unit_cost,
        })),
      }

      if (isEdit && params.id) {
        await update(Number(params.id), payload)
        toast.success('Distribution request updated successfully')
      } else {
        await create(payload)
        toast.success('Distribution request created successfully')
      }
      navigate({ to: '/distribution-requests' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save distribution request'
      toast.error(message)
    }
  }

  // Determine if form is editable
  const canEdit = selectedItem?.can_edit ?? true
  const canSubmit = selectedItem?.can_submit ?? false
  const currentStatus = selectedItem?.status

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Distribution Requests
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {isEdit ? 'Edit Distribution Request' : 'New Distribution Request'}
            </h2>
            <p className="text-muted-foreground">
              {isEdit ? 'Edit data distribusi' : 'Tambah request distribusi baru'}
            </p>
          </div>
          {isEdit && currentStatus && <StatusBadge status={currentStatus} />}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Informasi Dasar</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal *</label>
              <Input type="date" {...form.register('date')} disabled={!canEdit} />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gudang Sumber *</label>
              <AsyncSelect
                value={selectedWarehouseSource?.value ?? null}
                onChange={(val) => {
                  const numVal = typeof val === 'string' ? parseInt(val, 10) || null : val
                  setSelectedWarehouseSource(
                    numVal
                      ? { value: numVal, label: selectedWarehouseSource?.label || '' }
                      : null
                  )
                  form.setValue('warehouse_source_id', val as string)
                }}
                loadOptions={loadWarehouses}
                placeholder="Pilih gudang sumber..."
                className="w-full"
                isDisabled={!canEdit}
              />
              <input type="hidden" {...form.register('warehouse_source_id')} />
              {form.formState.errors.warehouse_source_id && (
                <p className="text-sm text-red-500">{form.formState.errors.warehouse_source_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Tujuan Distribusi</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipe Tujuan *</label>
            <div className={cn('flex gap-4', !canEdit && 'opacity-50 pointer-events-none')}>
              <button
                type="button"
                onClick={() => {
                  form.setValue('destination_type', 'area')
                  form.setValue('area_id', '')
                  form.setValue('warehouse_destination_id', '')
                  setSelectedArea(null)
                  setSelectedWarehouseDest(null)
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                  form.getValues('destination_type') === 'area'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                )}
              >
                <span className={cn(
                  'w-4 h-4 rounded-full border-2',
                  form.getValues('destination_type') === 'area'
                    ? 'border-primary bg-primary'
                    : 'border-gray-400'
                )}>
                  {form.getValues('destination_type') === 'area' && (
                    <span className="block w-full h-full rounded-full bg-primary" />
                  )}
                </span>
                <span className="text-sm font-medium">Area / Client</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue('destination_type', 'warehouse')
                  form.setValue('area_id', '')
                  form.setValue('warehouse_destination_id', '')
                  setSelectedArea(null)
                  setSelectedWarehouseDest(null)
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                  form.getValues('destination_type') === 'warehouse'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                )}
              >
                <span className={cn(
                  'w-4 h-4 rounded-full border-2',
                  form.getValues('destination_type') === 'warehouse'
                    ? 'border-primary bg-primary'
                    : 'border-gray-400'
                )}>
                  {form.getValues('destination_type') === 'warehouse' && (
                    <span className="block w-full h-full rounded-full bg-primary" />
                  )}
                </span>
                <span className="text-sm font-medium">Warehouse</span>
              </button>
            </div>
          </div>

          {destinationType === 'area' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client</label>
                  <AsyncSelect
                    value={selectedClient?.value ?? null}
                    onChange={(val) => {
                      const numVal = typeof val === 'string' ? parseInt(val, 10) || null : val
                      setSelectedClient(
                        numVal
                          ? { value: numVal, label: selectedClient?.label || '' }
                          : null
                      )
                      form.setValue('client_id', val as string)
                      form.setValue('area_id', '')
                      setSelectedArea(null)
                    }}
                    loadOptions={loadClients}
                    placeholder="Pilih client..."
                    className="w-full"
                    isDisabled={!canEdit}
                  />
                  <input type="hidden" {...form.register('client_id')} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Area *</label>
                  <AsyncSelect
                    value={selectedArea?.value ?? null}
                    onChange={(val) => {
                      const numVal = typeof val === 'string' ? parseInt(val, 10) || null : val
                      setSelectedArea(
                        numVal
                          ? { value: numVal, label: selectedArea?.label || '' }
                          : null
                      )
                      form.setValue('area_id', val as string)
                    }}
                    loadOptions={loadAreas}
                    placeholder="Pilih area..."
                    className="w-full"
                    isDisabled={!canEdit}
                  />
                  <input type="hidden" {...form.register('area_id')} />
                  {form.formState.errors.area_id && (
                    <p className="text-sm text-red-500">{form.formState.errors.area_id.message}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {destinationType === 'warehouse' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Gudang Tujuan *</label>
              <AsyncSelect
                value={selectedWarehouseDest?.value ?? null}
                onChange={(val) => {
                  const numVal = typeof val === 'string' ? parseInt(val, 10) || null : val
                  setSelectedWarehouseDest(
                    numVal
                      ? { value: numVal, label: selectedWarehouseDest?.label || '' }
                      : null
                  )
                  form.setValue('warehouse_destination_id', val as string)
                }}
                loadOptions={loadWarehouseDest}
                placeholder="Pilih gudang tujuan..."
                className="w-full"
                isDisabled={!canEdit}
              />
              <input type="hidden" {...form.register('warehouse_destination_id')} />
              {form.formState.errors.warehouse_destination_id && (
                <p className="text-sm text-red-500">{form.formState.errors.warehouse_destination_id.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Item Produk</h3>
            {canEdit && (
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            )}
          </div>

          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-1">
            <div className="col-span-4">Produk</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Unit Cost</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2"></div>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <AsyncSelect
                    value={selectedProducts[item.id]?.value ?? null}
                    onChange={(val) => {
                      const numVal = typeof val === 'string' ? parseInt(val, 10) || null : val
                      const selected = numVal
                        ? { value: numVal, label: selectedProducts[item.id]?.label || '' }
                        : null
                      setSelectedProducts({ ...selectedProducts, [item.id]: selected })
                      handleProductChange(item.id, numVal)
                    }}
                    loadOptions={loadProducts}
                    placeholder="Pilih produk..."
                    className="w-full"
                    isDisabled={!canEdit}
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.qty}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0
                      const total = qty * item.unit_cost
                      setLineItems(
                        lineItems.map((it, i) =>
                          i === index ? { ...it, qty, total } : it
                        )
                      )
                    }}
                    placeholder="0"
                    disabled={!canEdit}
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_cost}
                    onChange={(e) => {
                      const unit_cost = parseFloat(e.target.value) || 0
                      const total = item.qty * unit_cost
                      setLineItems(
                        lineItems.map((it, i) =>
                          i === index ? { ...it, unit_cost, total } : it
                        )
                      )
                    }}
                    placeholder="0"
                    disabled={!canEdit}
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.total}
                    readOnly
                    placeholder="0"
                    className="bg-muted"
                  />
                </div>

                <div className="col-span-2 flex justify-end">
                  {canEdit && (
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
                  )}
                </div>
              </div>
            ))}
          </div>

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

        {/* Notes */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Catatan</h3>
          <div className="space-y-2">
            <textarea
              {...form.register('notes')}
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Masukkan catatan distribusi..."
              rows={3}
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {!canEdit && currentStatus === 'approved' && (
              <span className="text-green-600 font-medium">
                Distribution request ini sudah disetujui dan tidak dapat diedit.
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleBack}>
              Batal
            </Button>
            {canSubmit && (
              <Button
                type="button"
                variant="default"
                onClick={handleSubmitForApproval}
                disabled={isSubmitting || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Mengirim...' : 'Ajukan Approval'}
              </Button>
            )}
            {canEdit && (
              <Button type="submit" disabled={isSubmitting || isLoading}>
                <Save className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
