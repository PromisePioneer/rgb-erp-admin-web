import { useEffect, useState } from 'react'
// @ts-ignore
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFundRequestsStore } from '../store/fund-requests-store'
import { toast } from 'sonner'

interface SelectOption { id: number; label: string }

export function FundRequestsForm() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const isEdit = Boolean(params.id)

  const { fetchById, selectedItem, isSubmitting, create, submitForApproval } = useFundRequestsStore()

  const [poId, setPoId] = useState<number | undefined>(undefined)
  const [amount, setAmount] = useState<string>('')
  const [tax, setTax] = useState<string>('0')
  const [term, setTerm] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [bankAccount, setBankAccount] = useState<string>('')
  const [bankOwner, setBankOwner] = useState<string>('')
  const [method, setMethod] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [poOptions, setPoOptions] = useState<SelectOption[]>([])

  useEffect(() => {
    if (isEdit && params.id) {
      fetchById(Number(params.id))
    }
  }, [isEdit, params.id])

  useEffect(() => {
    if (selectedItem && isEdit) {
      setPoId(selectedItem.po_id)
      setAmount(String(selectedItem.requested_amount))
      setTax(String(selectedItem.tax_amount))
      setTerm(selectedItem.payment_term || '')
      setBankName(selectedItem.bank_name || '')
      setBankAccount(selectedItem.bank_account_number || '')
      setBankOwner(selectedItem.bank_account_name || '')
      setMethod(selectedItem.payment_method || '')
      setNotes(selectedItem.notes || '')
    }
  }, [selectedItem, isEdit])

  useEffect(() => {
    if (!isEdit) {
      fetch('/admin/purchase-orders?status=approved&per_page=100')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.data) {
            const options = data.data.map((po: any) => {
              return { id: po.id, label: po.code + ' - ' + (po.supplier || 'No Supplier') }
            })
            setPoOptions(options)
          }
        })
        .catch(function() {})
    }
  }, [isEdit])

  const handleSave = async () => {
    if (!poId) {
      toast.error('PO wajib dipilih')
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Jumlah harus diisi')
      return
    }

    try {
      await create({
        po_id: poId,
        requested_amount: Number(amount),
        tax_amount: Number(tax) || 0,
        payment_term: term || undefined,
        bank_name: bankName || undefined,
        bank_account_number: bankAccount || undefined,
        bank_account_name: bankOwner || undefined,
        payment_method: method || undefined,
        notes: notes || undefined,
      } as any)
      toast.success('Fund request dibuat')
      navigate({ to: '/fund-requests' })
    } catch (err: any) {
      toast.error(err.message || 'Gagal')
    }
  }

  const handleSubmitApproval = async () => {
    if (!params.id) return
    try {
      await submitForApproval(Number(params.id))
      toast.success('Diajukan untuk approval')
    } catch (err: any) {
      toast.error(err.message || 'Gagal')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/fund-requests' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Fund Request</h1>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Purchase Order *</h2>
        <select
          className="w-full border rounded px-3 py-2"
          value={poId || ''}
          onChange={(e) => setPoId(Number(e.target.value) || undefined)}
          disabled={isEdit}
        >
          <option value="">Pilih PO...</option>
          {poOptions.map((o) => (
            <option key={o.id} value={String(o.id)}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Informasi Keuangan</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Jumlah Diminta *</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Pajak</label>
            <Input type="number" value={tax} onChange={(e) => setTax(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Termin</label>
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="DP 30%, Net 30" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Informasi Pembayaran</h2>
        <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Nama Bank" />
        <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="No Rekening" />
        <Input value={bankOwner} onChange={(e) => setBankOwner(e.target.value)} placeholder="Nama Pemilik" />
        <select className="w-full border rounded px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">Metode Pembayaran...</option>
          <option value="Transfer">Transfer</option>
          <option value="Cash">Cash</option>
          <option value="Petty Cash">Petple Cash</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Catatan</h2>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan tambahan..." />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate({ to: '/fund-requests' })}>Batal</Button>
        {selectedItem?.can_submit && (
          <Button onClick={handleSubmitApproval} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Ajukan Approval
          </Button>
        )}
        {!isEdit && (
          <Button onClick={handleSave} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Simpan
          </Button>
        )}
      </div>
    </div>
  )
}
