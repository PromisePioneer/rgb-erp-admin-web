"use client"
import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from '@/components/ui/dialog'
import {AsyncSelect} from '@/components/async-select'
import {apiClient} from '@/lib/api-client'
import {useAccountsStore, type Account} from '../store/accounts-store'

interface AccountFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editAccount: Account | null
}

const ACCOUNT_TYPES = [
    {value: 'asset', label: 'Aset'},
    {value: 'liability', label: 'Kewajiban'},
    {value: 'equity', label: 'Modal'},
    {value: 'revenue', label: 'Pendapatan'},
    {value: 'expense', label: 'Beban'},
]

const NORMAL_BALANCES = [
    {value: 'debit', label: 'Debit'},
    {value: 'credit', label: 'Credit'},
]

export function AccountFormModal({open, onOpenChange, editAccount}: AccountFormModalProps) {
    const {create, update, isSubmitting, fetchAccounts, filters} = useAccountsStore()
    const [form, setForm] = useState({
        code: '',
        name: '',
        type: '' as Account['type'] | '',
        parent_id: '' as string,
        is_header: false,
        normal_balance: 'debit' as 'debit' | 'credit',
        is_active: true,
    })

    const isEdit = !!editAccount

    useEffect(() => {
        if (open) {
            if (editAccount) {
                setForm({
                    code: editAccount.code,
                    name: editAccount.name,
                    type: editAccount.type,
                    parent_id: editAccount.parent_id ? String(editAccount.parent_id) : '',
                    is_header: editAccount.is_header,
                    normal_balance: editAccount.normal_balance,
                    is_active: editAccount.is_active,
                })
            } else {
                setForm({
                    code: '',
                    name: '',
                    type: '',
                    parent_id: '',
                    is_header: false,
                    normal_balance: 'debit',
                    is_active: true,
                })
            }
        }
    }, [editAccount, open])

    const handleSubmit = async () => {
        if (!form.code || !form.name || !form.type) return

        const payload = {
            code: form.code,
            name: form.name,
            type: form.type,
            parent_id: form.parent_id ? Number(form.parent_id) : null,
            is_header: form.is_header,
            normal_balance: form.normal_balance,
            is_active: form.is_active,
        }

        try {
            if (isEdit && editAccount) {
                await update(editAccount.id, payload)
            } else {
                await create(payload)
            }
            onOpenChange(false)
            fetchAccounts({...filters, with_trashed: true})
        } catch (e) {
            console.error('Failed to save:', e)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Akun' : 'Tambah Akun Baru'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? `Edit: ${editAccount?.code} - ${editAccount?.name}` : 'Tambah akun ke Chart of Accounts'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Kode Akun *</Label>
                        <Input
                            value={form.code}
                            onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                            placeholder="111-001"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Nama Akun *</Label>
                        <Input
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            placeholder="Kas dan Setara Kas"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe Akun *</Label>
                        <AsyncSelect
                            placeholder="Pilih tipe..."
                            loadOptions={async () => ACCOUNT_TYPES}
                            value={form.type || null}
                            onChange={(val) => setForm({...form, type: (val as Account['type']) || ''})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Akun Induk</Label>
                        <AsyncSelect
                            placeholder="Tanpa Induk"
                            loadOptions={async (search) => {
                                try {
                                    const {data} = await apiClient.get<{
                                        success: boolean,
                                        data: Account[]
                                    }>('/admin/accounts', {
                                        params: {per_page: 100, search, with_trashed: true}
                                    })
                                    return data.data
                                        .filter(p => p.is_header && (!isEdit || p.id !== editAccount?.id))
                                        .sort((a, b) => a.code.localeCompare(b.code))
                                        .map(p => ({value: String(p.id), label: `${p.code} - ${p.name}`}))
                                } catch {
                                    return []
                                }
                            }}
                            value={form.parent_id ? Number(form.parent_id) : null}
                            onChange={(val) => setForm({...form, parent_id: val ? String(val) : ''})}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="block">Header</Label>
                            <span className="text-xs text-muted-foreground">Header tidak bisa diposting</span>
                        </div>
                        <Switch checked={form.is_header} onCheckedChange={v => setForm({...form, is_header: v})}/>
                    </div>

                    {!form.is_header && (
                        <div className="space-y-2">
                            <Label>Saldo Normal</Label>
                            <AsyncSelect
                                placeholder="Pilih saldo normal..."
                                loadOptions={async () => NORMAL_BALANCES}
                                value={form.normal_balance}
                                onChange={(val) => setForm({...form, normal_balance: (val as 'debit' | 'credit')})}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="block">Aktif</Label>
                            <span
                                className="text-xs text-muted-foreground">Tidak aktif = tidak muncul di dropdown</span>
                        </div>
                        <Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})}/>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !form.code || !form.name || !form.type}
                    >
                        {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Tambah'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
