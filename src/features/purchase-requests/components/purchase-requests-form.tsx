/**
 * Purchase Requests Form Component
 * Full page form with dynamic line items
 */
import {useEffect, useState, useCallback} from 'react'
import {useNavigate, useParams} from '@tanstack/react-router'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {toast} from 'sonner'
import {ArrowLeft, Plus, Trash2, Save, Send} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Skeleton} from '@/components/ui/skeleton'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {usePurchaseRequestsStore} from '@/features/purchase-requests'
import {purchaseRequestsApi} from '../api/purchase-requests-api'

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
    notes: z.string().min(1, 'Notes wajib diisi').max(1000, 'Notes maksimal 1000 karakter'),
})

type FormValues = z.infer<typeof formSchema>

// Status badge component
function StatusBadge({status}: { status: string }) {
    const config: Record<string, { label: string; class: string }> = {
        draft: {label: 'Draft', class: 'bg-gray-100 text-gray-800'},
        pending: {label: 'Pending', class: 'bg-yellow-100 text-yellow-800'},
        approved: {label: 'Approved', class: 'bg-green-100 text-green-800'},
        rejected: {label: 'Rejected', class: 'bg-red-100 text-red-800'},
    }
    const {label, class: className} = config[status] || config.draft

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
    )
}

export function PurchaseRequestsForm() {
    const navigate = useNavigate()
    const params = useParams({strict: false}) as { id?: string }
    const {
        fetchById,
        create,
        update,
        submitForApproval,
        selectedItem,
        isSubmitting,
        isLoading,
        resetForm
    } = usePurchaseRequestsStore()

    const isEdit = !!params.id
    const [initialized, setInitialized] = useState(false)
    const [lineItems, setLineItems] = useState<LineItem[]>([
        {id: '1', product_id: 0, product_name: '', qty: 0, total: 0}
    ])
    const [selectedProducts, setSelectedProducts] = useState<Record<string, SelectOption | null>>({})

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            supplier: '',
            notes: '',
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
    }, [isEdit, params.id, fetchById, resetForm])

    // Populate form when selectedItem is loaded
    useEffect(() => {
        if (selectedItem && isEdit && !initialized) {
            form.reset({
                date: selectedItem.date.split('T')[0],
                supplier: selectedItem.supplier ?? '',
                notes: selectedItem.notes ?? '',
            })
            const newLineItems = selectedItem.details.map((d, i) => ({
                id: String(i + 1),
                product_id: d.product_id,
                product_name: d.product_name ?? '',
                qty: d.qty,
                total: d.total,
            }))
            setLineItems(newLineItems)
            const newSelectedProducts: Record<string, SelectOption | null> = {}
            newLineItems.forEach((item) => {
                if (item.product_id > 0) {
                    newSelectedProducts[item.id] = {value: item.product_id, label: item.product_name || ''}
                }
            })
            setSelectedProducts(newSelectedProducts)
            setInitialized(true)
        }
    }, [selectedItem, isEdit, initialized, form])

    const handleBack = () => {
        navigate({to: '/purchase-requests'})
    }

    const handleSubmitForApproval = async () => {
        if (!params.id) return

        try {
            await submitForApproval(Number(params.id))
            toast.success('Purchase request submitted for approval')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit for approval'
            toast.error(message)
        }
    }



    // Load products for dropdown
    const loadProducts = useCallback(async (search: string): Promise<SelectOption[]> => {
        try {
            const response = await purchaseRequestsApi.getProductsSelectOptions({q: search})
            return response.data.map((p) => ({
                value: p.id,
                label: p.name,
            }))
        } catch {
            return []
        }
    }, [])

    // Skeleton loading state
    if (isLoading && isEdit) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Skeleton className="h-4 w-48 mb-4"/>
                    <Skeleton className="h-8 w-64"/>
                    <Skeleton className="h-4 w-48 mt-2"/>
                </div>
                <div className="bg-card rounded-lg border p-6 space-y-4 mb-6">
                    <Skeleton className="h-6 w-40"/>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                    </div>
                </div>
                <div className="bg-card rounded-lg border p-6 space-y-4">
                    <Skeleton className="h-6 w-32"/>
                    <div className="space-y-3">
                        {Array.from({length: 5}).map((_, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2">
                                <Skeleton className="col-span-5 h-10"/>
                                <Skeleton className="col-span-2 h-10"/>
                                <Skeleton className="col-span-3 h-10"/>
                                <Skeleton className="col-span-2 h-10"/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const handleAddLine = () => {
        const newId = String(Date.now())
        setLineItems([
            ...lineItems,
            {id: newId, product_id: 0, product_name: '', qty: 0, total: 0}
        ])
        setSelectedProducts({...selectedProducts, [newId]: null})
    }

    const handleRemoveLine = (index: number) => {
        if (lineItems.length > 1) {
            const itemToRemove = lineItems[index]
            const newItems = lineItems.filter((_, i) => i !== index)
            setLineItems(newItems)
            const newSelected = {...selectedProducts}
            delete newSelected[itemToRemove.id]
            setSelectedProducts(newSelected)
        }
    }


    // Handle product selection
    const handleProductChange = (lineId: string, productId: number | null) => {
        setLineItems(lineItems.map((item) =>
            item.id === lineId ? {...item, product_id: productId ?? 0} : item
        ))
        if (!productId) {
            setSelectedProducts({...selectedProducts, [lineId]: null})
        }
    }

    // Calculate grand total
    const grandTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)

    const onSubmit = async (values: FormValues) => {
        const validItems = lineItems.filter(item => item.product_id > 0)
        if (validItems.length === 0) {
            toast.error('Minimal harus ada 1 item produk')
            return
        }

        try {
            const payload = {
                date: values.date,
                supplier: values.supplier || undefined,
                notes: values.notes,
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
            navigate({to: '/purchase-requests'})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save purchase request'
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
                    <ArrowLeft className="h-4 w-4"/>
                    Kembali ke Purchase Requests
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">
                            {isEdit ? 'Edit Purchase Request' : 'New Purchase Request'}
                        </h2>
                        <p className="text-muted-foreground">
                            {isEdit ? 'Edit data purchase request' : 'Tambah purchase request baru'}
                        </p>
                    </div>
                    {isEdit && currentStatus && (
                        <StatusBadge status={currentStatus}/>
                    )}
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
                            <Input
                                type="date"
                                {...form.register('date')}
                                disabled={!canEdit}
                            />
                            {form.formState.errors.date && (
                                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Supplier</label>
                            <Input
                                {...form.register('supplier')}
                                placeholder="Masukkan nama supplier (opsional)"
                                disabled={!canEdit}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes *</label>
                        <textarea
                            {...form.register('notes')}
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Masukkan catatan purchase request..."
                            rows={3}
                            disabled={!canEdit}
                        />
                        {form.formState.errors.notes && (
                            <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-card rounded-lg border p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Item Produk</h3>
                        {canEdit && (
                            <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                                <Plus className="h-4 w-4 mr-1"/>
                                Tambah Item
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-1">
                        <div className="col-span-5">Produk</div>
                        <div className="col-span-2">Qty</div>
                        <div className="col-span-3">Total</div>
                        <div className="col-span-2"></div>
                    </div>

                    <div className="space-y-3">
                        {lineItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-5">
                                    <AsyncSelect
                                        value={selectedProducts[item.id]?.value ?? null}
                                        onChange={(val) => {
                                            const numVal = typeof val === 'string' ? parseInt(val, 10) || null : val
                                            const selected = numVal ? {
                                                value: numVal,
                                                label: selectedProducts[item.id]?.label || ''
                                            } : null
                                            setSelectedProducts({...selectedProducts, [item.id]: selected})
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
                                        value={item.qty}
                                        onChange={(e) => {
                                            const qty = parseFloat(e.target.value) || 0
                                            setLineItems(lineItems.map((it, i) =>
                                                i === index ? {...it, qty} : it
                                            ))
                                        }}
                                        placeholder="0"
                                        disabled={!canEdit}
                                    />
                                </div>

                                <div className="col-span-3">
                                    <Input
                                        type="number"
                                        min={0}
                                        value={item.total}
                                        onChange={(e) => {
                                            const total = parseFloat(e.target.value) || 0
                                            setLineItems(lineItems.map((it, i) =>
                                                i === index ? {...it, total} : it
                                            ))
                                        }}
                                        placeholder="0"
                                        disabled={!canEdit}
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
                                            <Trash2 className="h-4 w-4"/>
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

                {/* Submit */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        {!canEdit && currentStatus === 'approved' && (
                            <span className="text-green-600 font-medium">Purchase request ini sudah disetujui dan tidak dapat diedit.</span>
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
                                <Send className="h-4 w-4 mr-1"/>
                                {isSubmitting ? 'Mengirim...' : 'Ajukan Approval'}
                            </Button>
                        )}
                        {canEdit && (
                            <Button type="submit" disabled={isSubmitting || isLoading}>
                                <Save className="h-4 w-4 mr-1"/>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
