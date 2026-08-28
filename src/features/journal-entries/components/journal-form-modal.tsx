"use client"
import {useEffect, useState, useCallback, useMemo} from 'react'
import {Plus, Trash2, AlertCircle, ArrowRight} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription} from '@/components/ui/dialog'
import {JournalAccountSelect, type SelectOption} from './journal-account-select'
import {apiClient} from '@/lib/api-client'
import {useJournalStore, type JournalEntry, type JournalEntryFormData} from '../store/journal-store'

interface JournalLineForm {
    account_id: number | null
    amount: string
}

interface JournalFormModalProps {
    open: boolean
    onClose: () => void
    editEntry?: JournalEntry | null
}

export function JournalFormModal({open, onClose, editEntry}: JournalFormModalProps) {
    const {createEntry, updateEntry, isSubmitting} = useJournalStore()

    const [date, setDate] = useState('')
    const [reference, setReference] = useState('')
    const [description, setDescription] = useState('')
    const [debitLines, setDebitLines] = useState<JournalLineForm[]>([
        {account_id: null, amount: ''},
    ])
    const [creditLines, setCreditLines] = useState<JournalLineForm[]>([
        {account_id: null, amount: ''},
    ])
    const [errors, setErrors] = useState<Record<string, string>>({})

    const isEditMode = !!editEntry

    // Get selected account IDs from each side (for validation)
    const selectedDebitIds = useMemo(() => {
        return new Set(debitLines.map(l => l.account_id).filter(Boolean))
    }, [debitLines])

    const selectedCreditIds = useMemo(() => {
        return new Set(creditLines.map(l => l.account_id).filter(Boolean))
    }, [creditLines])

    // Check for same account on both sides
    const sameAccountError = useMemo(() => {
        for (const id of selectedDebitIds) {
            if (selectedCreditIds.has(id)) {
                return `Akun tidak boleh muncul di kedua sisi (Debit & Kredit)`
            }
        }
        return null
    }, [selectedDebitIds, selectedCreditIds])

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (editEntry) {
                setDate(editEntry.date.split('T')[0])
                setReference(editEntry.reference || '')
                setDescription(editEntry.description)

                const debits = editEntry.lines.filter(l => l.debit > 0).map(l => ({
                    account_id: l.account_id,
                    amount: String(l.debit),
                }))
                const credits = editEntry.lines.filter(l => l.credit > 0).map(l => ({
                    account_id: l.account_id,
                    amount: String(l.credit),
                }))

                setDebitLines(debits.length > 0 ? debits : [{account_id: null, amount: ''}])
                setCreditLines(credits.length > 0 ? credits : [{account_id: null, amount: ''}])
            } else {
                setDate(new Date().toISOString().split('T')[0])
                setReference('')
                setDescription('')
                setDebitLines([{account_id: null, amount: ''}])
                setCreditLines([{account_id: null, amount: ''}])
            }
            setErrors({})
        }
    }, [editEntry, open])

    // Debit lines handlers
    const addDebitLine = () => {
        setDebitLines([...debitLines, {account_id: null, amount: ''}])
    }

    const removeDebitLine = (index: number) => {
        if (debitLines.length > 1) {
            setDebitLines(debitLines.filter((_, i) => i !== index))
        }
    }

    const updateDebitAccount = useCallback((index: number, value: number | string | null) => {
        setDebitLines(prev => prev.map((line, i) =>
            i === index ? {...line, account_id: value as number | null} : line
        ))
    }, [])

    const updateDebitAmount = useCallback((index: number, value: string) => {
        const cleaned = value.replace(/[^0-9.]/g, '')
        const parts = cleaned.split('.')
        const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned
        setDebitLines(prev => prev.map((line, i) =>
            i === index ? {...line, amount: formatted} : line
        ))
    }, [])

    // Credit lines handlers
    const addCreditLine = () => {
        setCreditLines([...creditLines, {account_id: null, amount: ''}])
    }

    const removeCreditLine = (index: number) => {
        if (creditLines.length > 1) {
            setCreditLines(creditLines.filter((_, i) => i !== index))
        }
    }

    const updateCreditAccount = useCallback((index: number, value: number | string | null) => {
        setCreditLines(prev => prev.map((line, i) =>
            i === index ? {...line, account_id: value as number | null} : line
        ))
    }, [])

    const updateCreditAmount = useCallback((index: number, value: string) => {
        const cleaned = value.replace(/[^0-9.]/g, '')
        const parts = cleaned.split('.')
        const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned
        setCreditLines(prev => prev.map((line, i) =>
            i === index ? {...line, amount: formatted} : line
        ))
    }, [])

    // Calculate totals
    const totalDebit = debitLines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)
    const totalCredit = creditLines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!date) newErrors.date = 'Tanggal harus diisi'
        if (!description.trim()) newErrors.description = 'Keterangan harus diisi'

        const validDebits = debitLines.filter(l => l.account_id && parseFloat(l.amount) > 0)
        const validCredits = creditLines.filter(l => l.account_id && parseFloat(l.amount) > 0)

        if (validDebits.length === 0) newErrors.debit = 'Minimal 1 akun di Debit'
        if (validCredits.length === 0) newErrors.credit = 'Minimal 1 akun di Kredit'
        if (!isBalanced) newErrors.balance = 'Total Debit harus sama dengan Kredit'
        if (sameAccountError) newErrors.sameAccount = sameAccountError

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        const lines: { account_id: number; debit: number; credit: number }[] = []

        debitLines
            .filter(l => l.account_id && parseFloat(l.amount) > 0)
            .forEach(l => {
                lines.push({
                    account_id: l.account_id!,
                    debit: parseFloat(l.amount) || 0,
                    credit: 0,
                })
            })

        creditLines
            .filter(l => l.account_id && parseFloat(l.amount) > 0)
            .forEach(l => {
                lines.push({
                    account_id: l.account_id!,
                    debit: 0,
                    credit: parseFloat(l.amount) || 0,
                })
            })

        const formData: JournalEntryFormData = {
            date,
            reference: reference || undefined,
            description,
            lines,
        }

        try {
            if (isEditMode && editEntry) {
                await updateEntry(editEntry.id, formData)
            } else {
                await createEntry(formData)
            }
            onClose()
        } catch (e) {
            // Error toast is handled by the store
            console.error('Failed to save:', e)
        }
    }

    // Load account options - include headers for tree structure
    const loadDebitAccountOptions = async (search: string): Promise<SelectOption[]> => {
        try {
            const params = new URLSearchParams()
            params.set('per_page', '100')
            if (search) params.set('search', search)

            const {data} = await apiClient.get(`/admin/accounts?${params}`)
            const accounts = data.data || []

            // Filter out accounts already selected in credit (except headers)
            const filtered = accounts.filter((acc: any) =>
                acc.is_header || !selectedCreditIds.has(acc.id)
            )

            return filtered.map((acc: any) => ({
                value: acc.id,
                label: `${acc.code} - ${acc.name}`,
                is_header: acc.is_header || false,
                parent_id: acc.parent_id || null,
                description: acc.description || undefined,
            }))
        } catch {
            return []
        }
    }

    const loadCreditAccountOptions = async (search: string): Promise<SelectOption[]> => {
        try {
            const params = new URLSearchParams()
            params.set('per_page', '100')
            if (search) params.set('search', search)

            const {data} = await apiClient.get(`/admin/accounts?${params}`)
            const accounts = data.data || []

            // Filter out accounts already selected in debit (except headers)
            const filtered = accounts.filter((acc: any) =>
                acc.is_header || !selectedDebitIds.has(acc.id)
            )

            return filtered.map((acc: any) => ({
                value: acc.id,
                label: `${acc.code} - ${acc.name}`,
                is_header: acc.is_header || false,
                parent_id: acc.parent_id || null,
                description: acc.description || undefined,
            }))
        } catch {
            return []
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"
                           style={{width: '900px', maxWidth: '95vw'}}>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Jurnal' : 'Tambah Jurnal'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Edit transaksi jurnal draft' : 'Buat transaksi jurnal baru'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Header */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Tanggal *</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Referensi</Label>
                            <Input
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                                placeholder="No. Bukti, dll"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Input value={isEditMode && editEntry ? editEntry.status : 'Draft'} disabled/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Keterangan *</Label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Deskripsi transaksi"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    {/* Double Entry - Split view */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                        {/* DEBIT Side */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-green-600 font-semibold">
                                    DEBIT
                                </Label>
                                <Button type="button" variant="outline" size="sm" onClick={addDebitLine}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Akun yang terpengaruh (+)
                            </p>

                            <div className="space-y-2">
                                {debitLines.map((line, index) => (
                                    <div key={`debit-${index}`} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <JournalAccountSelect
                                                value={line.account_id}
                                                onChange={(value) => updateDebitAccount(index, value)}
                                                loadOptions={loadDebitAccountOptions}
                                                placeholder="Pilih akun..."
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={line.amount}
                                                onChange={e => updateDebitAmount(index, e.target.value)}
                                                className="text-right font-mono"
                                                placeholder="0"
                                            />
                                        </div>
                                        {debitLines.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDebitLine(index)}
                                                className="text-green-500"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.debit && <p className="text-xs text-green-500">{errors.debit}</p>}

                            <div className="p-2 bg-green-50 rounded-md font-semibold text-green-600">
                                Total: {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            }).format(totalDebit)}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground"/>
                        </div>

                        {/* KREDIT Side */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-red-600 font-semibold">
                                    KREDIT
                                </Label>
                                <Button type="button" variant="outline" size="sm" onClick={addCreditLine}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Akun sumber / pengurang
                            </p>

                            <div className="space-y-2">
                                {creditLines.map((line, index) => (
                                    <div key={`credit-${index}`} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <JournalAccountSelect
                                                value={line.account_id}
                                                onChange={(value) => updateCreditAccount(index, value)}
                                                loadOptions={loadCreditAccountOptions}
                                                placeholder="Pilih akun..."
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={line.amount}
                                                onChange={e => updateCreditAmount(index, e.target.value)}
                                                className="text-right font-mono"
                                                placeholder="0"
                                            />
                                        </div>
                                        {creditLines.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCreditLine(index)}
                                                className="text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.credit && <p className="text-xs text-red-500">{errors.credit}</p>}

                            <div className="p-2 bg-red-50 rounded-md font-semibold text-red-600">
                                Total: {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            }).format(totalCredit)}
                            </div>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {errors.sameAccount && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4"/>
                            <span>{errors.sameAccount}</span>
                        </div>
                    )}

                    {!isBalanced && !errors.balance && (
                        <div className="flex items-center gap-2 text-orange-600 text-sm bg-orange-50 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4"/>
                            <span>
                Jurnal tidak balance! Selisih: {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            }).format(Math.abs(totalDebit - totalCredit))}
              </span>
                        </div>
                    )}

                    {isBalanced && totalDebit > 0 && !errors.sameAccount && (
                        <div
                            className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-md font-semibold">
                            ✓ Jurnal Balance
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isBalanced || totalDebit === 0 || !!sameAccountError}
                    >
                        {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Jurnal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
