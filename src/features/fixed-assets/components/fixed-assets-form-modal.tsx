"use client"
import {useEffect, useState, useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {CurrencyInput} from '@/components/ui/currency-input';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {AsyncSelect} from '@/components/async-select'
import {apiClient} from '@/lib/api-client'
import {useFixedAssetsStore, type FixedAsset, type FixedAssetFormData} from '@/features/fixed-assets'
import {Info} from 'lucide-react'

interface FixedAssetFormModalProps {
    open: boolean
    onClose: () => void
    editAsset?: FixedAsset | null
}

const DEPRECIATION_METHODS = [
    {
        value: 'straight-line',
        label: 'Garis Lurus (Straight Line)',
        description: 'Beban penyusutan sama rata setiap tahun. Cocok untuk aset yang fungsinya menurun karena waktu (bangunan, furnitur kantor).',
    },
    {
        value: 'declining-balance',
        label: 'Saldo Menurun (Declining Balance)',
        description: 'Beban penyusutan besar di awal, terus menurun drastis. Cocok untuk aset yang cepat turun nilai/teknologi (komputer, kendaraan).',
    },
    {
        value: 'sum-of-years',
        label: 'Jumlah Angka Tahun (Sum of Years)',
        description: 'Mirip saldo menurun, beban penyusutan menurun setiap tahun berdasarkan pecahan sisa umur ekonomis.',
    },
]

export function FixedAssetFormModal({open, onClose, editAsset}: FixedAssetFormModalProps) {
    const {createAsset, updateAsset, isSubmitting} = useFixedAssetsStore()
    const {fetchCategories} = useFixedAssetsStore()

    const [formData, setFormData] = useState<FixedAssetFormData>({
        code: '',
        name: '',
        category: '',
        tangible_asset_class_id: undefined,
        acquisition_date: '',
        quantity: 1,
        unit_price: 0,
        depreciation_method: 'straight-line',
        asset_account_id: 0,
        accumulated_depreciation_account_id: 0,
        depreciation_expense_account_id: 0,
        salvage_value: 0,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (editAsset) {
                setFormData({
                    code: editAsset.code,
                    name: editAsset.name,
                    category: editAsset.category,
                    tangible_asset_class_id: editAsset.tangible_asset_class_id || undefined,
                    location: editAsset.location || '',
                    serial_number: editAsset.serial_number || '',
                    description: editAsset.description || '',
                    acquisition_date: editAsset.acquisition_date.split('T')[0],
                    quantity: editAsset.quantity,
                    unit_price: editAsset.unit_price,
                    depreciation_method: editAsset.depreciation_method as FixedAssetFormData['depreciation_method'],
                    asset_account_id: editAsset.asset_account_id,
                    accumulated_depreciation_account_id: editAsset.accumulated_depreciation_account_id,
                    depreciation_expense_account_id: editAsset.depreciation_expense_account_id,
                    salvage_value: editAsset.salvage_value,
                })
            } else {
                setFormData({
                    code: '',
                    name: '',
                    category: '',
                    tangible_asset_class_id: undefined,
                    acquisition_date: new Date().toISOString().split('T')[0],
                    quantity: 1,
                    unit_price: 0,
                    depreciation_method: 'straight-line',
                    asset_account_id: 0,
                    accumulated_depreciation_account_id: 0,
                    depreciation_expense_account_id: 0,
                    salvage_value: 0,
                })
            }
            setErrors({})
        }
    }, [editAsset, open])

    const handleChange = (field: keyof FixedAssetFormData, value: any) => {
        setFormData(prev => ({...prev, [field]: value}))
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}))
        }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.code.trim()) newErrors.code = 'Kode harus diisi'
        if (!formData.name.trim()) newErrors.name = 'Nama harus diisi'
        if (!formData.category.trim()) newErrors.category = 'Kategori harus diisi'
        if (!formData.acquisition_date) newErrors.acquisition_date = 'Tanggal perolehan harus diisi'
        if (formData.quantity < 1) newErrors.quantity = 'Jumlah minimal 1'
        if (formData.unit_price <= 0) newErrors.unit_price = 'Harga satuan harus lebih dari 0'
        if (!formData.asset_account_id) newErrors.asset_account_id = 'Akun aset harus dipilih'
        if (!formData.accumulated_depreciation_account_id) newErrors.accumulated_depreciation_account_id = 'Akun akumulasi penyusutan harus dipilih'
        if (!formData.depreciation_expense_account_id) newErrors.depreciation_expense_account_id = 'Akun beban penyusutan harus dipilih'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        try {
            if (editAsset) {
                await updateAsset(editAsset.id, formData)
            } else {
                await createAsset(formData)
            }
            onClose()
        } catch (e) {
            // Error handled by store
        }
    }

    // Account options loaders with specific API endpoints
    const loadAssetAccountOptions = useCallback(async (search: string): Promise<any[]> => {
        try {
            const {data} = await apiClient.get('/admin/fixed-assets/accounts/asset')
            const accounts = data.data || []

            // Apply search filter
            const searched = accounts.filter((acc: any) =>
                acc.name.toLowerCase().includes(search.toLowerCase()) ||
                acc.code.toLowerCase().includes(search.toLowerCase())
            )

            return searched.map((acc: any) => ({
                value: acc.id,
                label: `${acc.code} - ${acc.name}`,
                description: acc.description || undefined,
            }))
        } catch {
            return []
        }
    }, [])

    const loadAccumulatedDepreciationOptions = useCallback(async (search: string): Promise<any[]> => {
        try {
            const {data} = await apiClient.get('/admin/fixed-assets/accounts/accumulated-depreciation')
            const accounts = data.data || []

            // Apply search filter
            const searched = accounts.filter((acc: any) =>
                acc.name.toLowerCase().includes(search.toLowerCase()) ||
                acc.code.toLowerCase().includes(search.toLowerCase())
            )

            return searched.map((acc: any) => ({
                value: acc.id,
                label: `${acc.code} - ${acc.name}`,
                description: acc.description || undefined,
            }))
        } catch {
            return []
        }
    }, [])

    const loadDepreciationExpenseOptions = useCallback(async (search: string): Promise<any[]> => {
        try {
            const {data} = await apiClient.get('/admin/fixed-assets/accounts/depreciation-expense')
            const accounts = data.data || []

            // Apply search filter
            const searched = accounts.filter((acc: any) =>
                acc.name.toLowerCase().includes(search.toLowerCase()) ||
                acc.code.toLowerCase().includes(search.toLowerCase())
            )

            return searched.map((acc: any) => ({
                value: acc.id,
                label: `${acc.code} - ${acc.name}`,
                description: acc.description || undefined,
            }))
        } catch {
            return []
        }
    }, [])

    // Category suggestions
    const categorySuggestions = [
        'Kendaraan',
        'Peralatan Kantor',
        'Komputer & Elektronik',
        'Furniture & Fixture',
        'Mesin & Peralatan',
        'Bangunan',
        'Tanah',
        'Lainnya',
    ]

    // Tangible Asset Class loader
    const loadTangibleAssetClassOptions = useCallback(async (search: string): Promise<any[]> => {
        try {
            const {data} = await apiClient.get('/admin/tangible-asset-class/select-options', {
                params: { q: search }
            })
            const classes = data.data || []

            return classes.map((cls: any) => ({
                value: cls.id,
                label: `${cls.name} - ${cls.useful_life} bulan`,
                description: cls.notes || undefined,
            }))
        } catch {
            return []
        }
    }, [])

    const filteredCategories = formData.category
        ? categorySuggestions.filter(c => c.toLowerCase().includes(formData.category.toLowerCase()))
        : categorySuggestions

    const isEditMode = !!editAsset

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"
                           style={{width: '900px', maxWidth: '95vw'}}
            >
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Aktiva Tetap' : 'Tambah Aktiva Tetap'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Edit informasi aktiva tetap' : 'Tambah aktiva tetap baru ke dalam sistem'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Row 1: Code & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Kode Aset *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={e => handleChange('code', e.target.value)}
                                placeholder="Contoh: AST-001"
                                disabled={isEditMode}
                            />
                            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Kategori *</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={e => handleChange('category', e.target.value)}
                                placeholder="Contoh: Kendaraan"
                                list="category-suggestions"
                            />
                            <datalist id="category-suggestions">
                                {filteredCategories.map(cat => (
                                    <option key={cat} value={cat}/>
                                ))}
                            </datalist>
                            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Aset *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="Nama lengkap aset"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Tangible Asset Class */}
                    <div className="space-y-2">
                        <Label>Kelas Aktiva (Opsional)</Label>
                        <AsyncSelect
                            value={formData.tangible_asset_class_id}
                            onChange={(value) => handleChange('tangible_asset_class_id', value || undefined)}
                            loadOptions={loadTangibleAssetClassOptions}
                            placeholder="Pilih kelas aktiva..."
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Pilih kelas aktiva untuk mengisi umur manfaat otomatis
                        </p>
                    </div>

                    {/* Row 2: Location & Serial Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Lokasi</Label>
                            <Input
                                id="location"
                                value={formData.location || ''}
                                onChange={e => handleChange('location', e.target.value)}
                                placeholder="Lokasi aset"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serial_number">Nomor Seri</Label>
                            <Input
                                id="serial_number"
                                value={formData.serial_number || ''}
                                onChange={e => handleChange('serial_number', e.target.value)}
                                placeholder="Nomor seri/registrasi"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Input
                            id="description"
                            value={formData.description || ''}
                            onChange={e => handleChange('description', e.target.value)}
                            placeholder="Deskripsi aset"
                        />
                    </div>

                    {/* Row 3: Acquisition Date & Quantity & Unit Price */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="acquisition_date">Tgl. Perolehan *</Label>
                            <Input
                                id="acquisition_date"
                                type="date"
                                value={formData.acquisition_date}
                                onChange={e => handleChange('acquisition_date', e.target.value)}
                            />
                            {errors.acquisition_date &&
                                <p className="text-xs text-red-500">{errors.acquisition_date}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Jumlah *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                value={formData.quantity}
                                onChange={e => handleChange('quantity', parseInt(e.target.value) || 1)}
                            />
                            {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit_price">Harga Satuan *</Label>
                            <CurrencyInput
                                value={formData.unit_price}
                                onChange={(val) => handleChange('unit_price', val)}
                                disabled={isEditMode}
                            />
                            {errors.unit_price && <p className="text-xs text-red-500">{errors.unit_price}</p>}
                        </div>
                    </div>

                    {/* Row 4: Depreciation Method & Salvage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor="depreciation_method">Metode Penyusutan *</Label>
                                <div className="group relative">
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-80 p-3 bg-popover border rounded-lg shadow-lg text-xs text-popover-foreground z-50">
                                        <p className="font-medium mb-2">Metode Penyusutan:</p>
                                        <ol className="text-muted-foreground space-y-2 list-decimal list-inside">
                                            <li>
                                                <span className="font-medium">Garis Lurus:</span> Beban sama rata setiap tahun. Cocok untuk aset yang fungsinya menurun karena waktu (bangunan, furnitur).
                                            </li>
                                            <li>
                                                <span className="font-medium">Saldo Menurun:</span> Beban besar di awal, terus menurun drastis. Cocok untuk aset yang cepat turun nilai/teknologi (komputer, kendaraan).
                                            </li>
                                            <li>
                                                <span className="font-medium">Jumlah Angka Tahun:</span> Mirip saldo menurun, beban menurun berdasarkan pecahan sisa umur ekonomis.
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <AsyncSelect
                                value={formData.depreciation_method}
                                onChange={(value) => handleChange('depreciation_method', value)}
                                loadOptions={async () => DEPRECIATION_METHODS}
                                placeholder="Pilih metode..."
                                className="w-full"
                            />
                            {errors.depreciation_method &&
                                <p className="text-xs text-red-500">{errors.depreciation_method}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor="salvage_value">Nilai Sisa</Label>
                                <div className="group relative">
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-popover border rounded-lg shadow-lg text-xs text-popover-foreground z-50">
                                        <p className="font-medium mb-2">Apa itu Nilai Sisa?</p>
                                        <p className="text-muted-foreground mb-2">
                                            Nilai sisa adalah estimasi nilai aset ketika masa pakainya sudah habis.
                                        </p>
                                        <p className="font-medium mb-1">Tambahkan nilai sisa jika:</p>
                                        <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                                            <li>Aset diyakini masih laku dijual dengan harga tinggi setelah masa pakainya habis (contoh: mobil operasional, truk, atau gedung bangunan).</li>
                                            <li>Aset memiliki material yang tetap bernilai meskipun fungsinya sudah hilang (contoh: mesin pabrik berat yang besi tuangnya masih bisa dijual kiloan sebagai besi tua).</li>
                                        </ol>
                                        <p className="text-muted-foreground mt-2">Jika tidak yakin, biarkan kosong (akan dianggap 0).</p>
                                    </div>
                                </div>
                            </div>
                            <CurrencyInput
                                value={formData.salvage_value || 0}
                                onChange={(val) => handleChange('salvage_value', val)}
                            />
                        </div>
                    </div>

                    {/* Accounts Section */}
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-4">Akun Akuntansi</h4>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Akun Aset *</Label>
                                <AsyncSelect
                                    value={formData.asset_account_id}
                                    onChange={(value) => handleChange('asset_account_id', value)}
                                    loadOptions={loadAssetAccountOptions}
                                    placeholder="Pilih akun aset..."
                                    className="w-full"
                                />
                                {errors.asset_account_id &&
                                    <p className="text-xs text-red-500">{errors.asset_account_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Akun Akumulasi Penyusutan *</Label>
                                <AsyncSelect
                                    value={formData.accumulated_depreciation_account_id}
                                    onChange={(value) => handleChange('accumulated_depreciation_account_id', value)}
                                    loadOptions={loadAccumulatedDepreciationOptions}
                                    placeholder="Pilih akun akumulasi penyusutan..."
                                    className="w-full"
                                />
                                {errors.accumulated_depreciation_account_id && (
                                    <p className="text-xs text-red-500">{errors.accumulated_depreciation_account_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Akun Beban Penyusutan *</Label>
                                <AsyncSelect
                                    value={formData.depreciation_expense_account_id}
                                    onChange={(value) => handleChange('depreciation_expense_account_id', value)}
                                    loadOptions={loadDepreciationExpenseOptions}
                                    placeholder="Pilih akun beban penyusutan..."
                                    className="w-full"
                                />
                                {errors.depreciation_expense_account_id && (
                                    <p className="text-xs text-red-500">{errors.depreciation_expense_account_id}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
