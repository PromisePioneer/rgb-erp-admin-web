/**
 * Master Data Hub Component
 * Sidebar navigation on left + Content area on right
 */

import {useState, useEffect, useCallback} from 'react'
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
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    PanelLeftClose,
    PanelLeft,
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
import {UmkTable} from '@/features/umk'

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
        id: 'umk',
        name: 'UMK',
        nameId: 'UMK',
        description: 'Regional Minimum Wage',
        descriptionId: 'Upah Minimum Kota',
        icon: Coins,
        section: 'referensi',
        countKey: 'umk',
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
    umk: <UmkTable/>,
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
    // Load from localStorage on initial render
    const [selectedItemId, setSelectedItemId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('master-data-last-tab') || 'provinces'
        }
        return 'provinces'
    })
    const [stats, setStats] = useState<MasterDataStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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

    // Auto-expand section when selecting an item
    useEffect(() => {
        const selectedItem = allMasterDataItems.find(i => i.id === selectedItemId)
        if (selectedItem) {
            setCollapsedSections(prev => {
                const next = new Set(prev)
                next.delete(selectedItem.section)
                return next
            })
        }
    }, [selectedItemId])

    const getCount = (item: MasterDataItem): number => {
        if (!stats || !item.countKey) return 0
        return (stats as any)[item.countKey] || 0
    }

    // Get items for a section
    const getSectionItems = (sectionId: string) => {
        return allMasterDataItems.filter(item =>
            item.section === sectionId && (
                !searchQuery ||
                item.nameId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
    }

    // Toggle section collapse
    const toggleSection = (sectionId: string) => {
        setCollapsedSections(prev => {
            const next = new Set(prev)
            if (next.has(sectionId)) {
                next.delete(sectionId)
            } else {
                next.add(sectionId)
            }
            return next
        })
    }

    // Get section color for selected item
    const selectedItem = allMasterDataItems.find((i) => i.id === selectedItemId)
    const selectedSection = sections.find(s => s.id === selectedItem?.section)
    const sectionColor = selectedSection?.color || ''

    const SelectedContent = selectedItemId ? ItemContent[selectedItemId] : null

    return (
        <div className="flex h-screen overflow-hidden">
            {/* ===== SIDEBAR ===== */}
            <div
                className={cn(
                    'shrink-0 border-r bg-card flex flex-col transition-all duration-300',
                    isSidebarCollapsed ? 'w-16' : 'w-72'
                )}
            >
                {/* Sidebar Header */}
                <div className="shrink-0 border-b p-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={cn(
                                'p-1.5 rounded-md transition-colors hover:bg-accent',
                                isSidebarCollapsed ? 'mx-auto' : ''
                            )}
                            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isSidebarCollapsed ? (
                                <PanelLeft className="h-4 w-4 text-muted-foreground"/>
                            ) : (
                                <PanelLeftClose className="h-4 w-4 text-muted-foreground"/>
                            )}
                        </button>

                        {!isSidebarCollapsed && (
                            <span className="font-semibold text-sm">Master Data</span>
                        )}
                    </div>

                    {/* Search (only when expanded) */}
                    {!isSidebarCollapsed && (
                        <div className="relative mt-3">
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
                    )}
                </div>

                {/* Sections & Items */}
                <div className="flex-1 overflow-y-auto py-2">
                    {sections.map(section => {
                        const sectionItems = getSectionItems(section.id)
                        if (sectionItems.length === 0) return null

                        const isCollapsed = collapsedSections.has(section.id)
                        const SectionIcon = isCollapsed ? ChevronRight : ChevronDown

                        return (
                            <div key={section.id} className="mb-1">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                                        'hover:bg-accent/50',
                                        isSidebarCollapsed && 'justify-center'
                                    )}
                                >
                                    <SectionIcon className="h-4 w-4 shrink-0"/>
                                    {!isSidebarCollapsed && (
                                        <>
                                            <span className={cn(
                                                'px-2 py-0.5 rounded-full text-xs font-medium border',
                                                section.color
                                            )}>
                                                {section.name}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Section Items */}
                                {!isCollapsed && !isSidebarCollapsed && (
                                    <div className="ml-2">
                                        {sectionItems.map(item => {
                                            const Icon = item.icon
                                            const isSelected = selectedItemId === item.id
                                            const count = getCount(item)

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setSelectedItemId(item.id)}
                                                    disabled={!item.isImplemented}
                                                    className={cn(
                                                        'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-accent',
                                                        !item.isImplemented && 'opacity-50 cursor-not-allowed'
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0"/>
                                                    <span className="flex-1 text-left truncate">{item.nameId}</span>
                                                    {count > 0 && (
                                                        <span className={cn(
                                                            'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                                                            isSelected
                                                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                                                : 'bg-muted text-muted-foreground'
                                                        )}>
                                                            {count}
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Current Selection (only when collapsed) */}
                {isSidebarCollapsed && selectedItem && (
                    <div className="shrink-0 border-t p-2">
                        <div className="flex flex-col items-center gap-1">
                            <selectedItem.icon className="h-5 w-5 text-primary"/>
                            <span className="text-[10px] text-center truncate w-full" title={selectedItem.nameId}>
                                {selectedItem.nameId.slice(0, 8)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== CONTENT AREA ===== */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {/* Content Header */}
                <div className="shrink-0 border-b bg-muted/30 px-6 py-3">
                    <div className="flex items-center gap-3">
                        {selectedSection && (
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', sectionColor)}>
                                {selectedSection.name}
                            </span>
                        )}
                        <div className="h-4 w-px bg-border"/>
                        <span className="font-medium">
                            {selectedItem?.nameId || 'Pilih data'}
                        </span>
                    </div>
                </div>

                {/* Content Body */}
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
        </div>
    )
}
