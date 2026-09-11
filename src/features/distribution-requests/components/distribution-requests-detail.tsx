/**
 * Distribution Requests Detail Component
 * Detail view with delivery receipt form
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Send, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useDistributionRequestsStore } from '../store/distribution-requests-store'
import type { DistributionRequestStatus } from '../types/distribution-requests.types'

// Form schema for delivery
const deliveryFormSchema = z.object({
  delivery_receipt_number: z.string().min(1, 'No. Bukti Terima wajib diisi'),
  delivery_date: z.string().min(1, 'Tanggal terima wajib diisi'),
  recipient_name: z.string().optional(),
  delivery_notes: z.string().optional(),
})

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>

// Status badge component
function StatusBadge({ status }: { status: DistributionRequestStatus }) {
  const config: Record<DistributionRequestStatus, { label: string; class: string }> = {
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

// Detail status badge
function DetailStatusBadge({ status }: { status: number }) {
  const config: Record<number, { label: string; class: string }> = {
    1: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
    2: { label: 'Partial', class: 'bg-blue-100 text-blue-800' },
    3: { label: 'Full', class: 'bg-green-100 text-green-800' },
  }
  const { label, class: className } = config[status] || config[1]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date
function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function DistributionRequestsDetail() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id: string }
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    error,
    fetchById,
    submitForApproval,
    markAsDelivered,
    clearSelectedItem,
  } = useDistributionRequestsStore()

  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [deliveryDetails, setDeliveryDetails] = useState<
    Record<number, { id: number; qty_distributed: number }>
  >({})

  const deliveryForm = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      delivery_receipt_number: '',
      delivery_date: new Date().toISOString().split('T')[0],
      recipient_name: '',
      delivery_notes: '',
    },
  })

  // Fetch data
  useEffect(() => {
    if (params.id) {
      fetchById(Number(params.id))
    }
    return () => {
      clearSelectedItem()
    }
  }, [params.id, fetchById, clearSelectedItem])

  // Show error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Populate delivery form when showing
  useEffect(() => {
    if (selectedItem && showDeliveryForm) {
      deliveryForm.reset({
        delivery_receipt_number: selectedItem.delivery_receipt_number || '',
        delivery_date: selectedItem.delivery_date || new Date().toISOString().split('T')[0],
        recipient_name: selectedItem.recipient_name || '',
        delivery_notes: selectedItem.delivery_notes || '',
      })

      // Initialize delivery details
      const initialDetails: Record<number, { id: number; qty_distributed: number }> = {}
      selectedItem.details.forEach((detail) => {
        initialDetails[detail.id] = {
          id: detail.id,
          qty_distributed: detail.qty_distributed > 0 ? detail.qty_distributed : detail.qty,
        }
      })
      setDeliveryDetails(initialDetails)
    }
  }, [selectedItem, showDeliveryForm, deliveryForm])

  // Handle submit for approval
  const handleSubmitForApproval = async () => {
    if (!params.id) return

    try {
      await submitForApproval(Number(params.id))
      toast.success('Distribution request submitted for approval')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit'
      toast.error(message)
    }
  }

  // Handle deliver
  const handleDeliver = async (values: DeliveryFormValues) => {
    if (!params.id) return

    try {
      await markAsDelivered(Number(params.id), {
        delivery_receipt_number: values.delivery_receipt_number,
        delivery_date: values.delivery_date,
        recipient_name: values.recipient_name,
        delivery_notes: values.delivery_notes,
        details: Object.values(deliveryDetails).map((d) => ({
          id: d.id,
          qty_distributed: d.qty_distributed,
        })),
      })
      toast.success('Delivery receipt saved successfully')
      setShowDeliveryForm(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save delivery'
      toast.error(message)
    }
  }

  // Loading skeleton
  if (isLoading || !selectedItem) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48 mt-2" />
        <div className="bg-card rounded-lg border p-6 mt-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const canSubmit = selectedItem.can_submit
  const canDeliver = selectedItem.can_deliver && !selectedItem.delivery_receipt_number
  const alreadyDelivered = !!selectedItem.delivery_receipt_number

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: '/distribution-requests' })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Distribution Requests
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-mono">{selectedItem.code}</h2>
              <StatusBadge status={selectedItem.status} />
            </div>
            <p className="text-muted-foreground">
              Tanggal: {formatDate(selectedItem.date)}
            </p>
          </div>
          <div className="flex gap-2">
            {canSubmit && (
              <Button
                variant="outline"
                onClick={handleSubmitForApproval}
                disabled={isSubmitting}
                className="bg-blue-50 border-blue-200 hover:bg-blue-100"
              >
                <Send className="h-4 w-4 mr-2" />
                Ajukan Approval
              </Button>
            )}
            {canDeliver && !showDeliveryForm && (
              <Button
                onClick={() => setShowDeliveryForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Truck className="h-4 w-4 mr-2" />
                Input Delivery Receipt
              </Button>
            )}
            {alreadyDelivered && (
              <Button
                variant="outline"
                onClick={() => setShowDeliveryForm(true)}
                disabled={isSubmitting}
              >
                <Truck className="h-4 w-4 mr-2" />
                Edit Delivery Receipt
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Receipt Form */}
      {showDeliveryForm && (
        <div className="bg-card rounded-lg border p-6 space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Delivery Receipt</h3>
          <form onSubmit={deliveryForm.handleSubmit(handleDeliver)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. Bukti Terima *</label>
                <Input
                  {...deliveryForm.register('delivery_receipt_number')}
                  placeholder="Masukkan nomor bukti terima"
                />
                {deliveryForm.formState.errors.delivery_receipt_number && (
                  <p className="text-sm text-red-500">
                    {deliveryForm.formState.errors.delivery_receipt_number.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Terima *</label>
                <Input type="date" {...deliveryForm.register('delivery_date')} />
                {deliveryForm.formState.errors.delivery_date && (
                  <p className="text-sm text-red-500">
                    {deliveryForm.formState.errors.delivery_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Penerima</label>
              <Input
                {...deliveryForm.register('recipient_name')}
                placeholder="Masukkan nama penerima"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan Pengiriman</label>
              <textarea
                {...deliveryForm.register('delivery_notes')}
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Masukkan catatan..."
                rows={2}
              />
            </div>

            {/* Detail quantities */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Qty Didistribusi</label>
              <div className="border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-center">Diminta</th>
                      <th className="px-3 py-2 text-center">Sudah Kirim</th>
                      <th className="px-3 py-2 text-center">Qty Kirim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItem.details.map((detail) => (
                      <tr key={detail.id} className="border-t">
                        <td className="px-3 py-2">{detail.product_name}</td>
                        <td className="px-3 py-2 text-center">{detail.qty}</td>
                        <td className="px-3 py-2 text-center">{detail.qty_distributed}</td>
                        <td className="px-3 py-2 w-[100px]">
                          <Input
                            type="number"
                            min={0}
                            max={detail.qty}
                            step={0.01}
                            value={deliveryDetails[detail.id]?.qty_distributed ?? 0}
                            onChange={(e) => {
                              setDeliveryDetails((prev) => ({
                                ...prev,
                                [detail.id]: {
                                  ...prev[detail.id],
                                  qty_distributed: parseFloat(e.target.value) || 0,
                                },
                              }))
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeliveryForm(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Delivery Receipt'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Info (if already delivered) */}
      {alreadyDelivered && !showDeliveryForm && (
        <div className="bg-card rounded-lg border p-6 space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Delivery Receipt Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">No. Bukti Terima</p>
              <p className="font-medium">{selectedItem.delivery_receipt_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Terima</p>
              <p className="font-medium">{formatDate(selectedItem.delivery_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nama Penerima</p>
              <p className="font-medium">{selectedItem.recipient_name || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Catatan</p>
              <p className="font-medium">{selectedItem.delivery_notes || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Request Info */}
      <div className="bg-card rounded-lg border p-6 space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Informasi Request</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Gudang Sumber</p>
            <p className="font-medium">{selectedItem.warehouse_source_name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tipe Tujuan</p>
            <p className="font-medium capitalize">{selectedItem.destination_type || '-'}</p>
          </div>
          {selectedItem.client_name && (
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-medium">{selectedItem.client_name}</p>
            </div>
          )}
          {selectedItem.area_name && (
            <div>
              <p className="text-muted-foreground">Area</p>
              <p className="font-medium">{selectedItem.area_name}</p>
            </div>
          )}
          {selectedItem.warehouse_destination_name && (
            <div>
              <p className="text-muted-foreground">Gudang Tujuan</p>
              <p className="font-medium">{selectedItem.warehouse_destination_name}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Dibuat Oleh</p>
            <p className="font-medium">{selectedItem.creator?.name || '-'}</p>
          </div>
        </div>
        {selectedItem.notes && (
          <div>
            <p className="text-muted-foreground">Catatan</p>
            <p className="font-medium">{selectedItem.notes}</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">Item Produk</h3>
        <div className="border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Produk</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Sudah Kirim</th>
                <th className="px-3 py-2 text-right">Sisa</th>
                <th className="px-3 py-2 text-right">Unit Cost</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedItem.details.map((detail, index) => (
                <tr key={detail.id} className="border-t">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{detail.product_name}</p>
                    <p className="text-xs text-muted-foreground">{detail.product_code}</p>
                  </td>
                  <td className="px-3 py-2 text-right">{detail.qty}</td>
                  <td className="px-3 py-2 text-right">{detail.qty_distributed}</td>
                  <td className="px-3 py-2 text-right">{detail.remaining_qty}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(detail.unit_cost)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(detail.total)}</td>
                  <td className="px-3 py-2 text-center">
                    <DetailStatusBadge status={detail.status} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted border-t-2">
              <tr>
                <td colSpan={6} className="px-3 py-2 text-right font-medium">Total</td>
                <td className="px-3 py-2 text-right font-bold">
                  {formatCurrency(selectedItem.total)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
