/**
 * Receptions Form Page Component
 * Full page form for create/edit reception
 */
import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Save, Plus, Trash2, ArrowLeft, Package, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useReceptionsStore } from '@/features/receptions/store/receptions-store'
import { receptionsApi } from '@/features/receptions/api/receptions-api'
import { warehousesApi } from '@/features/warehouses/api/warehouses-api'
import type { CreateReceptionPayload, UpdateReceptionPayload, ReceptionLineItem } from '@/features/receptions/types/receptions.types'

type FormValues = {
  purchase_order_id: number | undefined
  warehouse_id: number | undefined
  date: string
}

export function ReceptionsForm() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false }) as { id?: string }
  const isEdit = Boolean(id)
  const receptionId = isEdit ? Number(id) : undefined

  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useReceptionsStore()

  // Form state
  const [formValues, setFormValues] = useState<FormValues>({
    purchase_order_id: undefined,
    warehouse_id: undefined,
    date: new Date().toISOString().split('T')[0],
  })

  // Line items state
  const [lineItems, setLineItems] = useState<ReceptionLineItem[]>([])

  // Calculate grand total
  const grandTotal = lineItems.reduce((sum, item) => sum + item.line_total, 0)

  // Fetch data for edit mode
  useEffect(() => {
    if (isEdit && receptionId) {
      fetchById(receptionId)
    } else {
      resetForm()
    }
  }, [isEdit, receptionId, fetchById, resetForm])

  // Populate form when data is loaded
  useEffect(() => {
    if (isEdit && selectedItem) {
      setFormValues({
        purchase_order_id: selectedItem.purchase_order_id,
        warehouse_id: selectedItem.warehouse_id,
        date: selectedItem.date,
      })

      // Populate line items from selected item
      if (selectedItem.details && selectedItem.details.length > 0) {
        setLineItems(selectedItem.details.map((detail) => ({
          product_id: detail.product_id,
          product_name: detail.product?.name,
          product_code: detail.product?.code,
          qty: detail.qty,
          unit_price: detail.total / detail.qty || 0,
          line_total: detail.total,
        })))
      }
    }
  }, [isEdit, selectedItem])

  // Load purchase order details when PO is selected
  const handlePurchaseOrderChange = useCallback(async (value: number | string | null) => {
    if (!value) {
      setFormValues(prev => ({ ...prev, purchase_order_id: undefined }))
      setLineItems([])
      return
    }

    const poId = Number(value)
    setFormValues(prev => ({ ...prev, purchase_order_id: poId }))

    try {
      const response = await receptionsApi.getById(poId)
      const po = response.data

      if (po.purchase_order?.details) {
        // Auto-populate line items from PO
        setLineItems(po.purchase_order.details.map((d: any) => ({
          product_id: d.product_id,
          product_name: d.product?.name || `Product #${d.product_id}`,
          product_code: d.product?.code || '',
          qty: d.qty,
          unit_price: d.price || 0,
          line_total: d.total,
        })))
      }
    } catch (error) {
      console.error('Failed to load PO details:', error)
      toast.error('Gagal memuat detail PO')
    }
  }, [])

  // Load warehouses
  const loadWarehouses = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await warehousesApi.getSelectOptions({ q: search })
      return response.data.map((w) => ({
        value: w.id,
        label: w.name,
      }))
    } catch {
      return []
    }
  }, [])

  // Load purchase orders
  const loadPurchaseOrders = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await receptionsApi.getPurchaseOrdersSelectOptions(search)
      return response.data.map((po) => ({
        value: po.id,
        label: `${po.code} - ${po.supplier_name || 'No Supplier'}`,
      }))
    } catch {
      return []
    }
  }, [])

  // Skeleton loading state - AFTER all hooks
  if (isLoading && isEdit) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4 mb-6">
          <Skeleton className="h-6 w-40" />
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium w-12">#</th>
                  <th className="px-3 py-2 text-left font-medium">Produk</th>
                  <th className="px-3 py-2 text-right font-medium w-24">Qty</th>
                  <th className="px-3 py-2 text-right font-medium w-36">Harga</th>
                  <th className="px-3 py-2 text-right font-medium w-36">Total</th>
                  <th className="px-3 py-2 text-center font-medium w-16">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-3 py-2"><Skeleton className="h-8 w-full" /></td>
                    <td className="px-3 py-2"><Skeleton className="h-8 w-24" /></td>
                    <td className="px-3 py-2"><Skeleton className="h-8 w-full" /></td>
                    <td className="px-3 py-2"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-3 py-2"><Skeleton className="h-8 w-8 mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Update line item
  const updateLineItem = (index: number, field: keyof ReceptionLineItem, value: number | string) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== index) return item

      const updated = { ...item, [field]: value }

      // Recalculate line total if qty or unit_price changed
      if (field === 'qty' || field === 'unit_price') {
        const qty = field === 'qty' ? Number(value) : item.qty
        const price = field === 'unit_price' ? Number(value) : item.unit_price
        updated.line_total = qty * price
      }

      return updated
    }))
  }

  // Remove line item
  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index))
  }

  // Add empty line item
  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      product_id: null,
      qty: 0,
      unit_price: 0,
      line_total: 0,
    }])
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Submit handler
  const onSubmit = async () => {
    // Validation
    if (!formValues.purchase_order_id) {
      toast.error('Purchase Order wajib dipilih')
      return
    }
    if (!formValues.warehouse_id) {
      toast.error('Gudang wajib dipilih')
      return
    }
    if (!formValues.date) {
      toast.error('Tanggal wajib diisi')
      return
    }
    if (lineItems.length === 0) {
      toast.error('Minimal 1 produk harus ditambahkan')
      return
    }

    // Filter valid line items
    const validLineItems = lineItems.filter(item => item.product_id && item.qty > 0)
    if (validLineItems.length === 0) {
      toast.error('Minimal 1 produk dengan qty > 0 harus ditambahkan')
      return
    }

    try {
      const payload = {
        purchase_order_id: formValues.purchase_order_id,
        warehouse_id: formValues.warehouse_id,
        date: formValues.date,
        product_id: validLineItems.map(item => item.product_id as number),
        qty: validLineItems.map(item => item.qty),
        line_total: validLineItems.map(item => item.line_total),
      }

      if (!isEdit) {
        await create(payload as CreateReceptionPayload)
        toast.success('Penerimaan berhasil ditambahkan')
      } else if (receptionId) {
        await update(receptionId, payload as UpdateReceptionPayload)
        toast.success('Penerimaan berhasil diperbarui')
      }
      navigate({ to: '/receptions' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/receptions' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? 'Edit Penerimaan' : 'Tambah Penerimaan Baru'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEdit ? 'Perbarui informasi penerimaan barang' : 'Lengkapi informasi penerimaan barang baru'}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: '/receptions' })}>
          Batal
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informasi Dasar
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Order *</label>
              <AsyncSelect
                value={formValues.purchase_order_id ?? null}
                onChange={(value) => handlePurchaseOrderChange(value)}
                loadOptions={loadPurchaseOrders}
                placeholder="Pilih PO..."
                isDisabled={isLoading || isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gudang *</label>
              <AsyncSelect
                value={formValues.warehouse_id ?? null}
                onChange={(value) => setFormValues(prev => ({ ...prev, warehouse_id: value ? Number(value) : undefined }))}
                loadOptions={loadWarehouses}
                placeholder="Pilih gudang..."
                isDisabled={isLoading || isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal *</label>
              <Input
                type="date"
                value={formValues.date}
                onChange={(e) => setFormValues(prev => ({ ...prev, date: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detail Produk
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Baris
            </Button>
          </div>

          {lineItems.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium w-12">#</th>
                    <th className="px-3 py-2 text-left font-medium">Produk</th>
                    <th className="px-3 py-2 text-right font-medium w-24">Qty</th>
                    <th className="px-3 py-2 text-right font-medium w-36">Harga</th>
                    <th className="px-3 py-2 text-right font-medium w-36">Total</th>
                    <th className="px-3 py-2 text-center font-medium w-16">Hapus</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2 text-center text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">
                          <div className="font-medium">{item.product_name || '-'}</div>
                          {item.product_code && (
                            <div className="text-xs text-muted-foreground">{item.product_code}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => updateLineItem(index, 'qty', parseFloat(e.target.value) || 0)}
                          className="text-right w-24"
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="text-right"
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(item.line_total)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-destructive hover:text-destructive"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-right font-semibold">
                      TOTAL:
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-lg">
                      {formatCurrency(grandTotal)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada produk ditambahkan.</p>
              <p className="text-sm">Pilih PO untuk otomatis mengisi, atau klik "Tambah Baris"</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/receptions' })}>
            Batal
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
