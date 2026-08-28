/**
 * Invoice Form Modal Component
 * Modal form for creating invoices with line items
 */
import { useEffect, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Trash2, Save, FileText } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useInvoicesStore } from '../store/invoices-store'
import { invoicesApi } from '../api/invoices-api'

interface InvoiceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface InvoiceItem {
  description: string
  qty: string
  price: string
}

interface FormValues {
  client_id: number | undefined
  issue_date: string
  due_date: string
  period: string
  tax: string
  discount: string
  notes: string
  items: InvoiceItem[]
}

export function InvoiceFormModal({ open, onOpenChange }: InvoiceFormModalProps) {
  const { create, isSubmitting } = useInvoicesStore()

  const form = useForm<FormValues>({
    defaultValues: {
      client_id: undefined,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period: '',
      tax: '0',
      discount: '0',
      notes: '',
      items: [{ description: '', qty: '1', price: '0' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        client_id: undefined,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period: '',
        tax: '0',
        discount: '0',
        notes: '',
        items: [{ description: '', qty: '1', price: '0' }],
      })
    }
  }, [open, form])

  const loadClients = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await invoicesApi.getSelectOptions({ q: search })
      return response.map((item) => ({
        value: item.id,
        label: item.name,
      }))
    } catch {
      return []
    }
  }, [])

  const addItem = () => {
    append({ description: '', qty: '1', price: '0' })
  }

  // Calculate subtotal
  const calculateSubtotal = () => {
    const items = form.watch('items')
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0
      const price = parseFloat(item.price) || 0
      return sum + (qty * price)
    }, 0)
  }

  const onSubmit = async (values: FormValues) => {
    if (!values.client_id) {
      toast.error('Client wajib dipilih')
      return
    }

    // Validate items
    const validItems = values.items.filter(item => item.description.trim() !== '')
    if (validItems.length === 0) {
      toast.error('Minimal harus ada 1 item dengan deskripsi')
      return
    }

    try {
      const payload = {
        client_id: values.client_id,
        issue_date: values.issue_date,
        due_date: values.due_date,
        period: values.period || undefined,
        tax: parseFloat(values.tax) || 0,
        discount: parseFloat(values.discount) || 0,
        notes: values.notes || undefined,
        items: validItems.map(item => ({
          description: item.description,
          qty: parseFloat(item.qty) || 0,
          price: parseFloat(item.price) || 0,
        })),
      }

      await create(payload)
      toast.success('Invoice berhasil dibuat')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  const subtotal = calculateSubtotal()
  const tax = parseFloat(form.watch('tax')) || 0
  const discount = parseFloat(form.watch('discount')) || 0
  const total = subtotal + tax - discount

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[900px] max-w-[95vw]"
        style={{ width: '900px', maxWidth: '95vw' }}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
              <DialogDescription>
                Create a new invoice with line items
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form id="invoice-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Client <span className="text-red-500">*</span>
              </Label>
              <AsyncSelect
                value={form.watch('client_id') ?? null}
                onChange={(value) => form.setValue('client_id', value as number | undefined)}
                loadOptions={loadClients}
                placeholder="Pilih client..."
                className="w-full h-11"
              />
            </div>

            {/* Invoice Details */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Invoice Details
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Issue Date *</Label>
                  <Input
                    type="date"
                    className="h-11"
                    {...form.register('issue_date', { required: 'Issue date wajib diisi' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Due Date *</Label>
                  <Input
                    type="date"
                    className="h-11"
                    {...form.register('due_date', { required: 'Due date wajib diisi' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Period</Label>
                  <Input
                    placeholder="e.g., August 2026"
                    className="h-11"
                    {...form.register('period')}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
                  Line Items
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-9">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted rounded-lg text-xs font-semibold text-muted-foreground uppercase">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const qty = parseFloat(form.watch(`items.${index}.qty`)) || 0
                  const price = parseFloat(form.watch(`items.${index}.price`)) || 0
                  const lineTotal = qty * price

                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-center py-1"
                    >
                      <div className="col-span-5">
                        <Input
                          placeholder="Item description"
                          className="h-11"
                          {...form.register(`items.${index}.description` as const)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-11 text-center font-mono"
                          {...form.register(`items.${index}.qty` as const, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                            Rp
                          </span>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-11 pl-10 pr-3 text-right font-mono"
                            {...form.register(`items.${index}.price` as const, { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <span className="text-sm font-mono font-medium text-right w-full pr-2">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tax, Discount & Notes - Side by Side */}
            <div className="grid grid-cols-5 gap-6">
              {/* Notes */}
              <div className="col-span-2 space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  Notes
                </Label>
                <textarea
                  className="flex min-h-[140px] w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Additional notes or payment terms..."
                  {...form.register('notes')}
                />
              </div>

              {/* Tax & Discount */}
              <div className="col-span-3 space-y-4">
                <Label className="text-sm font-semibold text-foreground">
                  Additional
                </Label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Tax (IDR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        Rp
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-11 pl-10 pr-3 text-right font-mono"
                        {...form.register('tax', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Discount (IDR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        Rp
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-11 pl-10 pr-3 text-right font-mono"
                        {...form.register('discount', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">IDR {formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-mono">+ IDR {formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-mono text-red-600">- IDR {formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-primary/20 pt-2 mt-2">
                    <span>Total</span>
                    <span className="font-mono text-primary">IDR {formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 px-6"
              >
                Batal
              </Button>
              <Button
                type="submit"
                form="invoice-form"
                disabled={isSubmitting}
                className="h-10 px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Menyimpan...' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
