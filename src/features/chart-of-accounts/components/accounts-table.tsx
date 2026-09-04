"use client"
import { useEffect, useState } from 'react'
import { ChevronRight, ChevronDown, RefreshCw, Plus, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AsyncSelect } from '@/components/async-select'
import { apiClient } from '@/lib/api-client'
import { useAccountsStore, type Account } from '../store/accounts-store'

const TYPE_COLORS: Record<string, string> = {
  asset: 'text-blue-600',
  liability: 'text-red-600',
  equity: 'text-purple-600',
  revenue: 'text-green-600',
  expense: 'text-orange-600',
}

const TYPE_LABELS: Record<string, string> = {
  asset: 'Aset',
  liability: 'Kewajiban',
  equity: 'Modal',
  revenue: 'Pendapatan',
  expense: 'Beban',
}

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Aset' },
  { value: 'liability', label: 'Kewajiban' },
  { value: 'equity', label: 'Modal' },
  { value: 'revenue', label: 'Pendapatan' },
  { value: 'expense', label: 'Beban' },
]

const NORMAL_BALANCES = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
]

interface AccountRowProps {
  account: Account
  level: number
  expanded: boolean
  onToggle: (id: number) => void
  hasChildren: boolean
  onEdit: (account: Account) => void
  onDelete: (id: number) => void
  onRestore: (id: number) => void
}

function AccountRow({ account, level, expanded, onToggle, hasChildren, onEdit, onDelete, onRestore }: AccountRowProps) {
  const normalBalance = account.normal_balance || 'debit'
  const isDeleted = !!account.deleted_at

  return (
    <>
      <tr className={`border-b transition-colors ${isDeleted ? 'opacity-50' : 'hover:bg-muted/50'}`}>
        <td className="px-4 py-3">
          <div className="flex items-center" style={{ paddingLeft: level * 24 }}>
            <button
              onClick={() => hasChildren && onToggle(account.id)}
              className="p-1 hover:bg-muted rounded mr-2"
              disabled={!hasChildren}
            >
              {hasChildren ? (
                expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <span className="w-5" />
              )}
            </button>
            <span className="font-mono text-sm">{account.code}</span>
            {isDeleted && (
              <Badge variant="destructive" className="ml-2 text-xs">Deleted</Badge>
            )}
          </div>
        </td>
        <td className={`px-4 py-3 ${account.is_header ? 'font-medium' : ''} ${isDeleted ? 'line-through' : ''}`}>
          {account.name}
        </td>
        <td className={`px-4 py-3 capitalize ${TYPE_COLORS[account.type] || ''}`}>
          {TYPE_LABELS[account.type] || account.type}
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`text-xs px-2 py-1 rounded ${
            account.is_header ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
          }`}>
            {account.is_header ? 'Header' : 'Detail'}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`text-xs px-2 py-1 rounded font-bold ${
            normalBalance === 'debit' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'
          }`}>
            {normalBalance.toUpperCase()}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex justify-center gap-1">
            {isDeleted ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore(account.id)}
                title="Restore"
              >
                <RotateCcw className="h-4 w-4 text-green-600" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(account)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(account.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded && account.children?.map(child => (
        <AccountRow
          key={child.id}
          account={child}
          level={level + 1}
          expanded={false}
          onToggle={onToggle}
          hasChildren={(child.children?.length ?? 0) > 0}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </>
  )
}

// Account Form Modal
interface AccountFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editAccount: Account | null
}

function AccountFormModal({ open, onOpenChange, editAccount }: AccountFormModalProps) {
  const { create, update, isSubmitting, fetchAccounts, filters } = useAccountsStore()
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
      fetchAccounts({ ...filters, with_trashed: true })
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
            <label className="text-sm font-medium">Kode Akun *</label>
            <Input
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="111-001"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Akun *</label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Kas dan Setara Kas"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipe Akun *</label>
            <AsyncSelect
              placeholder="Pilih tipe..."
              loadOptions={async () => ACCOUNT_TYPES}
              value={form.type || null}
              onChange={val => setForm({ ...form, type: (val as Account['type']) || '' })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Akun Induk</label>
            <AsyncSelect
              placeholder="Tanpa Induk"
              loadOptions={async (search) => {
                try {
                  const { data } = await apiClient.get<{ success: boolean, data: Account[] }>('/admin/accounts', {
                    params: { per_page: 100, search, with_trashed: true }
                  })
                  return data.data
                    .filter(p => p.is_header && (!isEdit || p.id !== editAccount?.id))
                    .sort((a, b) => a.code.localeCompare(b.code))
                    .map(p => ({ value: String(p.id), label: `${p.code} - ${p.name}` }))
                } catch {
                  return []
                }
              }}
              value={form.parent_id ? Number(form.parent_id) : null}
              onChange={val => setForm({ ...form, parent_id: val ? String(val) : '' })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Header</label>
              <span className="text-xs text-muted-foreground">Header tidak bisa diposting</span>
            </div>
            <Switch
              checked={form.is_header}
              onCheckedChange={v => setForm({ ...form, is_header: v })}
            />
          </div>

          {!form.is_header && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Saldo Normal</label>
              <AsyncSelect
                placeholder="Pilih saldo normal..."
                loadOptions={async () => NORMAL_BALANCES}
                value={form.normal_balance}
                onChange={val => setForm({ ...form, normal_balance: (val as 'debit' | 'credit') })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Aktif</label>
              <span className="text-xs text-muted-foreground">Tidak aktif = tidak muncul di dropdown</span>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={v => setForm({ ...form, is_active: v })}
            />
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

// Delete Confirmation Modal
interface DeleteModalProps {
  open: boolean
  onClose: () => void
  account: Account | null
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

function DeleteModal({ open, onClose, account, onConfirm, isDeleting }: DeleteModalProps) {
  if (!account) return null

  const childCount = account.children?.length || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Akun</DialogTitle>
          <DialogDescription>
            Hapus <strong>{account.code} - {account.name}</strong>?
            {childCount > 0 && (
              <p className="mt-2 text-orange-600 font-medium">
                ⚠️ {childCount} akun anak juga akan dihapus (soft delete)
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Table
export function AccountsTable() {
  const { items, isLoading, isSubmitting, fetchAccounts, softDelete, restore, setFilters, filters } = useAccountsStore()
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null)

  useEffect(() => {
    fetchAccounts({ ...filters, with_trashed: true })
  }, [])

  const toggle = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleEdit = (acc: Account) => {
    setEditAccount(acc)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    const acc = findAccount(items, id)
    setDeleteAccount(acc)
  }

  const handleRestore = async (id: number) => {
    try {
      await restore(id)
    } catch (e) {
      console.error('Restore failed:', e)
    }
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditAccount(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteAccount) return
    try {
      await softDelete(deleteAccount.id)
      setDeleteAccount(null)
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const findAccount = (accounts: Account[], id: number): Account | null => {
    for (const acc of accounts) {
      if (acc.id === id) return acc
      if (acc.children) {
        const found = findAccount(acc.children, id)
        if (found) return found
      }
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chart of Accounts</h2>
        <div className="flex gap-2">
          <Button onClick={() => { setEditAccount(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Cari..."
          defaultValue={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="max-w-xs"
        />
        <AsyncSelect
          placeholder="Semua Tipe"
          loadOptions={async () => ACCOUNT_TYPES}
          value={filters.type || null}
          onChange={val => setFilters({ ...filters, type: val as Account['type'] || undefined })}
          className="w-40"
        />
        <Button variant="outline" onClick={() => fetchAccounts({ ...filters, with_trashed: true })}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Kode</th>
              <th className="px-4 py-3 text-left font-medium">Nama Akun</th>
              <th className="px-4 py-3 text-left font-medium">Tipe</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Normal</th>
              <th className="px-4 py-3 text-center font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada akun
                </td>
              </tr>
            ) : (
              items.map(acc => (
                <AccountRow
                  key={acc.id}
                  account={acc}
                  level={0}
                  expanded={expanded.has(acc.id)}
                  onToggle={toggle}
                  hasChildren={(acc.children?.length || 0) > 0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <AccountFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        editAccount={editAccount}
      />

      <DeleteModal
        open={!!deleteAccount}
        onClose={() => setDeleteAccount(null)}
        account={deleteAccount}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  )
}
