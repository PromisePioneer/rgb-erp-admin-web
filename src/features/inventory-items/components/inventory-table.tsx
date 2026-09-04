/**
 * Inventory Items Table Component
 * Lists all inventory items with QR code tracking and movement history
 */
import {useEffect, useState, useCallback, useRef} from 'react'
import {Eye, QrCodeIcon, Printer, Download, History, User, Filter, X} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {DataTable, type DataTableColumn} from '@/components/ui/data-table'
import {AsyncSelect} from '@/components/async-select'
import {useInventoryStore} from '@/features/inventory-items'
import type {InventoryItem} from '../types/inventory-items.types'
import {QRCodeSVG} from 'qrcode.react'
import {apiClient} from '@/lib/api-client'
import {toast} from 'sonner'

// Types for movement history
interface ItemMovement {
    id: number
    action: string
    action_label: string
    action_color: string
    from_type: string | null
    from_id: number | null
    from_name: string | null
    to_type: string | null
    to_id: number | null
    to_name: string | null
    condition: string | null
    notes: string | null
    reference_type: string | null
    reference_id: string | null
    moved_by: string | null
    created_at: string
    created_at_human: string
}

// Detail Modal with QR Code and Movement History
function ItemDetailModal({
                             open,
                             onOpenChange,
                             item,
                             onPrint,
                             onDownload,
                         }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: InventoryItem | null
    onPrint: (item: InventoryItem) => void
    onDownload: (item: InventoryItem) => void
}) {
    const [qrContent, setQrContent] = useState<string | null>(null)
    const [isLoadingQR, setIsLoadingQR] = useState(false)
    const [movements, setMovements] = useState<ItemMovement[]>([])
    const [isLoadingMovements, setIsLoadingMovements] = useState(false)
    const [showMovements, setShowMovements] = useState(false)
    const qrPrintRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open && item) {
            loadQRContent(item.id)
            if (showMovements) {
                loadMovements(item.qr_code)
            }
        }
    }, [open, item, showMovements])

    const loadQRContent = async (id: number) => {
        setIsLoadingQR(true)
        try {
            const {data} = await apiClient.get<{
                success: boolean
                data: { qr_content: string }
            }>(`/admin/inventory-items/${id}/qr`)
            setQrContent(data.data.qr_content)
        } catch {
            toast.error('Failed to load QR code')
            setQrContent(null)
        } finally {
            setIsLoadingQR(false)
        }
    }

    const loadMovements = async (qrCode: string) => {
        setIsLoadingMovements(true)
        try {
            const {data} = await apiClient.get<{
                success: boolean
                data: ItemMovement[]
            }>(`/admin/inventory-items/${encodeURIComponent(qrCode)}/movements`)
            setMovements(data.data)
        } catch {
            toast.error('Failed to load movement history')
            setMovements([])
        } finally {
            setIsLoadingMovements(false)
        }
    }

    if (!item) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"
                           style={{width: '900px', maxWidth: '95vw'}}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCodeIcon className="h-5 w-5"/>
                        {item.product_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* QR Code Display */}
                    <div ref={qrPrintRef} className="qr-print-area">
                        <div className="text-center p-4 border-2 border-gray-200 rounded-lg bg-white">
                            <p className="font-bold text-lg mb-2">{item.product_name}</p>
                            {isLoadingQR ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : qrContent ? (
                                <>
                                    <div className="flex items-center justify-center p-8">
                                        <QRCodeSVG
                                            value={qrContent}
                                            size={200}
                                            level="M"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-mono">{qrContent}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Scan dengan aplikasi inventory
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted-foreground p-8">QR Code not available</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-center">
                        <Button onClick={() => onPrint(item)} variant="outline">
                            <Printer className="h-4 w-4 mr-2"/>
                            Print QR
                        </Button>
                        <Button onClick={() => onDownload(item)} variant="outline">
                            <Download className="h-4 w-4 mr-2"/>
                            Download
                        </Button>
                    </div>

                    {/* Info Grid */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status_color}`}>
                  {item.status_label}
                </span>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Kondisi</p>
                                {item.condition ? (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.condition_color}`}>
                                        {item.condition_label}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                            <div>
                                <p className="text-muted-foreground">Lokasi Sekarang</p>
                                <p className="font-medium capitalize flex items-center gap-1">
                                    {item.current_location_type === 'warehouse' && '📦 Gudang'}
                                    {item.current_location_type === 'area' && '📍'}
                                    {item.current_location_type === 'employee' && '👤 Employee'}
                                    {item.area_name || item.warehouse_name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Harga</p>
                                <p>Rp {item.purchase_price?.toLocaleString('id-ID')}</p>
                            </div>
                            {item.category_name && (
                                <div>
                                    <p className="text-muted-foreground">Kategori</p>
                                    <p>{item.category_name}</p>
                                </div>
                            )}
                            {item.purchase_date && (
                                <div>
                                    <p className="text-muted-foreground">Tgl Pembelian</p>
                                    <p>{new Date(item.purchase_date).toLocaleDateString('id-ID')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Movement History Toggle */}
                    <div className="border-t pt-4">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowMovements(!showMovements)}
                        >
                            <History className="h-4 w-4 mr-2"/>
                            {showMovements ? 'Sembunyikan' : 'Tampilkan'} Riwayat Movement
                            {movements.length > 0 && (
                                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {movements.length}
                </span>
                            )}
                        </Button>

                        {showMovements && (
                            <div className="mt-4">
                                {isLoadingMovements ? (
                                    <div className="flex justify-center p-4">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                ) : movements.length === 0 ? (
                                    <div className="text-center p-4 text-muted-foreground">
                                        <History className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                                        <p>Belum ada riwayat movement</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {movements.map((movement, index) => (
                                            <div
                                                key={movement.id || index}
                                                className="border rounded-lg p-3 bg-white"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-2">
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${movement.action_color}`}>
                              {movement.action_label}
                            </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                            {movement.created_at_human || new Date(movement.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                          </span>
                                                </div>

                                                {/* Location Info */}
                                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                    {movement.from_name && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <span>Dari:</span>
                                                            <span className="font-medium text-foreground">
                                {movement.from_type === 'warehouse' && '📦 '}
                                                                {movement.from_type === 'area' && '📍 '}
                                                                {movement.from_type === 'employee' && '👤 '}
                                                                {movement.from_name}
                              </span>
                                                        </div>
                                                    )}
                                                    {movement.to_name && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <span>Ke:</span>
                                                            <span className="font-medium text-foreground">
                                {movement.to_type === 'warehouse' && '📦 '}
                                                                {movement.to_type === 'area' && '📍 '}
                                                                {movement.to_type === 'employee' && '👤 '}
                                                                {movement.to_name}
                              </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Condition */}
                                                {movement.condition && (
                                                    <div className="mt-2 flex items-center gap-1 text-xs">
                                                        <span className="text-muted-foreground">Kondisi:</span>
                                                        <span
                                                            className="font-medium capitalize">{movement.condition}</span>
                                                    </div>
                                                )}

                                                {/* Reference */}
                                                {movement.reference_type && (
                                                    <div className="mt-2 flex items-center gap-1 text-xs">
                                                        <span className="text-muted-foreground">Ref:</span>
                                                        <span
                                                            className="font-medium capitalize">{movement.reference_type}</span>
                                                        {movement.reference_id && ` #${movement.reference_id}`}
                                                    </div>
                                                )}

                                                {/* Moved by */}
                                                {movement.moved_by && (
                                                    <div className="mt-2 flex items-center gap-1 text-xs">
                                                        <User className="h-3 w-3 text-muted-foreground"/>
                                                        <span className="text-muted-foreground">Oleh:</span>
                                                        <span className="font-medium">{movement.moved_by}</span>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {movement.notes && (
                                                    <div className="mt-2 text-xs text-muted-foreground italic">
                                                        "{movement.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {item.notes && (
                        <div className="border-t pt-4">
                            <p className="text-muted-foreground text-sm">Catatan</p>
                            <p>{item.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function InventoryTable() {
    const {
        items,
        isLoading,
        pagination,
        fetchItems,
        filters,
        setFilters,
    } = useInventoryStore()

    const [searchInput, setSearchInput] = useState('')
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
    const [showDetail, setShowDetail] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // Filter states
    const [locationTypeFilter, setLocationTypeFilter] = useState<string | null>(null)
    const [warehouseFilter, setWarehouseFilter] = useState<number | null>(null)
    const [statusFilter, setStatusFilter] = useState<string | null>(null)

    // Count active filters
    const activeFilterCount = [locationTypeFilter, warehouseFilter, statusFilter].filter(Boolean).length

    // Handle filter changes
    const handleLocationTypeChange = (value: string | null) => {
        setLocationTypeFilter(value)
        setWarehouseFilter(null) // Reset warehouse when location type changes
        if (value) {
            setFilters({ location_type: value as 'warehouse' | 'area' })
        } else {
            setFilters({ location_type: undefined, warehouse_id: undefined })
        }
    }

    const handleWarehouseChange = (warehouseId: number | null) => {
        setWarehouseFilter(warehouseId)
        if (warehouseId) {
            setFilters({ warehouse_id: warehouseId })
        } else {
            setFilters({ warehouse_id: undefined })
        }
    }

    const handleStatusChange = (value: string | null) => {
        setStatusFilter(value)
        if (value) {
            setFilters({ status: value })
        } else {
            setFilters({ status: undefined })
        }
    }

    const clearAllFilters = () => {
        setLocationTypeFilter(null)
        setWarehouseFilter(null)
        setStatusFilter(null)
        setSearchInput('')
        setFilters({ location_type: undefined, warehouse_id: undefined, status: undefined, search: undefined })
    }

    // Fetch items on mount and filter change
    useEffect(() => {
        fetchItems(filters)
    }, [filters])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchItems({...filters, search: searchInput})
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    const handlePageChange = useCallback((newPage: number) => {
        fetchItems({...filters, page: newPage})
    }, [fetchItems, filters])

    const handleViewDetail = (item: InventoryItem) => {
        setSelectedItem(item)
        setShowDetail(true)
    }

    // Print single QR
    const handlePrintQR = async (item: InventoryItem) => {
        try {
            const {data} = await apiClient.get<{
                success: boolean
                data: { qr_content: string; item: InventoryItem }
            }>(`/admin/inventory-items/${item.id}/qr`)

            const qrContent = data.data.qr_content

            // Import qrcode and generate as data URL
            const QRCode = (await import('qrcode')).default
            const qrDataUrl = await QRCode.toDataURL(qrContent, {
                width: 200,
                margin: 1,
                color: {dark: '#000000', light: '#ffffff'}
            })

            const printWindow = window.open('', '_blank')
            if (!printWindow) {
                toast.error('Failed to open print window')
                return
            }

            printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Print QR Code - ${item.product_name}</title>
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
            .product-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .qr-image { width: 60mm; height: 60mm; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <p class="product-name">${item.product_name}</p>
            <img src="${qrDataUrl}" class="qr-image" alt="QR Code" />
          </div>
          <script>window.onload = () => window.print()</script>
        </body>
        </html>
      `)
            printWindow.document.close()
        } catch {
            toast.error('Failed to print QR code')
        }
    }

    // Download single QR
    const handleDownloadQR = async (item: InventoryItem) => {
        try {
            const {data} = await apiClient.get<{
                success: boolean
                data: { qr_content: string }
            }>(`/admin/inventory-items/${item.id}/qr`)

            const qrContent = data.data.qr_content

            // Create QR code canvas
            const canvas = document.createElement('canvas')
            const QRCode = await import('qrcode').then(m => m.default)
            QRCode.toCanvas(canvas, qrContent, {width: 300, margin: 2})

            // Download
            const link = document.createElement('a')
            link.download = `QR-${item.id}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()

            toast.success('QR code downloaded')
        } catch {
            toast.error('Failed to download QR code')
        }
    }

    // Print all QR codes
    const handlePrintAllQRs = async () => {
        if (items.length === 0) {
            toast.error('No items to print')
            return
        }

        toast.promise(
            (async () => {
                // Import qrcode library
                const QRCode = (await import('qrcode')).default

                // Fetch ALL items from ALL pages
                const allItems: InventoryItem[] = []
                let currentPage = 1
                let lastPage = pagination.last_page

                // Fetch all pages
                while (currentPage <= lastPage) {
                    try {
                        const response = await apiClient.get<{
                            success: boolean
                            data: InventoryItem[]
                            meta: { last_page: number }
                        }>('/admin/inventory-items', {
                            params: {page: currentPage, per_page: 100}
                        })
                        allItems.push(...response.data.data)
                        lastPage = response.data.meta.last_page
                        currentPage++
                    } catch (e) {
                        console.error('Failed to fetch items page', currentPage, e)
                        break
                    }
                }

                if (allItems.length === 0) {
                    throw new Error('No items found')
                }

                toast.info(`Processing ${allItems.length} items...`)

                // Fetch QR data for all items (batch processing with chunk)
                const BATCH_SIZE = 10
                const allQRCodes: Array<{
                    qr_data_url: string,
                    product_name: string,
                    qr_code_short: string
                } | null> = []

                for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
                    const batch = allItems.slice(i, i + BATCH_SIZE)
                    const batchResults = await Promise.all(
                        batch.map(async (item) => {
                            try {
                                const response = await apiClient.get<{
                                    success: boolean
                                    data: { qr_content: string; item: InventoryItem }
                                }>(`/admin/inventory-items/${item.id}/qr`)

                                const qrContent = response.data.data.qr_content

                                // Generate QR as data URL
                                const qrDataUrl = await QRCode.toDataURL(qrContent, {
                                    width: 200,
                                    margin: 1,
                                    color: {dark: '#000000', light: '#ffffff'}
                                })

                                return {
                                    qr_data_url: qrDataUrl,
                                    product_name: response.data.data.item.product_name,
                                    qr_code_short: qrContent.substring(0, 20)
                                }
                            } catch (e) {
                                console.error('Failed to fetch QR for item', item.id, e)
                                return null
                            }
                        })
                    )
                    allQRCodes.push(...batchResults)
                }

                const validQRCodes = allQRCodes.filter(Boolean)

                if (validQRCodes.length === 0) {
                    throw new Error('No QR codes generated')
                }

                // Generate HTML cards with inline images
                const qrCardsHtml = validQRCodes.map((qr, index) => {
                    if (!qr) return ''
                    return `
            <div class="qr-card" style="${index % 4 === 3 ? 'page-break-before: always;' : ''}">
              <div class="qr-inner">
                <p class="product-name">${qr.product_name}</p>
                <img src="${qr.qr_data_url}" class="qr-image" alt="QR Code" />
              </div>
            </div>
          `
                }).join('')

                const printWindow = window.open('', '_blank')
                if (!printWindow) throw new Error('Failed to open print window')

                printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print All QR Codes</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { margin: 0; padding: 10px; font-family: Arial, sans-serif; }
              .qr-grid { display: flex; flex-wrap: wrap; gap: 10px; }
              .qr-card {
                width: 70mm; height: 90mm;
                display: flex; align-items: center; justify-content: center;
                border: 1px solid #ccc; page-break-inside: avoid;
              }
              .qr-inner { text-align: center; padding: 5px; }
              .product-name { font-size: 11px; font-weight: bold; margin-bottom: 5px; }
              .qr-image { width: 50mm; height: 50mm; }
              @media print { .qr-card { border: 1px solid #000; } }
            </style>
          </head>
          <body>
            <h3 style="text-align: center; margin-bottom: 10px;">QR Codes - ${new Date().toLocaleDateString('id-ID')} (${validQRCodes.length} items)</h3>
            <div class="qr-grid">${qrCardsHtml}</div>
            <script>window.onload = () => window.print()</script>
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
    const columns: DataTableColumn<InventoryItem>[] = [
        {
            id: 'qr_preview',
            header: 'QR',
            cell: (row) => {
                const qrValue = row.qr_code || `INV-${row.id}`
                return (
                    <div className="flex items-center gap-2">
                        <QRCodeSVG value={qrValue} size={32} level="L"/>
                    </div>
                )
            },
        },
        {
            accessorKey: 'product_name',
            header: 'Produk',
            cell: (row) => (
                <span className="font-medium">{row.product_name}</span>
            ),
        },
        {
            id: 'location',
            header: 'Lokasi',
            cell: (row) => {
                const locationName = row.current_location_type === 'warehouse'
                    ? row.warehouse_name
                    : row.current_location_type === 'area'
                        ? row.area_name
                        : row.location_name;
                return (
                    <div className="flex flex-col gap-0.5">
            <span className="capitalize text-sm">
              {row.current_location_type === 'warehouse' && '📦 Gudang'}
                {row.current_location_type === 'area' && '📍 Area'}
                {row.current_location_type === 'employee' && '👤 Employee'}
            </span>
                        {locationName && (
                            <span className="text-xs text-muted-foreground">{locationName}</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (row) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${row.status_color}`}>
          {row.status_label}
        </span>
            ),
        },
        {
            accessorKey: 'purchase_order_code',
            header: 'No. PO',
            cell: (row) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {row.purchase_order_code ?? '-'}
                </span>
            ),
        },
        {
            accessorKey: 'condition',
            header: 'Kondisi',
            cell: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${row.condition_color}`}>
                    {row.condition_label}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: (row) => (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetail(row)
                        }}
                        title="View Details & History"
                    >
                        <Eye className="h-4 w-4"/>
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            {/* Filters & Search */}
            <div className="flex flex-col gap-3">
                {/* Filter Toggle & Active Filters Summary */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-1"/>
                            Filter
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                        {activeFilterCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                                <X className="h-4 w-4 mr-1"/>
                                Clear
                            </Button>
                        )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {pagination.total} items
                    </span>
                </div>

                {/* Filter Dropdowns */}
                {showFilters && (
                    <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
                        {/* Location Type Filter */}
                        <div className="w-48">
                            <AsyncSelect
                                label="Tipe Lokasi"
                                placeholder="Semua"
                                loadOptions={async () => [
                                    { value: 'warehouse', label: '📦 Gudang' },
                                    { value: 'area', label: '📍 Area' },
                                ]}
                                value={locationTypeFilter}
                                onChange={(val) => handleLocationTypeChange(val as string | null)}
                            />
                        </div>

                        {/* Warehouse Filter (only show when location type is warehouse) */}
                        {locationTypeFilter === 'warehouse' && (
                            <div className="w-48">
                                <AsyncSelect
                                    label="Gudang"
                                    placeholder="Pilih Gudang"
                                    loadOptions={async () => {
                                        try {
                                            const { data } = await apiClient.get<{success: boolean, data: Array<{id: number, name: string}>}>('/admin/warehouses/select-options')
                                            return data.data.map(w => ({ value: w.id, label: w.name }))
                                        } catch {
                                            return []
                                        }
                                    }}
                                    value={warehouseFilter}
                                    onChange={(val) => handleWarehouseChange(val as number | null)}
                                />
                            </div>
                        )}

                        {/* Status Filter */}
                        <div className="w-48">
                            <AsyncSelect
                                label="Status"
                                placeholder="Semua"
                                loadOptions={async () => [
                                    { value: 'available', label: 'Tersedia' },
                                    { value: 'assigned', label: 'Ditugaskan' },
                                    { value: 'damaged', label: 'Rusak' },
                                    { value: 'lost', label: 'Hilang' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => handleStatusChange(val as string | null)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Search & Actions */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Cari QR code atau produk..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="max-w-sm font-mono"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePrintAllQRs} variant="outline">
                        <Printer className="h-4 w-4 mr-2"/>
                        Print All QR ({items.length})
                    </Button>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={items}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                emptyMessage="Tidak ada item ditemukan"
            />

            {/* Detail Modal */}
            <ItemDetailModal
                open={showDetail}
                onOpenChange={setShowDetail}
                item={selectedItem}
                onPrint={handlePrintQR}
                onDownload={handleDownloadQR}
            />
        </div>
    )
}
