"use client"
import { useEffect, useState } from 'react'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { apiClient } from '@/lib/api-client'
import { useJournalStore, type JournalEntry, type JournalEntryFormData } from '../store/journal-store'

interface JournalLineForm {
  account_id: number | null
  debit: number
  credit: number
}

interface JournalFormModalProps {
  open: boolean
  onClose: () => void
  editEntry?: JournalEntry | null
}

export function JournalFormModal({ open, onClose, editEntry }: JournalFormModalProps) {
  const { createEntry, updateEntry, isSubmitting } = useJournalStore()

  const [date, setDate] = useState('')
  const [reference, setReference] = useState('')
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<JournalLineForm[]>([
    { account_id: null, debit: 0, credit: 0 },
    { account_id: null, debit: 0, credit: 0 },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditMode = !!editEntry

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editEntry) {
        setDate(editEntry.date.split('T')[0])
        setReference(editEntry.reference || '')
        setDescription(editEntry.description)
        setLines(editEntry.lines.map(l => ({
          account_id: l.account_id,
          debit: l.debit || 0,
          credit: l.credit || 0,
        })))
      } else {
        setDate(new Date().toISOString().split('T')[0])
        setReference('')
        setDescription('')
        setLines([
          { account_id: null, debit: 0, credit: 0 },
          { account_id: null, debit: 0, credit: 0 },
        ])
      }
      setErrors({})
    }
  }, [editEntry, open])

  const addLine = () => {
    setLines([...lines, { account_id: null, debit: 0, credit: 0 }])
  }

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index))
    }
  }

  const updateLine = (index: number, field: keyof JournalLineForm, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!date) newErrors.date = 'Tanggal harus diisi'
    if (!description.trim()) newErrors.description = 'Keterangan harus diisi'

    const validLines = lines.filter(l => l.account_id && (l.debit > 0 || l.credit > 0))
    if (validLines.length < 2) newErrors.lines = 'Minimal 2 baris dengan akun dan nominal'

    if (!isBalanced) newErrors.balance = 'Total Debit harus sama dengan Kredit'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const validLines = lines
      .filter(l => l.account_id && (l.debit > 0 || l.credit > 0))
      .map(l => ({
        account_id: l.account_id!,
        debit: l.debit || 0,
        credit: l.credit || 0,
      }))

    const formData: JournalEntryFormData = {
      date,
      reference: reference || undefined,
      description,
      lines: validLines,
    }

    try {
      if (isEditMode && editEntry) {
        await updateEntry(editEntry.id, formData)
      } else {
        await createEntry(formData)
      }
      onClose()
    } catch (e) {
      console.error('Failed to save:', e)
    }
  }

  // Load account options for async select
  const loadAccountOptions = async (search: string): Promise<SelectOption[]> => {
    try {
      const params = new URLSearchParams()
      params.set('per_page', '100')
      if (search) params.set('search', search)

      const { data } = await apiClient.get(`/admin/accounts?${params}`)
      const accounts = (data.data || []).filter((a: any) => !a.is_header)

      return accounts.map((acc: any) => ({
        value: acc.id,
        label: `${acc.code} - ${acc.name}`,
      }))
    } catch {
      return []
    }
  }

  // Get selected account option
  const getSelectedAccount = (accountId: number | null): SelectOption | null => {
    if (!accountId) return null
    // This will be resolved by AsyncSelect component
    return { value: accountId, label: 'Loading...' }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Edit transaksi jurnal draft' : 'Buat transaksi jurnal umum baru'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Fields */}
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
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={isEditMode && editEntry ? editEntry.status : 'Draft'} disabled />
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

          {/* Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Akun & Nominal</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4 mr-1" /> Tambah Baris
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium w-1/2">Akun</th>
                    <th className="px-3 py-2 text-right font-medium w-1/4">Debit</th>
                    <th className="px-3 py-2 text-right font-medium w-1/4">Kredit</th>
                    <th className="px-3 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">
                        <AsyncSelect
                          value={line.account_id}
                          onChange={(value) => updateLine(index, 'account_id', value)}
                          loadOptions={loadAccountOptions}
                          placeholder="Cari akun..."
                          defaultOption={line.account_id ? getSelectedAccount(line.account_id) : null}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.debit || ''}
                          onChange={e => {
                            updateLine(index, 'debit', parseFloat(e.target.value) || 0)
                            if (parseFloat(e.target.value) > 0) {
                              updateLine(index, 'credit', 0)
                            }
                          }}
                          className="text-right"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.credit || ''}
                          onChange={e => {
                            updateLine(index, 'credit', parseFloat(e.target.value) || 0)
                            if (parseFloat(e.target.value) > 0) {
                              updateLine(index, 'debit', 0)
                            }
                          }}
                          className="text-right"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        {lines.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td className="px-3 py-2 font-medium text-right">Total:</td>
                    <td className="px-3 py-2 text-right font-mono font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(totalDebit)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(totalCredit)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {errors.lines && <p className="text-xs text-red-500">{errors.lines}</p>}

            {/* Balance Warning */}
            {!isBalanced && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Jurnal tidak balance! Selisih: {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(Math.abs(totalDebit - totalCredit))}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isBalanced}>
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Jurnal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
