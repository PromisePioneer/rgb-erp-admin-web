/**
 * Schedules Toolbar Component
 * Import/Export buttons with queue-based import progress
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Download, Upload, FileDown, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { schedulesApi } from '../api/schedules-api'

interface SchedulesToolbarProps {
  currentMonth: string
  onRefresh: () => void
}

export function SchedulesToolbar({ currentMonth, onRefresh }: SchedulesToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  // Dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [existingCount, setExistingCount] = useState(0)

  // Import state - use string to track job ID, null when not importing
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Use ref for toast ID to persist across renders
  const toastIdRef = useRef<string | number | null>(null)

  const getYearMonth = () => {
    const monthStr = currentMonth || new Date().toISOString().substring(0, 7)
    const [year, month] = monthStr.split('-').map(Number)
    return { year, month }
  }

  // Cleanup toast on unmount
  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }
    }
  }, [])

  // Poll for job status
  useEffect(() => {
    // If no job ID, don't poll
    if (!currentJobId) return

    let intervalId: ReturnType<typeof setInterval> | null = null

    const poll = async () => {
      try {
        const result = await schedulesApi.getImportStatus(currentJobId)
        const data = result.data

        // Check again after API call - job might have been cancelled
        if (!currentJobId) return

        if (data.status === 'completed') {
          // Clear interval immediately
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          // Stop polling by clearing job ID
          setCurrentJobId(null)
          // Show success toast
          toast.success(
            `Import selesai! ${data.created} dibuat, ${data.updated} diupdate${data.errors > 0 ? `, ${data.errors} error` : ''}`,
            { id: toastIdRef.current ?? undefined }
          )
          toastIdRef.current = null
          // Refresh data
          onRefresh()
        } else if (data.status === 'failed') {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          setCurrentJobId(null)
          toast.error(`Import gagal: ${data.message}`, { id: toastIdRef.current ?? undefined })
          toastIdRef.current = null
        } else {
          // Still processing - update toast
          if (toastIdRef.current) {
            toast.loading(data.message, { id: toastIdRef.current })
          }
        }
      } catch (err) {
        console.error('Failed to poll import status:', err)
        // Only stop on network error, not on API error
      }
    }

    // Start polling immediately
    poll()
    intervalId = setInterval(poll, 1500)

    // Cleanup function - runs when currentJobId changes or component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [currentJobId, onRefresh])

  const startImport = useCallback(async (file: File, year: number, month: number, clearFirst: boolean = false) => {
    setShowConfirmDialog(false)

    try {
      // Clear existing schedules if needed
      if (clearFirst) {
        await schedulesApi.clearMonth(year, month)
      }

      // Start import (returns job_id)
      const result = await schedulesApi.importSchedules(file, year, month)
      setCurrentJobId(result.data.job_id)

      // Show initial toast
      toastIdRef.current = toast.loading('Memulai import jadwal...')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal import jadwal'
      toast.error(errorMessage)
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { year, month } = getYearMonth()

    // Check existing schedules first
    try {
      const existing = await schedulesApi.checkExisting(year, month)
      setExistingCount(existing.data.count)
      setPendingFile(file)

      if (existing.data.has_existing) {
        setShowConfirmDialog(true)
      } else {
        await startImport(file, year, month, false)
      }
    } catch {
      toast.error('Gagal check existing schedules')
      setPendingFile(null)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConfirmReplace = async () => {
    const file = pendingFile
    if (!file) return

    const { year, month } = getYearMonth()
    await startImport(file, year, month, true)
  }

  const handleCancelImport = () => {
    setShowConfirmDialog(false)
    setPendingFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownloadTemplate = async () => {
    const { year, month } = getYearMonth()
    setIsDownloadingTemplate(true)
    try {
      await schedulesApi.downloadTemplate({ year, month })
      toast.success('Template berhasil didownload')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal download template')
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleExport = async () => {
    const { year, month } = getYearMonth()
    setIsExporting(true)
    try {
      await schedulesApi.exportSchedules({ year, month })
      toast.success('Export berhasil')
    } catch {
      toast.error('Gagal export jadwal')
    } finally {
      setIsExporting(false)
    }
  }

  // Check if currently importing
  const isImporting = currentJobId !== null

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Left side - Refresh */}
        <Button variant="outline" size="sm" onClick={onRefresh} className="h-9">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>

        {/* Right side - Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="h-9"
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloadingTemplate ? 'Memuat...' : 'Template'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="h-9"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            {isImporting ? 'Mengimport...' : 'Import'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="h-9"
          >
            <FileDown className="h-4 w-4 mr-1" />
            {isExporting ? 'Meng-export...' : 'Export'}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />
      </div>

      {/* replace Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && handleCancelImport()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwal Sudah Ada</DialogTitle>
            <DialogDescription>
              Sudah ada {existingCount} jadwal di bulan tersebut. Import akan menimpa jadwal yang sudah ada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelImport}>
              Batal
            </Button>
            <Button onClick={handleConfirmReplace}>
              Ya, Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
