/**
 * Daily Task Items Import Modal
 * Upload Excel/CSV file with queue-based import progress
 */
import { useRef, useState, useEffect } from 'react'
import { Download, Upload, X } from 'lucide-react'
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
import { dailyTaskItemsApi } from '../api/daily-task-items-api'

interface DailyTaskItemsImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DailyTaskItemsImportModal({ open, onOpenChange, onSuccess }: DailyTaskItemsImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const toastIdRef = useRef<string | number | null>(null)

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
        const result = await dailyTaskItemsApi.getImportStatus(currentJobId)
        const data = result.data

        if (!currentJobId) return

        if (data.status === 'completed') {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          setCurrentJobId(null)
          setIsImporting(false)

          // Clear import status from server
          await dailyTaskItemsApi.clearImportStatus(currentJobId).catch(() => {})

          toast.success(
            `Berhasil import ${data.imported} item. ${data.skipped > 0 ? `${data.skipped} di-skip.` : ''} ${data.errors > 0 ? `${data.errors} error.` : ''}`,
            { id: toastIdRef.current ?? undefined }
          )
          toastIdRef.current = null
          onSuccess?.()
          onOpenChange(false)
        } else if (data.status === 'failed') {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          setCurrentJobId(null)
          setIsImporting(false)
          toast.error(
            `Import gagal: ${data.message}`,
            { id: toastIdRef.current ?? undefined }
          )
          toastIdRef.current = null
        } else {
          // Still processing - update toast
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
  }, [currentJobId, onSuccess, onOpenChange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleStartImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)

    try {
      const result = await dailyTaskItemsApi.importItems(selectedFile)
      setCurrentJobId(result.data.job_id)
      toastIdRef.current = toast.loading('Memulai import...')
    } catch (err: unknown) {
      setIsImporting(false)
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat import'
      toast.error(errorMessage)
    }
  }

  const handleDownloadTemplate = () => {
    window.location.href = dailyTaskItemsApi.getTemplateUrl()
    toast.success('Template berhasil didownload')
  }

  const handleClose = () => {
    if (isImporting) return
    setSelectedFile(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Item Tugas Harian</DialogTitle>
          <DialogDescription>Upload file Excel atau CSV untuk import data item tugas harian</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="text-sm">
              <p className="font-medium">Download Template</p>
              <p className="text-muted-foreground">Unduh format file import</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} disabled={isImporting}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>

          {/* Upload File */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih File</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                selectedFile
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={isImporting}
              />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              {selectedFile ? (
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Klik atau drag file ke sini</p>
                  <p className="text-sm text-muted-foreground">Format: .xlsx, .xls, .csv</p>
                </div>
              )}
              {selectedFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSelectedFile(null)}
                  disabled={isImporting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              )}
            </div>
            {!selectedFile && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                <Upload className="h-4 w-4 mr-1" />
                Pilih File
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Batal
          </Button>
          <Button onClick={handleStartImport} disabled={!selectedFile || isImporting}>
            {isImporting ? 'Mengimport...' : 'Mulai Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
