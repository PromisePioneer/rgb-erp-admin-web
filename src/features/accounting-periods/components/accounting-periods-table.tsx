"use client"
import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { apiClient } from '@/lib/api-client'

interface AccountingPeriod {
  id: number
  year: number
  month: number
  label: string
  start_date: string
  end_date: string
  status: 'open' | 'closed' | 'locked'
  closed_at: string | null
  closed_by: number | null
}

export function AccountingPeriodsTable() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [closePeriodId, setClosePeriodId] = useState<number | null>(null)

  const fetchPeriods = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await apiClient.get('/admin/accounting-periods')
      setPeriods(res.data.data || [])
    } catch (e) {
      console.error('Failed to fetch periods:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPeriods() }, [fetchPeriods])

  const handleClose = async () => {
    if (!closePeriodId) return
    setActionLoading(closePeriodId)
    try {
      await apiClient.post(`/admin/accounting-periods/${closePeriodId}/close`)
      setClosePeriodId(null)
      await fetchPeriods()
    } catch (e) {
      console.error('Failed to close period:', e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReopen = async (id: number) => {
    setActionLoading(id)
    try {
      await apiClient.post(`/admin/accounting-periods/${id}/reopen`)
      await fetchPeriods()
    } catch (e) {
      console.error('Failed to reopen period:', e)
    } finally {
      setActionLoading(null)
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

  const grouped = periods.reduce((acc, p) => {
    if (!acc[p.year]) acc[p.year] = []
    acc[p.year].push(p)
    return acc
  }, {} as Record<number, AccountingPeriod[]>)

  const sortedYears = Object.keys(grouped).sort((a: string, b: string) => Number(b) - Number(a))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Periode Akuntansi</h2>
          <p className="text-sm text-muted-foreground">Kelola periode dan tutup buku</p>
        </div>
        <Button variant="outline" onClick={fetchPeriods} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat...</div>
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
                  {grouped[Number(year)].sort((a: AccountingPeriod, b: AccountingPeriod) => a.month - b.month).map((period: AccountingPeriod) => (
                    <tr key={period.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        {period.label}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(period.start_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(period.end_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(period.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {period.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setClosePeriodId(period.id)}
                            disabled={actionLoading === period.id}
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
                            disabled={actionLoading === period.id}
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
            <Button onClick={handleClose} disabled={!!actionLoading}>
              <Lock className="h-4 w-4 mr-2" />
              Ya, Tutup Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
