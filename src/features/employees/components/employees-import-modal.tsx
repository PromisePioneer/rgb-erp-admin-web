/**
 * Import Employees Modal Component
 * Allows bulk import of employees from Excel/CSV file
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import AsyncSelect from '@/components/async-select'
import { employeesApi } from '../api/employees-api'
import { useEmployeesStore } from '../store/employees-store'
import { rolesApi } from '@/features/roles'

interface EmployeesImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ImportState = 'idle' | 'uploading' | 'success' | 'error'

export function EmployeesImportModal({ open, onOpenChange }: EmployeesImportModalProps) {
  const { fetchEmployees } = useEmployeesStore()
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<ImportState>('idle')
  const [importedCount, setImportedCount] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setFile(null)
    setState('idle')
    setImportedCount(0)
    setErrorMessage('')
    setSelectedRoleId(null)
  }, [])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        resetState()
      }
      onOpenChange(newOpen)
    },
    [onOpenChange, resetState]
  )

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'text/plain',
      ]
      const validExtensions = ['.xlsx', '.xls', '.csv', '.txt']

      const hasValidExtension = validExtensions.some((ext) =>
        selectedFile.name.toLowerCase().endsWith(ext)
      )

      if (!validTypes.includes(selectedFile.type) && !hasValidExtension) {
        toast.error('Format file tidak valid. Gunakan .xlsx, .xls, .csv, atau .txt')
        return
      }

      // Max 10MB
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 10MB')
        return
      }

      setFile(selectedFile)
      setState('idle')
      setErrorMessage('')
    }
  }, [])

  const handleDownloadTemplate = useCallback(() => {
    const templateUrl = employeesApi.getTemplateUrl()
    // Use direct fetch with credentials to download
    fetch(templateUrl, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to download template')
        }
        return response.blob()
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'employees-import-template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Template berhasil diunduh')
      })
      .catch(() => {
        toast.error('Gagal mengunduh template')
      })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        // Trigger the file input change
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(droppedFile)
          fileInputRef.current.files = dataTransfer.files
          // Manually trigger change event
          const event = new Event('change', { bubbles: true })
          fileInputRef.current.dispatchEvent(event)
        }
      }
    },
    []
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleImport = useCallback(async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu')
      return
    }

    setState('uploading')
    setErrorMessage('')

    try {
      const response = await employeesApi.import(file, selectedRoleId ?? undefined)
      setImportedCount(response.data.imported)
      setState('success')
      toast.success(response.data.message)

      // Refresh the employees list
      await fetchEmployees()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import gagal'
      setErrorMessage(message)
      setState('error')
      toast.error(message)
    }
  }, [file, selectedRoleId, fetchEmployees])

  // Load roles for dropdown
  const loadRoles = useCallback(async (search: string) => {
    const response = await rolesApi.getSelectOptions({ q: search })
    return response.data.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [])

  const handleClose = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Employees
          </DialogTitle>
          <DialogDescription>
            Import employees dari file Excel atau CSV. File harus memiliki kolom yang sesuai dengan template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Download template untuk format yang benar</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-1" />
              Template CSV
            </Button>
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <Label htmlFor="role-select">Role untuk User (opsional)</Label>
            <AsyncSelect
              id="role-select"
              value={selectedRoleId}
              onChange={(value) => setSelectedRoleId(value as number | null)}
              loadOptions={loadRoles}
              placeholder="Pilih role..."
            />
            <p className="text-xs text-muted-foreground">
              User account akan dibuat otomatis untuk setiap employee yang diimport
            </p>
          </div>

          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              state === 'error' || state === 'success'
                ? 'border-transparent'
                : file
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          >
            {state === 'uploading' ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Mengimport data...</p>
              </div>
            ) : state === 'success' ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm font-medium text-green-600">
                  {importedCount} employee(s) berhasil diimport
                </p>
              </div>
            ) : state === 'error' ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Pilih file lain
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop file di sini, atau{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline font-medium"
                  >
                    pilih file
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  Format: .xlsx, .xls, .csv, .txt (max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Column Info */}
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Kolom yang diperlukan:</p>
            <code className="block bg-muted p-2 rounded">
              code, name, phone, base_salary, ptkp_status, join_date, company, status
            </code>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {state === 'success' ? 'Tutup' : 'Batal'}
          </Button>
          {state !== 'success' && state !== 'uploading' && (
            <Button onClick={handleImport} disabled={!file}>
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
