/**
 * Master Data Hub Component
 * Horizontal tabs navigation at top + Content area
 */

import {useState, useEffect, useCallback, useRef} from 'react'
import {
    Globe,
    Building2,
    MapPin,
    Users,
    AlertTriangle,
    Tags,
    Package,
    Warehouse,
    Clock,
    Settings,
    Book,
    Layers,
    Coins,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {masterDataStatsApi, type MasterDataStats} from '../api/master-data-stats-api'
import {ProvincesTable} from '@/features/provinces'
import {DepartmentsTable} from '@/features/departments'
import {ClientsTable} from '@/features/clients'
import {EmployeesTable} from '@/features/employees'
import {RolesTable} from '@/features/roles'
import {ClientTypesTable} from '@/features/client-types'
import {BanksTable} from '@/features/banks'
import {BankAccountsTable} from '@/features/bank-accounts'
import {WarehousesTable} from '@/features/warehouses'
import {ProductCategoriesTable} from '@/features/product-categories'
import {ProductsTable} from '@/features/products'
import {AreasTable} from '@/features/areas'
import {PossTable} from '@/features/poss'
import {DailyTaskItemsTable} from '@/features/daily-task-items'
import {ReviewCriteriaTable} from '@/features/daily-task-review-criteria'
import {ShiftsTable} from '@/features/shifts'
import {AccountsTable as ChartOfAccountsTable} from '@/features/chart-of-accounts/components/accounts-table'
import {TangibleAssetClassesTable} from '@/features/tangible-asset-classes/components/tangible-asset-classes-table'
import {SettingsForm} from '@/features/settings'
import {SalaryComponentsTable} from '@/features/salary-components'

// Master data item configuration
interface MasterDataItem {
    id: string
    name: string
    nameId: string
    description: string
    descriptionId: string
    icon: LucideIcon
    section: string
    countKey?: keyof MasterDataStats
    isImplemented: boolean
}

// All master data items - flat list
const allMasterDataItems: MasterDataItem[] = [
    // Referensi
    {
        id: 'provinces',
        name: 'Provinces',
        nameId: 'Provinsi',
        description: 'Data province',
        descriptionId: 'Data provinsi',
        icon: Globe,
        section: 'referensi',
        countKey: 'provinces',
        isImplemented: true
    },
    {
        id: 'client-types',
        name: 'Client Types',
        nameId: 'Tipe Klien',
        description: 'Data client type',
        descriptionId: 'Data tipe klien',
        icon: Tags,
        section: 'referensi',
        countKey: 'client_types',
        isImplemented: true
    },
    {
        id: 'banks',
        name: 'Banks',
        nameId: 'Bank',
        description: 'Data bank',
        descriptionId: 'Data bank',
        icon: Building2,
        section: 'referensi',
        countKey: 'banks',
        isImplemented: true
    },
    {
        id: 'bank-accounts',
        name: 'Bank Accounts',
        nameId: 'Akun Bank',
        description: 'Data bank account',
        descriptionId: 'Data akun bank',
        icon: Building2,
        section: 'referensi',
        countKey: 'bank_accounts',
        isImplemented: true
    },

    // HRD
    {
        id: 'departments',
        name: 'Departments',
        nameId: 'Departemen',
        description: 'Data department',
        descriptionId: 'Data departemen',
        icon: Users,
        section: 'hrd',
        countKey: 'departments',
        isImplemented: true
    },
    {
        id: 'roles',
        name: 'Roles',
        nameId: 'Peran',
        description: 'Data role',
        descriptionId: 'Data peran',
        icon: Users,
        section: 'hrd',
        countKey: 'roles',
        isImplemented: true
    },
    {
        id: 'employees',
        name: 'Employees',
        nameId: 'Karyawan + User',
        description: 'Data employee + user account',
        descriptionId: 'Data karyawan + akun user (auto)',
        icon: Users,
        section: 'hrd',
        countKey: 'employees',
        isImplemented: true
    },
    {
        id: 'shifts',
        name: 'Shifts',
        nameId: 'Shift',
        description: 'Data shift',
        descriptionId: 'Data shift kerja',
        icon: Clock,
        section: 'hrd',
        countKey: 'shifts',
        isImplemented: true
    },
    {
        id: 'salary-components',
        name: 'Salary Components',
        nameId: 'Komponen Gaji',
        description: 'Salary components',
        descriptionId: 'Komponen gaji (tunjangan, potongan)',
        icon: Coins,
        section: 'hrd',
        isImplemented: true
    },

    // Klien
    {
        id: 'clients',
        name: 'Clients',
        nameId: 'Klien',
        description: 'Data client',
        descriptionId: 'Data klien',
        icon: Building2,
        section: 'klien',
        countKey: 'clients',
        isImplemented: true
    },
    {
        id: 'areas',
        name: 'Areas',
        nameId: 'Area',
        description: 'Data area',
        descriptionId: 'Data area klien',
        icon: MapPin,
        section: 'klien',
        countKey: 'areas',
        isImplemented: true
    },
    {
        id: 'poss',
        name: 'POS',
        nameId: 'POS',
        description: 'Data POS',
        descriptionId: 'Data titik POS',
        icon: MapPin,
        section: 'klien',
        countKey: 'poss',
        isImplemented: true
    },

    // Produk
    {
        id: 'product-categories',
        name: 'Product Categories',
        nameId: 'Kategori Produk',
        description: 'Product categories',
        descriptionId: 'Kategori produk',
        icon: Tags,
        section: 'produk',
        countKey: 'product_categories',
        isImplemented: true
    },
    {
        id: 'products',
        name: 'Products',
        nameId: 'Produk',
        description: 'Data product',
        descriptionId: 'Data produk',
        icon: Package,
        section: 'produk',
        countKey: 'products',
        isImplemented: true
    },

    // Gudang
    {
        id: 'warehouses',
        name: 'Warehouses',
        nameId: 'Gudang',
        description: 'Data warehouse',
        descriptionId: 'Data gudang',
        icon: Warehouse,
        section: 'gudang',
        countKey: 'warehouses',
        isImplemented: true
    },

    // Operasional
    {
        id: 'daily-task-items',
        name: 'Daily Task Items',
        nameId: 'Item Tugas Harian',
        description: 'Daily task items',
        descriptionId: 'Item tugas harian',
        icon: AlertTriangle,
        section: 'operasional',
        isImplemented: true
    },
    {
        id: 'daily-task-review-criteria',
        name: 'Review Criteria',
        nameId: 'Criteria Review',
        description: 'Daily task review criteria',
        descriptionId: 'Criteria review tugas harian',
        icon: ClipboardCheck,
        section: 'operasional',
        isImplemented: true
    },

    // Akunting
    {
        id: 'chart-of-accounts',
        name: 'Chart of Accounts',
        nameId: 'Daftar Akun',
        description: 'Chart of accounts',
        descriptionId: 'Chart of accounts',
        icon: Book,
        section: 'akunting',
        isImplemented: true
    },
    {
        id: 'tangible-asset-classes',
        name: 'Tangible Asset Classes',
        nameId: 'Kelas Aktiva',
        description: 'Asset classes',
        descriptionId: 'Kelas aktiva tetap',
        icon: Layers,
        section: 'akunting',
        isImplemented: true
    },

    // Administrasi
    {
        id: 'settings',
        name: 'Settings',
        nameId: 'Pengaturan',
        description: 'System settings',
        descriptionId: 'Pengaturan sistem',
        icon: Settings,
        section: 'administrasi',
        isImplemented: true
    },
]

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

// Map item ID to component
const ItemContent: Record<string, React.ReactNode> = {
    provinces: <ProvincesTable/>,
    departments: <DepartmentsTable/>,
    clients: <ClientsTable/>,
    employees: <EmployeesTable/>,
    roles: <RolesTable/>,
    shifts: <ShiftsTable/>,
    'salary-components': <SalaryComponentsTable/>,
    'client-types': <ClientTypesTable/>,
    banks: <BanksTable/>,
    'bank-accounts': <BankAccountsTable/>,
    warehouses: <WarehousesTable/>,
    'product-categories': <ProductCategoriesTable/>,
    products: <ProductsTable/>,
    areas: <AreasTable/>,
    poss: <PossTable/>,
    'daily-task-items': <DailyTaskItemsTable/>,
    'daily-task-review-criteria': <ReviewCriteriaTable/>,
    'chart-of-accounts': <ChartOfAccountsTable/>,
    'tangible-asset-classes': <TangibleAssetClassesTable/>,
    settings: <SettingsForm/>,
}

export function MasterDataHub() {
    const [selectedItemId, setSelectedItemId] = useState<string>(() => {
        // Load from localStorage on initial render
        if (typeof window !== 'undefined') {
            return localStorage.getItem('master-data-last-tab') || 'provinces'
        }
        return 'provinces'
    })
    const [stats, setStats] = useState<MasterDataStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const tabsContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const fetchStats = useCallback(async () => {
        try {
            const response = await masterDataStatsApi.getStats()
            if (response.success) {
                setStats(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch master data stats:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    // Save to localStorage when selected item changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('master-data-last-tab', selectedItemId)
        }
    }, [selectedItemId])

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

    const getCount = (item: MasterDataItem): number => {
        if (!stats || !item.countKey) return 0
        return (stats as any)[item.countKey] || 0
    }

    // Filter items based on search
    const filteredItems = allMasterDataItems.filter((item) =>
        !searchQuery ||
        item.nameId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedItem = allMasterDataItems.find((i) => i.id === selectedItemId)
    const SelectedContent = selectedItemId ? ItemContent[selectedItemId] : null

    // Get section color for selected item
    const selectedSection = sections.find(s => s.id === selectedItem?.section)
    const sectionColor = selectedSection?.color || ''

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* ===== TOP BAR WITH TABS ===== */}
            <div className="shrink-0 border-b bg-card">
                {/* Header with search and navigation */}
                <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
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
            {selectedItem?.nameId || 'Pilih data'}
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
                        {filteredItems.map((item) => {
                            const Icon = item.icon
                            const isSelected = selectedItemId === item.id
                            const itemSection = sections.find(s => s.id === item.section)
                            const count = getCount(item)

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItemId(item.id)}
                                    disabled={!item.isImplemented}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap shrink-0',
                                        'border',
                                        isSelected
                                            ? cn('bg-primary text-primary-foreground border-primary shadow-sm', itemSection?.color.replace('bg-', 'bg-opacity-20 '))
                                            : 'bg-background text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground',
                                        !item.isImplemented && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5"/>
                                    <span>{item.nameId}</span>
                                    {count > 0 && (
                                        <span className={cn(
                                            'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                                            isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        )}>
                      {count}
                    </span>
                                    )}
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

            {/* ===== CONTENT AREA ===== */}
            <div className="flex-1 min-h-0 overflow-auto">
                <div className="p-4 md:p-6">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
                                <span className="text-sm text-muted-foreground">Memuat data...</span>
                            </div>
                        </div>
                    ) : (
                        SelectedContent
                    )}
                </div>
            </div>
        </div>
    )
}
