"use client"
import {useEffect, useState, useCallback} from 'react'
import {CheckCircle, XCircle, Trash2, RotateCcw, RefreshCw} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription} from '@/components/ui/dialog'
import {Badge} from '@/components/ui/badge'
import {apiClient} from '@/lib/api-client'
import type {JournalEntry} from '../types/journal.types'

function formatCurrency(v: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(v)
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function JournalEntriesTable() {
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.set('status', statusFilter)
            if (startDate) params.set('start_date', startDate)
            if (endDate) params.set('end_date', endDate)
            params.set('per_page', '50')
            const {data} = await apiClient.get(`/admin/journal-entries?${params}`)
            setEntries(data.data || [])
        } catch (e) {
            console.error('Failed to fetch journal entries:', e)
        } finally {
            setLoading(false)
        }
    }, [statusFilter, startDate, endDate])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries])

    const handlePost = async (id: number) => {
        setActionLoading(id)
        try {
            await apiClient.post(`/admin/journal-entries/${id}/post`)
            await fetchEntries()
        } catch (e) {
            console.error('Failed to post:', e)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUnpost = async (id: number) => {
        setActionLoading(id)
        try {
            await apiClient.post(`/admin/journal-entries/${id}/unpost`)
            await fetchEntries()
        } catch (e) {
            console.error('Failed to unpost:', e)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setActionLoading(deleteId)
        try {
            await apiClient.delete(`/admin/journal-entries/${deleteId}`)
            setDeleteId(null)
            await fetchEntries()
        } catch (e) {
            console.error('Failed to delete:', e)
        } finally {
            setActionLoading(null)
        }
    }


    const totalDebit = entries.reduce((sum, e) => sum + (e.total_debit || 0), 0)
    const totalCredit = entries.reduce((sum, e) => sum + (e.total_credit || 0), 0)

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 items-center flex-wrap">
                <Select value={statusFilter} onValueChange={v => v && setStatusFilter(v)}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-40"
                />
                <span className="text-muted-foreground">s/d</span>
                <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-40"
                />
                <Button variant="outline" size="sm" onClick={fetchEntries}>
                    <RefreshCw className="h-4 w-4 mr-2"/>
                    Refresh
                </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                        <th className="px-4 py-3 text-left font-medium">Referensi</th>
                        <th className="px-4 py-3 text-left font-medium">Keterangan</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Debit</th>
                        <th className="px-4 py-3 text-right font-medium">Kredit</th>
                        <th className="px-4 py-3 text-center font-medium">Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                Memuat...
                            </td>
                        </tr>
                    ) : entries.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                Tidak ada data jurnal
                            </td>
                        </tr>
                    ) : (
                        entries.map(entry => (
                            <tr key={entry.id} className="border-b hover:bg-muted/50">
                                <td className="px-4 py-3">{formatDate(entry.date)}</td>
                                <td className="px-4 py-3 font-mono text-xs">{entry.reference || '-'}</td>
                                <td className="px-4 py-3">{entry.description}</td>
                                <td className="px-4 py-3 text-center">
                                    <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                                        {entry.status === 'posted' ? (
                                            <><CheckCircle className="h-3 w-3 mr-1"/> Posted</>
                                        ) : (
                                            <><XCircle className="h-3 w-3 mr-1"/> Draft</>
                                        )}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">
                                    {formatCurrency(entry.total_debit || 0)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono">
                                    {formatCurrency(entry.total_credit || 0)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-1">
                                        {entry.status === 'draft' ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePost(entry.id)}
                                                disabled={actionLoading === entry.id}
                                                title="Post"
                                            >
                                                <CheckCircle className="h-4 w-4 text-green-600"/>
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUnpost(entry.id)}
                                                disabled={actionLoading === entry.id}
                                                title="Unpost"
                                            >
                                                <RotateCcw className="h-4 w-4 text-orange-600"/>
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteId(entry.id)}
                                            disabled={actionLoading === entry.id}
                                            title="Hapus"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600"/>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                    {!loading && entries.length > 0 && (
                        <tfoot className="bg-muted/30 font-medium">
                        <tr>
                            <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalDebit)}</td>
                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalCredit)}</td>
                            <td/>
                        </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Jurnal</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={!!actionLoading}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
