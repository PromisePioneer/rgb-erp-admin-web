/**
 * UMK Form Modal Component
 * Upah Minimum Kota
 */
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useUmkStore } from '../store/umk-store'

interface UmkFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  umkId?: number
  onSuccess?: () => void
}

type FormValues = {
  province: string
  city: string
  value: string // formatted string for display
}

// Format number to Indonesian format (1.000.000)
function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value
  if (isNaN(num)) return ''
  return num.toLocaleString('id-ID')
}

// Parse formatted string to number
function parseFormattedNumber(value: string): number {
  return parseFloat(value.replace(/\./g, '')) || 0
}

export function UmkFormModal({ open, onOpenChange, mode, umkId, onSuccess }: UmkFormModalProps) {
  const { selectedItem, isLoading, isSubmitting, fetchById, create, update, resetForm } = useUmkStore()

  const currentYear = new Date().getFullYear()
  const hasShownValidationToast = useRef(false)

  const form = useForm<FormValues>({
    defaultValues: {
      province: '',
      city: '',
      value: '',
    },
  })

  // Store selected year separately (not managed by react-hook-form)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [yearError, setYearError] = useState<string>('')

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        province: '',
        city: '',
        value: '',
      })
      setSelectedYear(currentYear)
      setYearError('')
      hasShownValidationToast.current = false
    }
  }, [open, form, currentYear])

  // Show toast on validation errors
  useEffect(() => {
    const errors = form.formState.errors
    const errorCount = Object.keys(errors).length

    if (
      errorCount > 0 &&
      form.formState.submitCount > 0 &&
      !hasShownValidationToast.current
    ) {
      hasShownValidationToast.current = true

      const errorMessages = Object.values(errors)
        .map((error) => error?.message)
        .filter(Boolean) as string[]

      if (errorMessages.length === 1) {
        toast.error(errorMessages[0])
      } else if (errorMessages.length > 1) {
        toast.error(`${errorMessages.length} validation errors. Please check the form.`)
      }
    }

    if (errorCount === 0) {
      hasShownValidationToast.current = false
    }
  }, [form, form.formState.errors, form.formState.submitCount])

  useEffect(() => {
    if (mode === 'edit' && umkId && open) {
      fetchById(umkId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, umkId, open, fetchById, resetForm])

  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        province: selectedItem.province,
        city: selectedItem.city,
        value: formatNumber(selectedItem.value),
      })
      setSelectedYear(selectedItem.year)
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => onOpenChange(false)

  const onSubmit = async (values: FormValues) => {
    // Validate year
    if (!selectedYear || selectedYear < 2000 || selectedYear > 2100) {
      setYearError('Tahun wajib diisi dan harus antara 2000-2100')
      toast.error('Tahun wajib diisi dan harus antara 2000-2100')
      return
    }

    // Validate value
    const numericValue = parseFormattedNumber(values.value)
    if (!values.value.trim()) {
      form.setError('value', { message: 'Nilai UMK wajib diisi' })
      toast.error('Nilai UMK wajib diisi')
      return
    }
    if (numericValue <= 0) {
      form.setError('value', { message: 'Nilai UMK harus lebih dari 0' })
      toast.error('Nilai UMK harus lebih dari 0')
      return
    }

    try {
      const payload = {
        year: selectedYear,
        province: values.province.trim(),
        city: values.city.trim(),
        value: numericValue,
      }

      if (mode === 'create') {
        await create(payload)
        toast.success('UMK berhasil ditambahkan')
      } else if (umkId) {
        await update(umkId, payload)
        toast.success('UMK berhasil diupdate')
      }
      handleClose()
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  // Load year options for AsyncSelect
  const loadYearOptions = async (search: string): Promise<SelectOption[]> => {
    const years = Array.from({ length: 15 }, (_, i) => currentYear + 2 - i)
    const filtered = years.filter((y) =>
      String(y).includes(search)
    )
    return filtered.map((year) => ({
      value: year,
      label: String(year),
    }))
  }

  const handleYearChange = (value: number | string | null) => {
    if (value !== null) {
      setSelectedYear(Number(value))
      setYearError('')
    }
  }

  // Get current year option for defaultOption
  const getYearDefaultOption = (): SelectOption | null => {
    if (mode === 'edit' && selectedItem) {
      return { value: selectedItem.year, label: String(selectedItem.year) }
    }
    return { value: selectedYear, label: String(selectedYear) }
  }

  // Handle value change - format on blur
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '')
    if (rawValue === '') {
      form.setValue('value', '', { shouldValidate: true })
      return
    }
    const num = parseFloat(rawValue)
    if (!isNaN(num)) {
      form.setValue('value', formatNumber(num), { shouldValidate: true })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah UMK' : 'Edit UMK'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Year - using AsyncSelect */}
          <AsyncSelect
            label="Tahun *"
            value={selectedYear}
            onChange={handleYearChange}
            loadOptions={loadYearOptions}
            placeholder="Pilih tahun..."
            defaultOptions={true}
            defaultOption={getYearDefaultOption()}
            error={yearError}
          />

          {/* Province - plain text input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Provinsi *</label>
            <Input
              placeholder="Contoh: Jawa Barat"
              {...form.register('province', { required: 'Provinsi wajib diisi' })}
            />
            {form.formState.errors.province && (
              <p className="text-sm text-destructive">{form.formState.errors.province.message}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kota *</label>
            <Input
              placeholder="Contoh: Bandung"
              {...form.register('city', { required: 'Kota wajib diisi' })}
            />
            {form.formState.errors.city && (
              <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
            )}
          </div>

          {/* Value - formatted number input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nilai UMK (Rupiah) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="2.500.000"
                className="pl-10"
                value={form.watch('value')}
                onChange={handleValueChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ketik angka tanpa titik. Contoh: 2500000 akan ditampilkan sebagai 2.500.000
            </p>
            {form.formState.errors.value && (
              <p className="text-sm text-destructive">{form.formState.errors.value.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
