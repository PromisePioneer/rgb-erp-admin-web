import { useEffect, useState, useCallback } from 'react'
// @ts-ignore
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect } from '@/components/async-select'
import { useFundRequestsStore } from '../store/fund-requests-store'
import { fundRequestsApi } from '../api/fund-requests-api'
import { toast } from 'sonner'

interface SelectOption { value: number | string; label: string; total?: number }

// Payment term options with percentages
const PAYMENT_TERM_OPTIONS: SelectOption[] = [
  { value: 'DP 30%', label: 'DP 30% (30%)' },
  { value: 'DP 50%', label: 'DP 50% (50%)' },
  { value: 'Termin 1', label: 'Termin 1 (50%)' },
  { value: 'Termin 2', label: 'Termin 2 (50%)' },
  { value: 'Net 7', label: 'Net 7 (100%)' },
  { value: 'Net 14', label: 'Net 14 (100%)' },
  { value: 'Net 30', label: 'Net 30 (100%)' },
  { value: 'Net 60', label: 'Net 60 (100%)' },
  { value: 'Full Payment', label: 'Full Payment (100%)' },
]

// Percentage map for calculating amount
const PAYMENT_TERM_PERCENTAGE: Record<string, number> = {
  'DP 30%': 0.30,
  'DP 50%': 0.50,
  'Termin 1': 0.50,
  'Termin 2': 0.50,
  'Net 7': 1.0,
  'Net 14': 1.0,
  'Net 30': 1.0,
  'Net 60': 1.0,
  'Full Payment': 1.0,
}

export function FundRequestsForm() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const isEdit = Boolean(params.id)

  const { fetchById, selectedItem, isSubmitting, create, submitForApproval } = useFundRequestsStore()

  const [poId, setPoId] = useState<number | undefined>(undefined)
  const [poDefaultOption, setPoDefaultOption] = useState<SelectOption | null>(null)
  const [poOptions, setPoOptions] = useState<SelectOption[]>([])
  const [poTotal, setPoTotal] = useState<number>(0)
  const [remainingAmount, setRemainingAmount] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')
  const [tax, setTax] = useState<string>('0')
  const [term, setTerm] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [bankAccount, setBankAccount] = useState<string>('')
  const [bankOwner, setBankOwner] = useState<string>('')
  const [method, setMethod] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isLoadingRemaining, setIsLoadingRemaining] = useState(false)

  useEffect(() => {
    if (isEdit && params.id) {
      fetchById(Number(params.id))
    }
  }, [isEdit, params.id])

  useEffect(() => {
    if (selectedItem && isEdit) {
      setPoId(selectedItem.po_id)
      // Set default option for edit mode
      if (selectedItem.po_code) {
        setPoDefaultOption({
          value: selectedItem.po_id,
          label: selectedItem.po_code + ' - ' + (selectedItem.po_supplier || 'No Supplier'),
        })
      }
      setPoTotal(selectedItem.total_po_amount || 0)
      setRemainingAmount(selectedItem.remaining_amount || 0)
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

  const loadPurchaseOrders = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const apiParams = search ? { q: search } : {}
      const data = await fundRequestsApi.getApprovedPurchaseOrders(apiParams)
      if (data.success && data.data) {
        const options = data.data.map((po: any) => ({
          value: po.id,
          label: po.code + ' - ' + (po.supplier || 'No Supplier'),
          total: po.total,
        }))
        setPoOptions(options)
        return options
      }
      return []
    } catch (err) {
      console.error('Failed to fetch POs:', err)
      return []
    }
  }, [])

  const handlePoChange = async (poValue: number | string | null) => {
    const value = poValue as number | undefined
    setPoId(value)
    setTerm('') // Reset termin when PO changes
    setAmount('')

    if (value) {
      // Fetch remaining amount from backend
      setIsLoadingRemaining(true)
      try {
        const response = await fundRequestsApi.getRemainingAmount(value)
        if (response.success && response.data) {
          setPoTotal(response.data.po_total)
          setRemainingAmount(response.data.remaining_amount)
        }
      } catch (err) {
        console.error('Failed to fetch remaining amount:', err)
        // Fallback to PO total if API fails
        const selectedPo = poOptions.find(po => po.value === value)
        if (selectedPo?.total) {
          setPoTotal(selectedPo.total)
          setRemainingAmount(selectedPo.total)
        }
      } finally {
        setIsLoadingRemaining(false)
      }
    } else {
      setPoTotal(0)
      setRemainingAmount(0)
    }
  }

  const handleTermChange = (termValue: number | string | null) => {
    const value = termValue as string
    setTerm(value)

    if (value && remainingAmount > 0) {
      const percentage = PAYMENT_TERM_PERCENTAGE[value] || 1.0
      let calculatedAmount = remainingAmount * percentage

      // If calculated amount exceeds remaining, use remaining
      if (calculatedAmount > remainingAmount) {
        calculatedAmount = remainingAmount
      }

      setAmount(String(Math.floor(calculatedAmount)))
    } else if (!value && remainingAmount > 0) {
      // If termin cleared, allow manual input (or use full remaining)
      setAmount(String(Math.floor(remainingAmount)))
    } else {
      setAmount('')
    }
  }

  // Static loadOptions for payment terms (no API call)
  const loadPaymentTerms = useCallback(async (_search: string): Promise<SelectOption[]> => {
    return PAYMENT_TERM_OPTIONS
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  const isAmountExceedsRemaining = Number(amount) > remainingAmount

  const handleSave = async () => {
    if (!poId) {
      toast.error('PO wajib dipilih')
      return
    }
    if (!term) {
      toast.error('Termin wajib dipilih')
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Jumlah harus diisi')
      return
    }
    if (isAmountExceedsRemaining) {
      toast.error('Jumlah melebihi sisa tagihan')
      return
    }

    try {
      await create({
        po_id: poId,
        requested_amount: Number(amount),
        tax_amount: Number(tax) || 0,
        payment_term: term,
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
        <AsyncSelect
          value={poId}
          onChange={handlePoChange}
          loadOptions={loadPurchaseOrders}
          placeholder="Ketik untuk mencari PO..."
          isDisabled={isEdit}
          defaultOption={poDefaultOption}
          defaultOptions={true}
        />
        {poTotal > 0 && (
          <div className="flex gap-4 text-sm">
            <p className="text-muted-foreground">
              Total PO: <span className="font-medium text-foreground">Rp {formatCurrency(poTotal)}</span>
            </p>
            {isLoadingRemaining ? (
              <p className="text-muted-foreground">Menghitung sisa...</p>
            ) : (
              <p className={remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}>
                Sisa Tagihan: <span className="font-medium">Rp {formatCurrency(remainingAmount)}</span>
              </p>
            )}
          </div>
        )}
        {remainingAmount === 0 && poId && !isEdit && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">PO ini sudah tidak memiliki sisa tagihan.</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Informasi Keuangan</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Termin *</label>
            <AsyncSelect
              value={term || undefined}
              onChange={handleTermChange}
              loadOptions={loadPaymentTerms}
              placeholder="Pilih Termin..."
              isDisabled={isEdit || !poId || remainingAmount === 0}
              defaultOptions={true}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Jumlah Diminta *</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              disabled={isEdit || !term}
              className={isAmountExceedsRemaining ? 'border-red-500' : ''}
            />
            {isAmountExceedsRemaining && (
              <p className="text-xs text-red-500">Melebihi sisa tagihan (Rp {formatCurrency(remainingAmount)})</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm">Pajak</label>
            <Input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder="0"
              disabled={isEdit}
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Informasi Pembayaran</h2>
        <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Nama Bank" disabled={isEdit} />
        <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="No Rekening" disabled={isEdit} />
        <Input value={bankOwner} onChange={(e) => setBankOwner(e.target.value)} placeholder="Nama Pemilik" disabled={isEdit} />
        <select
          className="w-full border rounded px-3 py-2 bg-background"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          disabled={isEdit}
        >
          <option value="">Metode Pembayaran...</option>
          <option value="Transfer">Transfer</option>
          <option value="Cash">Cash</option>
          <option value="Petty Cash">Petty Cash</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Catatan</h2>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan tambahan..."
          disabled={isEdit}
        />
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
          <Button onClick={handleSave} disabled={isSubmitting || isAmountExceedsRemaining}>
            <Save className="h-4 w-4 mr-2" />
            Simpan
          </Button>
        )}
      </div>
    </div>
  )
}
