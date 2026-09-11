/**
 * Invoice Detail Modal Component
 * Read-only view of invoice with line items
 */
import {useEffect} from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {useInvoicesStore} from '@/features/invoices'
import type {Invoice} from '@/features/invoices'
import {FileText, Calendar, User, Clock, DollarSign} from 'lucide-react'

interface InvoiceDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice: Invoice | null
}

export function InvoiceDetailModal({open, onOpenChange, invoice}: InvoiceDetailModalProps) {
    const {selectedItem, fetchById, isLoading} = useInvoicesStore()

    useEffect(() => {
        if (open && invoice) {
            fetchById(invoice.id)
        }
    }, [open, invoice, fetchById])

    // Format currency
    const formatCurrency = (value: number | null) => {
        if (value === null) return '-'
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value)
    }

    // Format date
    const formatDate = (date: string | null) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }

    if (!invoice) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[900px] max-w-[95vw]"
                style={{width: '900px', maxWidth: '95vw'}}
            >
                {/* Header */}
                <DialogHeader className="px-6 py-5 border-b bg-muted/30 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary-foreground"/>
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{invoice.invoice_number}</DialogTitle>
                                <DialogDescription>
                                    Invoice Details
                                </DialogDescription>
                            </div>
                        </div>
                        {selectedItem && (
                            <span
                                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                                    selectedItem.status === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                {selectedItem.status === 'paid' ? 'PAID' : 'UNPAID'}
              </span>
                        )}
                    </div>
                </DialogHeader>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div
                                className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin"/>
                        </div>
                    ) : selectedItem ? (
                        <div className="space-y-6">
                            {/* Header Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <User className="h-4 w-4"/>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Client</span>
                                    </div>
                                    <p className="font-semibold text-lg text-foreground">{selectedItem.client_name ?? '-'}</p>
                                </div>

                                <div className="rounded-xl border p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <Calendar className="h-4 w-4"/>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Period</span>
                                    </div>
                                    <p className="font-semibold text-lg text-foreground">{selectedItem.period ?? '-'}</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <Clock className="h-4 w-4"/>
                                        <span
                                            className="text-xs font-semibold uppercase tracking-wider">Issue Date</span>
                                    </div>
                                    <p className="font-semibold text-foreground">{formatDate(selectedItem.issue_date)}</p>
                                </div>

                                <div className="rounded-xl border p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <Clock className="h-4 w-4"/>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Due Date</span>
                                    </div>
                                    <p className="font-semibold text-foreground">{formatDate(selectedItem.due_date)}</p>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="rounded-xl border overflow-hidden">
                                <div className="px-5 py-4 bg-muted/50 border-b">
                                    <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subtotal</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {selectedItem.items && selectedItem.items.length > 0 ? (
                                            selectedItem.items.map((item, index) => (
                                                <tr key={item.id || index} className="border-b last:border-b-0">
                                                    <td className="px-5 py-4 text-foreground">{item.description}</td>
                                                    <td className="px-5 py-4 text-right font-mono">{item.qty}</td>
                                                    <td className="px-5 py-4 text-right font-mono">{formatCurrency(item.price)}</td>
                                                    <td className="px-5 py-4 text-right font-mono font-medium">{formatCurrency(item.subtotal)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4}
                                                    className="px-5 py-12 text-center text-muted-foreground">
                                                    No items found
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary & Notes */}
                            <div className="grid grid-cols-5 gap-6">
                                {/* Notes */}
                                {selectedItem.notes && (
                                    <div className="col-span-2 rounded-xl border p-5">
                                        <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedItem.notes}</p>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className={selectedItem.notes ? 'col-span-3' : 'col-span-5'}>
                                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-mono">{formatCurrency(selectedItem.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span className="font-mono">+ {formatCurrency(selectedItem.tax)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Discount</span>
                                            <span className="font-mono text-red-600">
                        {selectedItem.discount > 0 ? '- ' : ''}{formatCurrency(selectedItem.discount)}
                      </span>
                                        </div>
                                        <div
                                            className="flex justify-between text-lg font-bold border-t border-primary/20 pt-3 mt-3">
                                            <span>Total</span>
                                            <span
                                                className="font-mono text-primary">{formatCurrency(selectedItem.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            {selectedItem.paid_at && (
                                <div className="rounded-xl bg-green-50 border border-green-200 p-5">
                                    <div className="flex items-center gap-3 text-green-800">
                                        <DollarSign className="h-5 w-5"/>
                                        <span
                                            className="font-semibold">Paid on {formatDate(selectedItem.paid_at)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            No details available
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
