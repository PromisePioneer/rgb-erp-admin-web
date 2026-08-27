"use client"
import {useEffect, useState} from 'react'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {apiClient} from '@/lib/api-client'
import {Badge} from '@/components/ui/badge'

function formatCurrency(v: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(v)
}

interface DepreciationRecord {
  id: number
  fixed_asset_id: number
  period_id: number
  amount: number
  posted_by: number
  journal_entry_id: number
  created_at: string
  period: {
    id: number
    year: number
    month: number
    label: string
  }
  journal_entry?: {
    id: number
    reference: string
    date: string
    status: string
  }
}

interface Asset {
  id: number
  code: string
  name: string
  category: string
  acquisition_date: string
  acquisition_cost: number
  useful_life_months: number
  salvage_value: number
}

interface DepreciationHistoryModalProps {
  open: boolean
  onClose: () => void
  asset: Asset
}

export function DepreciationHistoryModal({open, onClose, asset}: DepreciationHistoryModalProps) {
  const [depreciations, setDepreciations] = useState<DepreciationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && asset) {
      fetchDepreciations()
    }
  }, [open, asset])

  const fetchDepreciations = async () => {
    setIsLoading(true)
    try {
      const {data} = await apiClient.get(`/admin/fixed-assets/${asset.id}`)
      const assetData = data.data

      // Sort depreciations by period
      const sorted = (assetData.depreciations || []).sort((a: DepreciationRecord, b: DepreciationRecord) => {
        if (a.period.year !== b.period.year) {
          return b.period.year - a.period.year
        }
        return b.period.month - a.period.month
      })

      setDepreciations(sorted)
    } catch (error) {
      console.error('Failed to fetch depreciations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalDepreciation = depreciations.reduce((sum, d) => sum + Number(d.amount), 0)
  const monthsCount = depreciations.length
  const monthlyDepreciation = Number(asset.acquisition_cost) / Number(asset.useful_life_months)

  const getMonthName = (month: number) => {
    const date = new Date(2024, month - 1)
    return date.toLocaleDateString('id-ID', {month: 'long'})
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" style={{ width: '900px', maxWidth: '95vw' }}>
        <DialogHeader>
          <DialogTitle>Riwayat Penyusutan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Asset Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Kode</p>
                <p className="font-medium">{asset.code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nama</p>
                <p className="font-medium">{asset.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Harga Perolehan</p>
                <p className="font-medium">{formatCurrency(asset.acquisition_cost)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nilai Sisa</p>
                <p className="font-medium">{formatCurrency(asset.salvage_value || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Umur Ekonomis</p>
                <p className="font-medium">{asset.useful_life_months} bulan</p>
              </div>
              <div>
                <p className="text-muted-foreground">Penyusutan/Bulan</p>
                <p className="font-medium">{formatCurrency(monthlyDepreciation)}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Total Posting</p>
              <p className="text-xl font-bold">{monthsCount} bulan</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Total Akumulasi</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(totalDepreciation)}</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Sisa Nilai Buku</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(asset.acquisition_cost - totalDepreciation)}
              </p>
            </div>
          </div>

          {/* Depreciation List */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Periode</th>
                  <th className="px-4 py-3 text-right font-medium">Penyusutan</th>
                  <th className="px-4 py-3 text-right font-medium">Akumulasi</th>
                  <th className="px-4 py-3 text-center font-medium">Journal</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Memuat...
                    </td>
                  </tr>
                ) : depreciations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Belum ada penyusutan yang diposting
                    </td>
                  </tr>
                ) : (
                  depreciations.map((dep, index) => {
                    const cumulativeBefore = depreciations.slice(index + 1).reduce((sum, d) => sum + Number(d.amount), 0)
                    const cumulativeAfter = cumulativeBefore + Number(dep.amount)

                    return (
                      <tr key={dep.id} className="border-t">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{getMonthName(dep.period.month)} {dep.period.year}</p>
                            <p className="text-xs text-muted-foreground">{dep.period.label}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-orange-600">
                          {formatCurrency(dep.amount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(cumulativeAfter)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {dep.journal_entry ? (
                            <Badge variant="outline" className="text-xs">
                              {dep.journal_entry.reference}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Schedule Preview (future months) */}
          {!isLoading && (
            <div className="border rounded-lg p-4 bg-blue-50/50">
              <h4 className="font-medium text-sm mb-2">Estimasi Penyusutan Mendatang</h4>
              <p className="text-sm text-muted-foreground">
                {monthsCount === 0 && (
                  <>Belum ada yang diposting. Mulai posting dari {getMonthName(new Date(asset.acquisition_date).getMonth() + 1)} {new Date(asset.acquisition_date).getFullYear()}</>
                )}
                {monthsCount > 0 && monthsCount < Number(asset.useful_life_months) && (
                  <>Sisa {Number(asset.useful_life_months) - monthsCount} bulan × {formatCurrency(monthlyDepreciation)} = {formatCurrency((Number(asset.useful_life_months) - monthsCount) * monthlyDepreciation)}</>
                )}
                {monthsCount >= Number(asset.useful_life_months) && (
                  <span className="text-green-600 font-medium">✓ Semua penyusutan sudah diposting (Fully Depreciated)</span>
                )}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
