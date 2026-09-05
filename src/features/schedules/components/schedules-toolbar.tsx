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
import { useTranslation } from '@/hooks/use-translation'

interface SchedulesToolbarProps {
  currentMonth: string
  onRefresh: () => void
}

export function SchedulesToolbar({ currentMonth, onRefresh }: SchedulesToolbarProps) {
  const { t } = useTranslation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  // Dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [existingCount, setExistingCount] = useState(0)

  // Import state
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
    if (!currentJobId) return

    let intervalId: ReturnType<typeof setInterval> | null = null

    const poll = async () => {
      try {
        const result = await schedulesApi.getImportStatus(currentJobId)
        const data = result.data

        if (!currentJobId) return

        if (data.status === 'completed') {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          setCurrentJobId(null)
          toast.success(
            t('import_success', { created: data.created, updated: data.updated }),
            { id: toastIdRef.current ?? undefined }
          )
          toastIdRef.current = null
          onRefresh()
        } else if (data.status === 'failed') {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          setCurrentJobId(null)
          toast.error(
            t('import_failed', { message: data.message }),
            { id: toastIdRef.current ?? undefined }
          )
          toastIdRef.current = null
        } else {
          if (toastIdRef.current) {
            toast.loading(data.message, { id: toastIdRef.current })
          }
        }
      } catch (err) {
        console.error('Failed to poll import status:', err)
      }
    }

    poll()
    intervalId = setInterval(poll, 1500)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [currentJobId, onRefresh, t])

  const startImport = useCallback(async (file: File, year: number, month: number, clearFirst: boolean = false) => {
    setShowConfirmDialog(false)

    try {
      if (clearFirst) {
        await schedulesApi.clearMonth(year, month)
      }

      const result = await schedulesApi.importSchedules(file, year, month)
      setCurrentJobId(result.data.job_id)

      toastIdRef.current = toast.loading(t('import_started'))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('import_failed', { message: 'Unknown error' })
      toast.error(errorMessage)
    }
  }, [t])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { year, month } = getYearMonth()

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
      toast.success(t('template_downloaded'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('import_failed', { message: 'Template error' }))
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleExport = async () => {
    const { year, month } = getYearMonth()
    setIsExporting(true)
    try {
      await schedulesApi.exportSchedules({ year, month })
      toast.success(t('template_downloaded'))
    } catch {
      toast.error(t('import_failed', { message: 'Export error' }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = async () => {
    onRefresh()
  }

  const isImporting = currentJobId !== null

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Left side - Refresh */}
        <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9" disabled={isImporting}>
          <RefreshCw className="h-4 w-4 mr-1" />
          {isImporting ? t('refreshing') : t('refresh')}
        </Button>

        {/* Right side - Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate || isImporting}
            className="h-9"
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloadingTemplate ? t('downloading_template') : t('download_template')}
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
            {isImporting ? t('importing') : t('import_schedule')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || isImporting}
            className="h-9"
          >
            <FileDown className="h-4 w-4 mr-1" />
            {isExporting ? t('exporting') : t('export_schedule')}
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

      {/* Replace Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && handleCancelImport()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('schedule_already_exists')}</DialogTitle>
            <DialogDescription>
              {t('schedule_already_exists_desc', { count: existingCount })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelImport}>
              {t('cancel')}
            </Button>
            <Button onClick={handleConfirmReplace}>
              {t('yes_replace')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
