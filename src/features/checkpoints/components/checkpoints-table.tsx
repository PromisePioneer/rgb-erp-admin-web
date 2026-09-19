/**
 * Checkpoints Table Component
 * Full CRUD with DataTable and modal form
 */
import {useEffect, useCallback, useState, useRef} from 'react'
import {Plus, Trash2, MapPin, Key, QrCodeIcon, Printer, Loader2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {DataTable, type DataTableColumn} from '@/components/ui/data-table'
import {useCheckpointsStore} from '@/features/checkpoints'
import {CheckpointsFilters} from './checkpoints-filters'
import {CheckpointsFormModal} from '@/features/checkpoints'
import type {Checkpoint} from '@/features/checkpoints'
import {toast} from 'sonner'
import {apiClient} from "@/lib/api-client.ts";
import {QRCodeSVG} from 'qrcode.react'

interface QRData {
    qr_content: string
    checkpoint: {
        id: number
        code: string
        name: string
        area_name?: string
        client_name?: string
        has_secret?: boolean
        lat?: number
        lng?: number
        sequence_order?: number
        radius_meters?: number
    }
}

export function CheckpointsTable() {
    const {
        items,
        isLoading,
        pagination,
        fetchCheckpoints,
        filters,
        bulkDelete,
        isSubmitting,
    } = useCheckpointsStore()

    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null)

    // QR Preview Modal State
    const [showQRModal, setShowQRModal] = useState(false)
    const [qrCheckpoint, setQrCheckpoint] = useState<QRData | null>(null)
    const [isLoadingQR, setIsLoadingQR] = useState(false)
    const qrPrintRef = useRef<HTMLDivElement>(null)

    // Fetch QR data for a checkpoint
    const fetchQRData = useCallback(async (checkpoint: Checkpoint) => {
        setIsLoadingQR(true)
        setShowQRModal(true)
        try {
            const {data} = await apiClient.get<{
                success: boolean
                data: QRData
            }>(`/admin/checkpoints/${checkpoint.id}/qr`)

            if (data.success) {
                setQrCheckpoint(data.data)
            } else {
                toast.error('Failed to load QR data')
                setShowQRModal(false)
            }
        } catch {
            toast.error('Failed to fetch QR code')
            setShowQRModal(false)
        } finally {
            setIsLoadingQR(false)
        }
    }, [])

    // Handle view QR details
    const handleViewQR = useCallback((checkpoint: Checkpoint) => {
        fetchQRData(checkpoint)
    }, [fetchQRData])

    // Single source of truth for fetch - debounced, primitive dependencies
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCheckpoints({
                search: filters.search,
                area_id: filters.area_id,
                status: filters.status,
                page: 1,
                per_page: 15,
            })
        }, 300)
        return () => clearTimeout(timer)
    }, [filters.search, filters.area_id, filters.status])

    // Reset selection when data changes
    useEffect(() => {
        setSelectedIds((prev) => {
            const newSelection = new Set<number | string>()
            prev.forEach((id) => {
                if (items.some((item) => item.id === id)) {
                    newSelection.add(id)
                }
            })
            return newSelection
        })
    }, [items])

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage < 1 || newPage > pagination.last_page) return
        fetchCheckpoints({...filters, page: newPage})
    }, [fetchCheckpoints, filters, pagination.last_page])

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        setIsDeleting(true)
        try {
            await bulkDelete(Array.from(selectedIds).map(Number))
            toast.success(`Deleted ${selectedIds.size} checkpoints`)
            setSelectedIds(new Set())
            setShowDeleteConfirm(false)
        } catch {
            toast.error('Failed to delete checkpoints')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleEdit = (checkpoint: Checkpoint) => {
        setEditingCheckpoint(checkpoint)
        setShowFormModal(true)
    }

    const handleAddNew = () => {
        setEditingCheckpoint(null)
        setShowFormModal(true)
    }

    const handleCloseModal = () => {
        setShowFormModal(false)
        setEditingCheckpoint(null)
    }

    // Print QR code
    const handlePrintQR = () => {
        if (!qrPrintRef.current) return

        const printContent = qrPrintRef.current.innerHTML
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            toast.error('Failed to open print window')
            return
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Print QR Code - ${qrCheckpoint?.checkpoint?.code}</title>
                <style>
                    @page { size: 100mm 150mm; margin: 0; }
                    body {
                        margin: 0;
                        padding: 10px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        font-family: Arial, sans-serif;
                    }
                    .qr-container {
                        text-align: center;
                        border: 2px solid #000;
                        padding: 15px;
                        width: 80mm;
                    }
                    .qr-code { margin: 10px 0; }
                    .checkpoint-name {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .checkpoint-code {
                        font-size: 12px;
                        font-family: monospace;
                    }
                    .instructions {
                        font-size: 10px;
                        margin-top: 10px;
                        color: #666;
                    }
                </style>
            </head>
            <body>${printContent}</body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
    }

    // Download QR code
    const handleDownloadQR = () => {
        if (!qrPrintRef.current) return

        // Create canvas from SVG
        const svg = qrPrintRef.current.querySelector('svg')
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        canvas.width = 300
        canvas.height = 300

        img.onload = () => {
            if (ctx) {
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0, 300, 300)
            }

            const link = document.createElement('a')
            link.download = `QR-${qrCheckpoint?.checkpoint?.code}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
            toast.success('QR code downloaded')
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }

    // Print all QR codes for current area/filter
    const handlePrintAllQRs = async () => {
        if (items.length === 0) {
            toast.error('No checkpoints to print')
            return
        }

        // Fetch all checkpoints with QR data
        toast.promise(
            (async () => {
                const checkpointsWithQR = await Promise.all(
                    items
                        .filter(cp => cp.has_secret_key)
                        .map(async (cp) => {
                            try {
                                const {data} = await apiClient.get<{
                                    success: boolean,
                                    data: { qr_content: string, checkpoint: { code: string, name: string } }
                                }>(`/admin/checkpoints/${cp.id}/qr`)
                                return data.data
                            } catch {
                                return null
                            }
                        })
                )

                const validQRCodes = checkpointsWithQR.filter(Boolean)

                if (validQRCodes.length === 0) {
                    throw new Error('No checkpoints with QR codes found')
                }

                // Generate print HTML
                const qrCardsHtml = validQRCodes.map((qr, index) => `
                    <div class="qr-card" ${index % 2 === 1 ? 'style="page-break-before: always;"' : ''}>
                        <div class="qr-inner">
                            <p class="checkpoint-name">${qr?.checkpoint?.name}</p>
                            <svg class="qr-svg" data-value='${qr?.qr_content}'></svg>
                            <p class="checkpoint-code">${qr?.checkpoint?.code}</p>
                        </div>
                    </div>
                `).join('')

                const printWindow = window.open('', '_blank')
                if (!printWindow) throw new Error('Failed to open print window')

                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <title>Print All QR Codes</title>
                        <style>
                            @page { size: A4; margin: 10mm; }
                            body {
                                margin: 0;
                                padding: 10px;
                                font-family: Arial, sans-serif;
                            }
                            .qr-grid {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 10px;
                            }
                            .qr-card {
                                width: 70mm;
                                height: 90mm;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1px solid #ccc;
                                page-break-inside: avoid;
                            }
                            .qr-inner {
                                text-align: center;
                                padding: 5px;
                            }
                            .checkpoint-name {
                                font-size: 11px;
                                font-weight: bold;
                                margin-bottom: 5px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }
                            .qr-svg {
                                width: 55mm;
                                height: 55mm;
                            }
                            .checkpoint-code {
                                font-size: 9px;
                                font-family: monospace;
                                margin-top: 3px;
                            }
                            @media print {
                                .qr-card { border: 1px solid #000; }
                            }
                        </style>
                    </head>
                    <body>
                        <h3 style="text-align: center; margin-bottom: 10px;">QR Codes - ${new Date().toLocaleDateString('id-ID')}</h3>
                        <div class="qr-grid">${qrCardsHtml}</div>
                        <script src="https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js"><\/script>
                        <script>
                            document.querySelectorAll('.qr-svg').forEach(svg => {
                                const value = svg.dataset.value;
                                if (value) {
                                    const canvas = document.createElement('canvas');
                                    QRCode.toCanvas(canvas, value, { width: 220, margin: 1 });
                                    svg.replaceWith(canvas);
                                }
                            });
                            window.onload = () => { window.print(); }
                        <\/script>
                    </body>
                    </html>
                `)
                printWindow.document.close()
            })(),
            {
                loading: 'Preparing QR codes...',
                success: 'Print dialog opened',
                error: 'Failed to prepare QR codes'
            }
        )
    }

    // Define columns
    const columns: DataTableColumn<Checkpoint>[] = [
        {
            accessorKey: 'code',
            header: 'Code',
            cell: (row) => (
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {row.code}
                </code>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.name}</span>
                    <span className="text-xs text-muted-foreground">{row.area_name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'sequence_order',
            header: 'Seq',
            cell: (row) => (
                <span className="text-muted-foreground">{row.sequence_order}</span>
            ),
        },
        {
            accessorKey: 'lat',
            header: 'Location',
            cell: (row) => (
                <div className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3 text-muted-foreground"/>
                    <span className="font-mono">
            {row.lat}, {row.lng}
          </span>
                </div>
            ),
        },
        {
            accessorKey: 'radius_meters',
            header: 'Radius',
            cell: (row) => (
                <span className="text-muted-foreground text-sm">
          {row.radius_meters ? `${row.radius_meters}m` : '-'}
        </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (row) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </span>
            ),
        },
        {
            accessorKey: 'has_secret_key',
            header: 'OTP',
            cell: (row) => (
                row.has_secret_key ? (
                    <span className="inline-flex items-center gap-1 text-green-600" title="Requires OTP">
                        <Key className="h-3 w-3"/>
                        <span className="text-xs">Yes</span>
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">No</span>
                )
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: (row) => (
                <span className="text-muted-foreground text-sm">
          {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
        </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleViewQR(row)
                        }}
                        title="View QR Code"
                    >
                        <QrCodeIcon className="h-4 w-4 text-blue-600"/>
                    </Button>
                </div>
            ),
        },
    ]

    // Bulk actions
    const bulkActions = (
        <div className="flex gap-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedIds.size === 0}
            >
                <Trash2 className="h-4 w-4 mr-1"/>
                Delete ({selectedIds.size})
            </Button>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <CheckpointsFilters/>
                <div className="flex gap-2">
                    <Button onClick={handlePrintAllQRs} variant="outline">
                        <Printer className="h-4 w-4 mr-2"/>
                        Print All QR
                    </Button>
                    <Button onClick={handleAddNew}>
                        <Plus className="h-4 w-4 mr-1"/>
                        Add Checkpoint
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={items}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                emptyMessage="No checkpoints found"
                enableRowSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                bulkActions={bulkActions}
                onRowClick={handleEdit}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Checkpoints</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.size} checkpoint(s)?
                            Checkpoints with existing scan records will be deactivated instead of deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting || isSubmitting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* QR Code Preview Modal */}
            <AlertDialog open={showQRModal} onOpenChange={setShowQRModal}>
                <AlertDialogContent className="sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <QrCodeIcon className="h-5 w-5"/>
                            Detail QR Code
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Scan QR ini dengan aplikasi patroli mobile untuk melakukanabsen di checkpoint ini
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        {isLoadingQR ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                <p className="mt-2 text-sm text-muted-foreground">Memuat data QR...</p>
                            </div>
                        ) : qrCheckpoint ? (
                            <div className="space-y-4">
                                {/* QR Code Display */}
                                <div ref={qrPrintRef} className="qr-print-area">
                                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-b from-gray-50 to-white">
                                        {/* Header */}
                                        <div className="mb-4">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                {qrCheckpoint.checkpoint.client_name || qrCheckpoint.checkpoint.area_name || 'Unknown Area'}
                                            </p>
                                            <p className="font-bold text-xl mt-1">{qrCheckpoint.checkpoint.name}</p>
                                        </div>

                                        {/* QR Code */}
                                        <div className="inline-block p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                            <QRCodeSVG
                                                value={qrCheckpoint.qr_content}
                                                size={200}
                                                level="M"
                                                includeMargin={true}
                                            />
                                        </div>

                                        {/* Code */}
                                        <p className="font-mono text-sm mt-4 font-semibold bg-muted px-3 py-1.5 rounded-md inline-block">
                                            {qrCheckpoint.checkpoint.code}
                                        </p>

                                        {/* Instructions */}
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Scan dengan aplikasi patroli mobile
                                        </p>
                                    </div>
                                </div>

                                {/* QR Content Info */}
                                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Informasi QR</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Kode</p>
                                            <p className="font-mono font-medium">{qrCheckpoint.checkpoint.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Client</p>
                                            <p className="font-medium truncate">{qrCheckpoint.checkpoint.client_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">OTP</p>
                                            <p className={`font-medium ${qrCheckpoint.checkpoint.has_secret ? 'text-green-600' : 'text-gray-400'}`}>
                                                {qrCheckpoint.checkpoint.has_secret ? '✓ Aktif' : '✗ Nonaktif'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Area</p>
                                            <p className="font-medium truncate">{qrCheckpoint.checkpoint.area_name || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 justify-center">
                                    <Button onClick={handlePrintQR} variant="outline">
                                        <Printer className="h-4 w-4 mr-2"/>
                                        Print QR
                                    </Button>
                                    <Button onClick={handleDownloadQR} variant="outline">
                                        <QrCodeIcon className="h-4 w-4 mr-2"/>
                                        Download PNG
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <QrCodeIcon className="h-12 w-12 mb-2 opacity-20"/>
                                <p>Gagal memuat QR code</p>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowQRModal(false)
                            setQrCheckpoint(null)
                        }}>
                            Tutup
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Form Modal */}
            <CheckpointsFormModal
                checkpoint={editingCheckpoint}
                open={showFormModal}
                onOpenChange={handleCloseModal}
            />
        </div>
    )
}
