/**
 * Schedules Toolbar Component
 * Filters + Import/Export buttons
 */
import { useRef, useState } from 'react'
import { Download, Upload, FileDown, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSchedulesStore } from '../store/schedules-store'
import { schedulesApi } from '../api/schedules-api'

export function SchedulesToolbar() {
  const { fetchCalendarData, calendarDates } = useSchedulesStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  // Get current year/month from calendar dates or default to current
  const getCurrentYearMonth = () => {
    const now = new Date()
    if (calendarDates.length > 0) {
      const [year, month] = calendarDates[0].split('-')
      return { year: parseInt(year), month: parseInt(month) }
    }
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  }

  const handleDownloadTemplate = async () => {
    const { year, month } = getCurrentYearMonth()
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

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { year, month } = getCurrentYearMonth()
    setIsImporting(true)

    try {
      const result = await schedulesApi.importSchedules(file, year, month)
      toast.success(result.message || 'Import berhasil')
      // Refresh calendar data
      await fetchCalendarData({ month: `${year}-${String(month).padStart(2, '0')}` })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const errorMessage =
        error?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Gagal import jadwal')
      toast.error(errorMessage)
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExport = async () => {
    const { year, month } = getCurrentYearMonth()
    setIsExporting(true)
    try {
      await schedulesApi.exportSchedules({ year, month })
      toast.success('Export berhasil')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal export jadwal')
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = async () => {
    const { year, month } = getCurrentYearMonth()
    await fetchCalendarData({ month: `${year}-${String(month).padStart(2, '0')}` })
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      {/* Left side: Refresh button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        className="h-9"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>

      {/* Right side: Import/Export buttons */}
      <div className="flex items-center gap-2">
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
          onClick={handleImportClick}
          disabled={isImporting}
          className="h-9"
        >
          <Upload className="h-4 w-4 mr-1" />
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

        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />
      </div>
    </div>
  )
}
