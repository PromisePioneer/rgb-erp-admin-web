"use client"
import { useEffect, useState } from 'react'
import { RefreshCw, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useAccountingPeriodsStore, type AccountingPeriod } from '../store/accounting-periods-store'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AccountingPeriodsTable() {
  const { items: periods, isLoading, isSubmitting, fetchPeriods, closePeriod, reopenPeriod } = useAccountingPeriodsStore()
  const [closePeriodId, setClosePeriodId] = useState<number | null>(null)

  useEffect(() => {
    fetchPeriods()
  }, [fetchPeriods])

  const handleClose = async () => {
    if (!closePeriodId) return
    try {
      await closePeriod(closePeriodId)
      setClosePeriodId(null)
    } catch (e) {
      console.error('Failed to close period:', e)
    }
  }

  const handleReopen = async (id: number) => {
    try {
      await reopenPeriod(id)
    } catch (e) {
      console.error('Failed to reopen period:', e)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100"><Unlock className="h-3 w-3 mr-1" />Open</Badge>
      case 'closed':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Lock className="h-3 w-3 mr-1" />Closed</Badge>
      case 'locked':
        return <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" />Locked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Group by year and ensure it's an array
  const safePeriods = Array.isArray(periods) ? periods : []
  const grouped = safePeriods.reduce((acc: Record<number, AccountingPeriod[]>, p) => {
    const year = p.year || new Date(p.start_date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(p)
    return acc
  }, {})
  const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Periode Akuntansi</h2>
          <p className="text-sm text-muted-foreground">Kelola periode dan tutup buku</p>
        </div>
        <Button variant="outline" onClick={() => fetchPeriods()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Open</Badge>
          <span className="text-muted-foreground">Periode aktif, bisa input transaksi</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Closed</Badge>
          <span className="text-muted-foreground">Periode ditutup, tidak bisa input</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">Locked</Badge>
          <span className="text-muted-foreground">Periode terkunci permanen</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat...</div>
      ) : sortedYears.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Tidak ada data periode</div>
      ) : (
        <div className="space-y-8">
          {sortedYears.map(year => (
            <div key={year} className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <h3 className="font-semibold">Tahun {year}</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Periode</th>
                    <th className="px-4 py-2 text-left font-medium">Tanggal Mulai</th>
                    <th className="px-4 py-2 text-left font-medium">Tanggal Selesai</th>
                    <th className="px-4 py-2 text-center font-medium">Status</th>
                    <th className="px-4 py-2 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[Number(year)].sort((a: AccountingPeriod, b: AccountingPeriod) => (a.month || 0) - (b.month || 0)).map((period: AccountingPeriod) => (
                    <tr key={period.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        {period.label || `Bulan ${period.month}`}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(period.start_date)}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(period.end_date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(period.status || 'open')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {period.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setClosePeriodId(period.id)}
                            disabled={isSubmitting}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Tutup
                          </Button>
                        )}
                        {period.status === 'closed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReopen(period.id)}
                            disabled={isSubmitting}
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            Buka Kembali
                          </Button>
                        )}
                        {period.status === 'locked' && (
                          <span className="text-xs text-muted-foreground">Tidak bisa diubah</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Close Period Confirmation */}
      <Dialog open={!!closePeriodId} onOpenChange={() => setClosePeriodId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutup Periode</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menutup periode ini? Setelah ditutup:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Tidak bisa menambah/mengubah transaksi</li>
                <li>Closing entries akan dibuat otomatis</li>
                <li>Saldo akan dipindahkan ke periode berikutnya</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosePeriodId(null)}>Batal</Button>
            <Button onClick={handleClose} disabled={isSubmitting}>
              <Lock className="h-4 w-4 mr-2" />
              Ya, Tutup Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
