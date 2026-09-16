/**
 * Schedules Toolbar Component
 * Import/Export buttons with queue-based import progress
 */
import {useRef, useState, useEffect, useCallback} from 'react'
import {Download, Upload, FileDown, RefreshCw, FileSpreadsheet} from 'lucide-react'
import {toast} from 'sonner'
import {Button} from '@/components/ui/button'
import Dialog, {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {schedulesApi} from '../api/schedules-api'
import {clientsApi} from '@/features/clients/api/clients-api'
import {areasApi} from '@/features/areas/api/areas-api'
import {useSchedulesStore} from '../store/schedules-store'
import {useTranslation} from '@/hooks/use-translation'

interface SchedulesToolbarProps {
    currentMonth: string
    onRefresh: () => void
}

export function SchedulesToolbar({currentMonth, onRefresh}: SchedulesToolbarProps) {
    const {t} = useTranslation()
    const {selectedClientId, selectedAreaId} = useSchedulesStore()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

    // Template Dialog state
    const [showTemplateDialog, setShowTemplateDialog] = useState(false)
    const [templateMonth, setTemplateMonth] = useState<string>(currentMonth || new Date().toISOString().substring(0, 7))
    const [templateClientId, setTemplateClientId] = useState<number | null>(null)
    const [templateAreaId, setTemplateAreaId] = useState<number | null>(null)

    // Dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [existingCount, setExistingCount] = useState(0)

    // Import state
    const [currentJobId, setCurrentJobId] = useState<string | null>(null)
    const pollingJobIdRef = useRef<string | null>(null)

    // Client options loader for AsyncSelect
    const loadClientOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
        const result = await clientsApi.getSelectOptions({q: search})
        return result.data.map((item) => ({
            value: item.id,
            label: item.text || item.name,
        }))
    }, [])

    // Area options loader for AsyncSelect (filtered by client)
    const loadAreaOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
        const params: { client_id?: number; q?: string } = {}
        if (templateClientId) {
            params.client_id = templateClientId
        }
        if (search) {
            params.q = search
        }
        const result = await areasApi.getSelectOptions(params)
        return result.data.map((item) => ({
            value: item.id,
            label: item.text || item.name,
        }))
    }, [templateClientId])

    // Use ref for toast ID to persist across renders
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

        // Store the jobId being polled in a ref
        pollingJobIdRef.current = currentJobId

        let intervalId: ReturnType<typeof setInterval> | null = null

        const poll = async () => {
            try {
                const result = await schedulesApi.getImportStatus(currentJobId)
                const data = result.data

                // Check if this is still the current job
                if (pollingJobIdRef.current !== currentJobId) return

                if (data.status === 'completed') {
                    if (intervalId) clearInterval(intervalId)
                    if (toastIdRef.current) {
                        toast.dismiss(toastIdRef.current)
                        toastIdRef.current = null
                    }
                    toast.success(`Import berhasil! ${data.created} jadwal dibuat, ${data.updated} diupdate.`)
                    pollingJobIdRef.current = null
                    setCurrentJobId(null)
                    onRefresh()
                } else if (data.status === 'failed') {
                    if (intervalId) clearInterval(intervalId)
                    if (toastIdRef.current) {
                        toast.dismiss(toastIdRef.current)
                        toastIdRef.current = null
                    }
                    toast.error(`Import gagal: ${data.message}`)
                    pollingJobIdRef.current = null
                    setCurrentJobId(null)
                } else {
                    if (toastIdRef.current) {
                        toast.loading(data.message, {id: toastIdRef.current})
                    }
                }
            } catch {
                // Silently ignore polling errors
            }
        }

        intervalId = setInterval(poll, 2000)
        poll() // Immediate first poll

        return () => {
            if (intervalId) clearInterval(intervalId)
            pollingJobIdRef.current = null
        }
    }, [currentJobId]) // Only depend on currentJobId

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
            const errorMessage = err instanceof Error ? err.message : t('import_failed', {message: 'Unknown error'})
            toast.error(errorMessage)
        }
    }, [t])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!templateMonth || !templateClientId || !templateAreaId) {
            toast.error(t('fill_all_template_fields'))
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        const [year, month] = templateMonth.split('-').map(Number)

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

        if (!templateMonth) return
        const [year, month] = templateMonth.split('-').map(Number)

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
        if (!templateMonth || !templateClientId || !templateAreaId) {
            toast.error(t('fill_all_template_fields'))
            return
        }

        const [year, month] = templateMonth.split('-').map(Number)

        setIsDownloadingTemplate(true)
        try {
            await schedulesApi.downloadTemplate({
                year,
                month,
                client_id: templateClientId ?? undefined,
                area_id: templateAreaId ?? undefined,
            })
            toast.success(t('template_downloaded'))
            setShowTemplateDialog(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('import_failed', {message: 'Template error'}))
        } finally {
            setIsDownloadingTemplate(false)
        }
    }

    const handleOpenTemplateDialog = () => {
        // Reset state when opening
        setTemplateClientId(selectedClientId)
        setTemplateAreaId(selectedAreaId)
        setTemplateMonth(currentMonth || new Date().toISOString().substring(0, 7))
        setShowTemplateDialog(true)
    }

    const handleOpenImportFile = () => {
        if (!templateClientId || !templateAreaId || !templateMonth) {
            toast.error(t('fill_all_template_fields'))
            return
        }
        fileInputRef.current?.click()
    }

    const handleExport = async () => {
        const [year, month] = (currentMonth || new Date().toISOString().substring(0, 7)).split('-').map(Number)
        setIsExporting(true)
        try {
            await schedulesApi.exportSchedules({year, month})
            toast.success(t('template_downloaded'))
        } catch {
            toast.error(t('import_failed', {message: 'Export error'}))
        } finally {
            setIsExporting(false)
        }
    }

    const handleRefresh = async () => {
        onRefresh()
    }

    const isImporting = currentJobId !== null

    const isFormValid = templateMonth && templateClientId && templateAreaId

    // Privilege checks
    const canAddSchedule = true
    const canViewSchedule = true

    return (
        <div className="flex items-center justify-between gap-4 mb-4">
            {/* Left side - Refresh */}
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9" disabled={isImporting}>
                <RefreshCw className="h-4 w-4 mr-1"/>
                {isImporting ? t('refreshing') : t('refresh')}
            </Button>

            {/* Right side - Action buttons */}
            <div className="flex gap-2">
                {canAddSchedule && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenTemplateDialog}
                        disabled={isImporting}
                        className="h-9"
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-1"/>
                        Template
                    </Button>
                )}

                {canViewSchedule && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting || isImporting}
                        className="h-9"
                    >
                        <FileDown className="h-4 w-4 mr-1"/>
                        {isExporting ? t('exporting') : t('export_schedule')}
                    </Button>
                )}
            </div>

            {/* Template Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="max-w-md" style={{width: '900px', maxWidth: '95vw'}}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5"/>
                            Template Jadwal
                        </DialogTitle>
                        <DialogDescription>
                            Pilih bulan, klien, dan area untuk mengunduh template jadwal karyawan di area tersebut.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Month Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bulan</label>
                            <Input
                                type="month"
                                value={templateMonth}
                                onChange={(e) => setTemplateMonth(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Client Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Klien</label>
                            <AsyncSelect
                                value={templateClientId}
                                onChange={(value) => {
                                    setTemplateClientId(value as number | null)
                                    setTemplateAreaId(null) // Reset area when client changes
                                }}
                                loadOptions={loadClientOptions}
                                placeholder="Pilih klien..."
                                className="w-full"
                            />
                        </div>

                        {/* Area Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Area</label>
                            <AsyncSelect
                                key={`area-${templateClientId}`}
                                value={templateAreaId}
                                onChange={(value) => setTemplateAreaId(value as number | null)}
                                loadOptions={loadAreaOptions}
                                placeholder={templateClientId ? "Pilih area..." : "Pilih klien terlebih dahulu..."}
                                isDisabled={!templateClientId}
                                className="w-full"
                            />
                        </div>

                        {/* Info note */}
                        <div
                            className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                            <span className="text-amber-500">ℹ️</span>
                            <span>Isi kode shift: P=Pagi, M=Malam, MD=Siang, O=Off</span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                            Batal
                        </Button>
                        {canAddSchedule && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleOpenImportFile}
                                    disabled={!isFormValid}
                                    className="gap-1"
                                >
                                    <Upload className="h-4 w-4"/>
                                    Import Excel
                                </Button>
                                <Button
                                    onClick={handleDownloadTemplate}
                                    disabled={!isFormValid || isDownloadingTemplate}
                                    className="gap-1"
                                >
                                    <Download className="h-4 w-4"/>
                                    {isDownloadingTemplate ? 'Mengunduh...' : 'Download Template'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="hidden"
            />

            {/* Replace Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && handleCancelImport()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('schedule_already_exists')}</DialogTitle>
                        <DialogDescription>
                            {t('schedule_already_exists_desc', {count: existingCount})}
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
        </div>
    )
}
