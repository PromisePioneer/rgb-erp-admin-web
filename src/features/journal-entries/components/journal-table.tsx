"use client"
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Trash2, RotateCcw, RefreshCw, Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useJournalStore, type JournalEntry } from '../store/journal-store'
import { JournalFormModal } from './journal-form-modal'

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

function getEntryTotals(entry: JournalEntry) {
  const totalDebit = entry.lines?.reduce((sum, line) => sum + Number(line.debit || 0), 0) || 0
  const totalCredit = entry.lines?.reduce((sum, line) => sum + Number(line.credit || 0), 0) || 0
  return { totalDebit, totalCredit }
}

export function JournalEntriesTable() {
  const { items: entries, isLoading, isSubmitting, fetchEntries, postEntry, unpostEntry, deleteEntry, setFilters, filters } = useJournalStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setFilters({ ...filters, status: value })
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    setFilters({ ...filters, start_date: value })
  }

  const handleEndDateChange = (value: string) => {
    setEndDate(value)
    setFilters({ ...filters, end_date: value })
  }

  const handlePost = async (id: number) => {
    try {
      await postEntry(id)
    } catch (e) {
      console.error('Failed to post:', e)
    }
  }

  const handleUnpost = async (id: number) => {
    try {
      await unpostEntry(id)
    } catch (e) {
      console.error('Failed to unpost:', e)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteEntry(deleteId)
      setDeleteId(null)
    } catch (e) {
      console.error('Failed to delete:', e)
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditEntry(entry)
    setFormModalOpen(true)
  }

  const handleAddNew = () => {
    setEditEntry(null)
    setFormModalOpen(true)
  }

  const handleModalClose = () => {
    setFormModalOpen(false)
    setEditEntry(null)
  }

  // Ensure entries is an array
  const safeEntries = Array.isArray(entries) ? entries : []
  const totalDebit = safeEntries.reduce((sum, e) => sum + getEntryTotals(e).totalDebit, 0)
  const totalCredit = safeEntries.reduce((sum, e) => sum + getEntryTotals(e).totalCredit, 0)

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daftar Jurnal Umum</h2>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jurnal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select value={statusFilter} onValueChange={v => v && handleStatusChange(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
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
          onChange={e => handleStartDateChange(e.target.value)}
          className="w-40"
        />
        <span className="text-muted-foreground">s/d</span>
        <Input
          type="date"
          value={endDate}
          onChange={e => handleEndDateChange(e.target.value)}
          className="w-40"
        />
        <Button variant="outline" size="sm" onClick={() => fetchEntries()}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat...
                </td>
              </tr>
            ) : safeEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data jurnal
                </td>
              </tr>
            ) : (
              safeEntries.map(entry => {
                const { totalDebit, totalCredit } = getEntryTotals(entry)
                const isDraft = entry.status === 'draft'
                return (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{entry.reference || '-'}</td>
                    <td className="px-4 py-3">{entry.description}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                        {entry.status === 'posted' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Posted</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Draft</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(totalDebit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(totalCredit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        {isDraft && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePost(entry.id)}
                              disabled={isSubmitting}
                              title="Post"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          </>
                        )}
                        {!isDraft && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnpost(entry.id)}
                            disabled={isSubmitting}
                            title="Unpost"
                          >
                            <RotateCcw className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(entry.id)}
                          disabled={isSubmitting}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {!isLoading && safeEntries.length > 0 && (
            <tfoot className="bg-muted/30 font-medium">
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalDebit)}</td>
                <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalCredit)}</td>
                <td />
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
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <JournalFormModal
        open={formModalOpen}
        onClose={handleModalClose}
        editEntry={editEntry}
      />
    </div>
  )
}
