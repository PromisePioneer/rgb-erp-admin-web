/**
 * Master Data TopBar Component
 * Reusable horizontal tabs navigation for master data
 */
import {useState, useEffect, useRef} from 'react'
import {
    Search,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import {cn} from '@/lib/utils'

// Section configuration
const sections = [
    {id: 'referensi', name: 'Referensi', color: 'bg-blue-100 text-blue-700 border-blue-200'},
    {id: 'hrd', name: 'HRD', color: 'bg-green-100 text-green-700 border-green-200'},
    {id: 'klien', name: 'Klien', color: 'bg-purple-100 text-purple-700 border-purple-200'},
    {id: 'produk', name: 'Produk', color: 'bg-orange-100 text-orange-700 border-orange-200'},
    {id: 'gudang', name: 'Gudang', color: 'bg-yellow-100 text-yellow-700 border-yellow-200'},
    {id: 'operasional', name: 'Operasional', color: 'bg-red-100 text-red-700 border-red-200'},
    {id: 'akunting', name: 'Akunting', color: 'bg-indigo-100 text-indigo-700 border-indigo-200'},
    {id: 'administrasi', name: 'Admin', color: 'bg-gray-100 text-gray-700 border-gray-200'},
]

// All master data item IDs
const allItemIds = [
    'provinces', 'client-types', 'banks', 'bank-accounts',
    'departments', 'roles', 'employees', 'shifts', 'salary-components',
    'clients', 'areas', 'poss',
    'product-categories', 'products',
    'warehouses',
    'daily-task-items',
    'chart-of-accounts', 'tangible-asset-classes',
    'settings',
]

// Item to section mapping
const itemSections: Record<string, string> = {
    provinces: 'referensi', 'client-types': 'referensi', banks: 'referensi', 'bank-accounts': 'referensi',
    departments: 'hrd', roles: 'hrd', employees: 'hrd', shifts: 'hrd', 'salary-components': 'hrd',
    clients: 'klien', areas: 'klien', poss: 'klien',
    'product-categories': 'produk', products: 'produk',
    warehouses: 'gudang',
    'daily-task-items': 'operasional',
    'chart-of-accounts': 'akunting', 'tangible-asset-classes': 'akunting',
    settings: 'administrasi',
}

interface MasterDataTopBarProps {
    selectedItemId: string
    onItemSelect: (itemId: string) => void
    searchQuery?: string
    onSearchChange?: (query: string) => void
}

export function MasterDataTopBar({
                                     selectedItemId,
                                     onItemSelect,
                                     searchQuery = '',
                                     onSearchChange
                                 }: MasterDataTopBarProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery)
    const tabsContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    useEffect(() => {
        setLocalSearch(searchQuery)
    }, [searchQuery])

    // Check scroll position for arrows
    const checkScroll = () => {
        if (tabsContainerRef.current) {
            const {scrollLeft, scrollWidth, clientWidth} = tabsContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [])

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsContainerRef.current) {
            const scrollAmount = 200
            tabsContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    const handleSearchChange = (value: string) => {
        setLocalSearch(value)
        onSearchChange?.(value)
    }

    // Get section color for selected item
    const selectedSectionId = itemSections[selectedItemId]
    const selectedSection = sections.find(s => s.id === selectedSectionId)
    const sectionColor = selectedSection?.color || ''

    // Get item name for display
    const getItemName = (itemId: string): string => {
        const names: Record<string, string> = {
            provinces: 'Provinsi',
            'client-types': 'Tipe Klien',
            banks: 'Bank',
            'bank-accounts': 'Akun Bank',
            departments: 'Departemen',
            roles: 'Peran',
            employees: 'Karyawan + User',
            shifts: 'Shift',
            'salary-components': 'Komponen Gaji',
            clients: 'Klien',
            areas: 'Area',
            poss: 'POS',
            'product-categories': 'Kategori Produk',
            products: 'Produk',
            warehouses: 'Gudang',
            'daily-task-items': 'Item Tugas Harian',
            'chart-of-accounts': 'Daftar Akun',
            'tangible-asset-classes': 'Kelas Aktiva',
            settings: 'Pengaturan',
        }
        return names[itemId] || itemId
    }

    return (
        <div className="shrink-0 border-b bg-card">
            {/* Header with search and navigation */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input
                        type="text"
                        placeholder="Cari..."
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    {localSearch && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                        >
                            <X className="h-3 w-3"/>
                        </button>
                    )}
                </div>

                {/* Section indicator */}
                {selectedSection && (
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', sectionColor)}>
            {selectedSection.name}
          </span>
                )}

                {/* Current item name */}
                <span className="font-medium text-sm truncate flex-1">
          {getItemName(selectedItemId)}
        </span>

                {/* Scroll navigation arrows */}
                <div className="flex gap-1">
                    <button
                        onClick={() => scrollTabs('left')}
                        className={cn(
                            'p-1.5 rounded-md transition-colors',
                            canScrollLeft ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'
                        )}
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </button>
                    <button
                        onClick={() => scrollTabs('right')}
                        className={cn(
                            'p-1.5 rounded-md transition-colors',
                            canScrollRight ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'
                        )}
                        disabled={!canScrollRight}
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </button>
                </div>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="relative">
                {/* Left fade */}
                {canScrollLeft && (
                    <div
                        className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-card to-transparent z-10 pointer-events-none"/>
                )}

                {/* Scrollable tabs container */}
                <div
                    ref={tabsContainerRef}
                    onScroll={checkScroll}
                    className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide"
                    style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
                >
                    {allItemIds.map((itemId) => {
                        const isSelected = selectedItemId === itemId
                        const section = sections.find(s => s.id === itemSections[itemId])
                        const sectionColor = section?.color || ''

                        return (
                            <button
                                key={itemId}
                                onClick={() => onItemSelect(itemId)}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap shrink-0',
                                    'border',
                                    isSelected
                                        ? cn('bg-primary text-primary-foreground border-primary shadow-sm', sectionColor.replace('bg-', 'bg-opacity-20'))
                                        : 'bg-background text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                <span>{getItemName(itemId)}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Right fade */}
                {canScrollRight && (
                    <div
                        className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-card to-transparent z-10 pointer-events-none"/>
                )}
            </div>
        </div>
    )
}

// Helper to get section for item
export function getItemSection(itemId: string): string {
    return itemSections[itemId] || 'referensi'
}
