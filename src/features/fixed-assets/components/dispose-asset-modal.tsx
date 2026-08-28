"use client"
import {useState, useCallback} from 'react'
import {AlertTriangle} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {CurrencyInput} from '@/components/ui/currency-input'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'
import {AsyncSelect} from '@/components/async-select'
import {useFixedAssetsStore, type DisposeFormData, type FixedAsset} from '@/features/fixed-assets'
import {apiClient} from '@/lib/api-client'

interface DisposeAssetModalProps {
    open: boolean
    onClose: () => void
    asset: FixedAsset
}

function formatCurrency(v: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(v)
}

export function DisposeAssetModal({open, onClose, asset}: DisposeAssetModalProps) {
    const {disposeAsset, isSubmitting} = useFixedAssetsStore()

    const [formData, setFormData] = useState<DisposeFormData>({
        disposal_date: new Date().toISOString().split('T')[0],
        disposal_proceeds: 0,
        disposal_notes: '',
        payment_account_id: undefined,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const gainLoss = formData.disposal_proceeds - asset.book_value

    const handleChange = (field: keyof DisposeFormData, value: any) => {
        setFormData(prev => ({...prev, [field]: value}))
        if (errors[field as string]) {
            setErrors(prev => ({...prev, [field]: ''}))
        }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.disposal_date) newErrors.disposal_date = 'Tanggal pelepasan harus diisi'
        if (formData.disposal_proceeds < 0) newErrors.disposal_proceeds = 'Hasil penjualan tidak boleh negatif'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        try {
            await disposeAsset(asset.id, formData)
            onClose()
        } catch (e) {
            // Error handled by store
        }
    }

    // Load cash/bank accounts (code 111-112)
    const loadPaymentAccounts = useCallback(async (search: string): Promise<any[]> => {
        try {
            const params = new URLSearchParams()
            params.set('per_page', '200')
            params.set('is_header', 'false')

            const {data} = await apiClient.get(`/admin/accounts?${params}`)
            const accounts = data.data?.data || data.data || []

            // Filter: Cash/Bank accounts (code 111-112)
            const filtered = accounts.filter((acc: any) => {
                const code = acc.code || ''
                const codeNum = parseInt(code.replace(/[^0-9]/g, '').substring(0, 3))
                return codeNum >= 111 && codeNum <= 112
            })

            const searched = filtered.filter((acc: any) =>
                acc.name.toLowerCase().includes(search.toLowerCase()) ||
                acc.code.toLowerCase().includes(search.toLowerCase())
            )

            return searched.map((acc: any) => ({
                value: acc.id,
                label: `${acc.code} - ${acc.name}`,
            }))
        } catch {
            return []
        }
    }, [])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Pelepasan Aktiva Tetap</DialogTitle>
                    <DialogDescription>
                        {asset.name} ({asset.code})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Asset Info */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Harga Perolehan:</span>
                            <span className="font-mono">{formatCurrency(asset.acquisition_cost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Akumulasi Penyusutan:</span>
                            <span
                                className="font-mono text-orange-600">({formatCurrency(asset.accumulated_depreciation)})</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                            <span>Nilai Buku:</span>
                            <span className="font-mono">{formatCurrency(asset.book_value)}</span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"/>
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium">Peringatan!</p>
                            <p>Pelepasan aset tidak dapat dibatalkan. Jurnal pelepasan akan dibuat secara otomatis.</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="disposal_date">Tanggal Pelepasan *</Label>
                            <Input
                                id="disposal_date"
                                type="date"
                                value={formData.disposal_date}
                                onChange={e => handleChange('disposal_date', e.target.value)}
                            />
                            {errors.disposal_date && <p className="text-xs text-red-500">{errors.disposal_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Akun Kas/Bank *</Label>
                            <AsyncSelect
                                value={formData.payment_account_id}
                                onChange={(value) => handleChange('payment_account_id', value)}
                                loadOptions={loadPaymentAccounts}
                                placeholder="Pilih akun kas/bank..."
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="disposal_proceeds">Hasil Penjualan (Rp) *</Label>
                            <CurrencyInput
                                value={formData.disposal_proceeds}
                                onChange={(val) => handleChange('disposal_proceeds', val)}
                            />
                            {errors.disposal_proceeds &&
                                <p className="text-xs text-red-500">{errors.disposal_proceeds}</p>}
                        </div>

                        {/* Gain/loss Preview */}
                        <div
                            className={`p-3 rounded-lg ${gainLoss >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex justify-between text-sm">
                <span className={gainLoss >= 0 ? 'text-green-700' : 'text-red-700'}>
                  {gainLoss >= 0 ? 'Keuntungan' : 'Kerugian'} Pelepasan:
                </span>
                                <span
                                    className={`font-mono font-semibold ${gainLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(Math.abs(gainLoss))}
                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="disposal_notes">Keterangan</Label>
                            <Input
                                id="disposal_notes"
                                value={formData.disposal_notes || ''}
                                onChange={e => handleChange('disposal_notes', e.target.value)}
                                placeholder="Catatan pelepasan..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Memproses...' : 'Lepaskan Aset'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
