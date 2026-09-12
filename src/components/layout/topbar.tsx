/**
 * Topbar Component
 * Header with breadcrumbs, company selector, language switcher, notifications, and theme toggle
 */
"use client"

import * as React from "react"
import {useLocation, useNavigate} from "@tanstack/react-router"
import {useTranslationStore} from '@/stores/translation-store'
import {useCompanyStore} from '@/stores/company-store'
import {navigationSections} from "@/components/layout/navigation-types"
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {companyApi} from '@/features/companies/api/companies-api'
import {NotificationBell} from '@/components/layout/notification-bell'
import {ThemeToggle} from '@/components/ui/theme-toggle'
import {
    ChevronRight,
    Globe,
    Home,
    LayoutDashboard,
} from "lucide-react"
import {cn} from "@/lib/utils"
import {
    type LucideIcon,
    Briefcase,
    FileText,
    Users,
    MapPin,
    Clock,
    CalendarDays,
    Wallet,
    Coins,
    Receipt,
    Book,
    Scale,
    Warehouse,
    Layers,
    Package,
    ClipboardList,
    ShoppingCart,
    Boxes,
    AlertTriangle,
    ScanFace,
    Camera,
    Scan,
    UserCog,
    Network,
    Lock,
    Settings,
    TrendingUp,
    Building,
    Inbox,
    FolderKanban,
    BarChart3,
    Database,
    List,
    GitBranch,
    Calendar,
    Megaphone,
} from "lucide-react"

// Icon map
const iconMap: Record<string, LucideIcon> = {
    'layout': LayoutDashboard,
    'layout-dashboard': LayoutDashboard,
    'briefcase': Briefcase,
    'file-text': FileText,
    'users': Users,
    'map-pin': MapPin,
    'clock': Clock,
    'calendar-days': CalendarDays,
    'calendar': Calendar,
    'wallet': Wallet,
    'coins': Coins,
    'receipt': Receipt,
    'book-open': Book,
    'book': Book,
    'scale': Scale,
    'trending-up': TrendingUp,
    'warehouse': Warehouse,
    'layers': Layers,
    'package': Package,
    'clipboard-list': ClipboardList,
    'shopping-cart': ShoppingCart,
    'inbox': Inbox,
    'boxes': Boxes,
    'folder-kanban': FolderKanban,
    'scan-face': ScanFace,
    'camera': Camera,
    'alert-triangle': AlertTriangle,
    'megaphone': Megaphone,
    'git-branch': GitBranch,
    'scan': Scan,
    'user-cog': UserCog,
    'network': Network,
    'lock': Lock,
    'settings': Settings,
    'building': Building,
    'bar-chart': BarChart3,
    'database': Database,
    'list': List,
}

// Build breadcrumb from current path
function useBreadcrumbs(pathname: string) {
    const {t, isLoaded} = useTranslationStore()
    const breadcrumbs: Array<{label: string; path?: string; iconName?: string}> = []

    // Helper to translate label (direct key, same as backend structure)
    const translateLabel = (key: string): string => {
        if (isLoaded) {
            const translated = t(key)
            if (translated !== key) {
                return translated
            }
        }
        // Fallback: format key like "dashboard" -> "Dashboard"
        return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }

    // Add Home first
    breadcrumbs.push({label: translateLabel('home') || 'Home', path: '/dashboard', iconName: 'layout'})

    // Find matching section and item
    let matchingSection: typeof navigationSections[0] | null = null
    let matchingItem: any = null

    // Check exact match first
    for (const section of navigationSections) {
        for (const item of section.items) {
            if (item.path === pathname) {
                matchingSection = section
                matchingItem = item
                break
            }
        }
        if (matchingItem) break
    }

    // Check prefix match if no exact match
    if (!matchingItem) {
        for (const section of navigationSections) {
            for (const item of section.items) {
                if (pathname.startsWith(item.path) && item.path !== '/') {
                    matchingSection = section
                    matchingItem = item
                    break
                }
            }
            if (matchingItem) break
        }
    }

    // Add section label
    if (matchingSection) {
        breadcrumbs.push({label: translateLabel(matchingSection.label)})
    }

    // Add item label
    if (matchingItem) {
        // Use translated label for display (menu is for privilege check)
        const displayLabel = translateLabel(matchingItem.label)
        breadcrumbs.push({label: displayLabel, path: matchingItem.path, iconName: matchingItem.icon})
    } else if (breadcrumbs.length === 1) {
        // If no match found, show path segments
        const segments = pathname.split('/').filter(Boolean)
        segments.forEach(segment => {
            breadcrumbs.push({label: translateLabel(segment)})
        })
    }

    return breadcrumbs
}

interface TopbarProps {
    onCollapse?: () => void
    isMobile?: boolean
    isCollapsed?: boolean
}

export function Topbar({onCollapse, isMobile = false, isCollapsed = false}: TopbarProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const {locale, setLocale} = useTranslationStore()
    const {currentCompany, switchCompany, fetchCompanies} = useCompanyStore()
    const breadcrumbs = useBreadcrumbs(location.pathname)
    const [langMenuOpen, setLangMenuOpen] = React.useState(false)

    // Fetch companies on mount
    React.useEffect(() => {
        fetchCompanies()
    }, [fetchCompanies])

    // Handle company change
    const handleCompanyChange = async (value: number | string | null) => {
        if (!value) return
        try {
            await switchCompany(Number(value))
            window.location.reload()
        } catch (error) {
            console.error('Failed to switch company:', error)
        }
    }

    // Load companies for select
    const loadCompanies = React.useCallback(async (search: string): Promise<SelectOption[]> => {
        try {
            const response = await companyApi.getSelectOptions({q: search})
            return response.map((company) => ({
                value: company.id,
                label: company.name,
            }))
        } catch {
            return []
        }
    }, [])

    // Handle breadcrumb navigation
    const handleBreadcrumbClick = (path?: string) => {
        if (path) {
            navigate({to: path})
        }
    }

    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
            {/* Collapse toggle */}
            {!isMobile && onCollapse && (
                <button
                    onClick={onCollapse}
                    className="p-1.5 hover:bg-accent rounded-md transition-colors"
                >
                    {isCollapsed ? (
                        <LayoutDashboard className="h-4 w-4"/>
                    ) : (
                        <LayoutDashboard className="h-4 w-4 rotate-180"/>
                    )}
                </button>
            )}

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm flex-1">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1
                    const Icon = iconMap[crumb.iconName || 'layout'] || Home

                    return (
                        <div key={index} className="flex items-center gap-1">
                            {index > 0 && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50"/>
                            )}
                            {crumb.path && !isLast ? (
                                <button
                                    onClick={() => handleBreadcrumbClick(crumb.path)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <Icon className="h-4 w-4"/>
                                    <span className="hidden sm:inline">{crumb.label}</span>
                                </button>
                            ) : (
                                <span className={cn(
                                    "flex items-center gap-1.5 px-2 py-1",
                                    isLast ? "font-semibold text-foreground" : "text-muted-foreground"
                                )}>
                                    <Icon className="h-4 w-4"/>
                                    <span className="hidden sm:inline">{crumb.label}</span>
                                </span>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                {/* Company Selector */}
                {!isMobile && (
                    <div className="w-50">
                        <AsyncSelect
                            value={currentCompany?.id ?? null}
                            onChange={handleCompanyChange}
                            loadOptions={loadCompanies}
                            placeholder="Select Company"
                        />
                    </div>
                )}

                {/* Language Switcher */}
                <div className="relative" data-state={langMenuOpen ? 'open' : 'closed'}>
                    <button
                        onClick={() => setLangMenuOpen(!langMenuOpen)}
                        className="flex items-center gap-1.5 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                        <Globe className="h-5 w-5"/>
                        <span className="text-xs font-medium uppercase">{locale}</span>
                    </button>

                    {langMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}/>
                            <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                                <div className="py-1">
                                    <button
                                        onClick={() => { setLocale('id'); setLangMenuOpen(false) }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors",
                                            locale === 'id' ? 'bg-accent text-primary font-medium' : 'text-foreground'
                                        )}
                                    >
                                        🇮🇩 Indonesia
                                    </button>
                                    <button
                                        onClick={() => { setLocale('en'); setLangMenuOpen(false) }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors",
                                            locale === 'en' ? 'bg-accent text-primary font-medium' : 'text-foreground'
                                        )}
                                    >
                                        🇬🇧 English
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <NotificationBell/>

                {/* Theme Toggle */}
                <ThemeToggle/>
            </div>
        </header>
    )
}
