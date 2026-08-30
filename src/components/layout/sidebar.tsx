"use client"

import {useState, useMemo, useRef, useLayoutEffect, useEffect} from 'react'
import {Link, useLocation} from '@tanstack/react-router'
import {
    ShieldCheck,
    LayoutDashboard,
    Briefcase,
    Tags,
    Landmark,
    IdCard,
    FileText,
    Users,
    MapPin,
    Clock,
    CalendarDays,
    Wallet,
    Coins,
    Banknote,
    Receipt,
    BookOpen,
    Book,
    Scale,
    TrendingUp,
    Warehouse,
    Layers,
    Package,
    Shirt,
    ClipboardList,
    ShoppingCart,
    Inbox,
    Boxes,
    FolderKanban,
    ScanFace,
    Camera,
    AlertTriangle,
    Megaphone,
    GitBranch,
    Scan,
    UserCog,
    Network,
    Lock,
    Settings,
    ChevronDown,
    Menu,
    Search,
    X,
} from 'lucide-react'
import {useAuthStore} from '@/stores/auth-store'
import {useSettingsStore} from '@/features/settings/store/settings-store'
import {navigationSections, navLabels, type NavItem, type NavSection} from './navigation-types'
import {cn} from '@/lib/utils'
import * as React from "react";
import {Input} from "@/components/ui/input";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'layout-dashboard': LayoutDashboard,
    'briefcase': Briefcase,
    'tags': Tags,
    'landmark': Landmark,
    'id-card': IdCard,
    'file-text': FileText,
    'users': Users,
    'map-pin': MapPin,
    'clock': Clock,
    'calendar-days': CalendarDays,
    'wallet': Wallet,
    'coins': Coins,
    'banknote': Banknote,
    'receipt': Receipt,
    'book-open': BookOpen,
    'book': Book,
    'scale': Scale,
    'trending-up': TrendingUp,
    'warehouse': Warehouse,
    'layers': Layers,
    'package': Package,
    'shirt': Shirt,
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
    // New accounting icons
    'building': Landmark,
    'bar-chart': TrendingUp,
}

function getLabel(section: NavSection, item?: NavItem, lang: string = 'en'): string {
    if (item?.label) {
        const key = item.label.toLowerCase().replace(/\s+/g, '_')
        return navLabels[lang]?.[key] || item.label
    }
    if (section.label) {
        return navLabels[lang]?.[section.label] || section.label
    }
    return ''
}

function hasPrivilege(menu: string | undefined, privileges: string[]): boolean {
    if (!menu) return true
    return privileges.some((p) => p.startsWith(`${menu},View`))
}

function sectionHasVisibleItems(section: NavSection, privileges: string[]): boolean {
    return section.items.some((item) => hasPrivilege(item.menu, privileges))
}

function SidebarSection({section, privileges, collapsed = false, searchQuery = '', onLinkClick}: {
    section: NavSection
    privileges: string[]
    collapsed?: boolean
    searchQuery?: string
    onLinkClick?: () => void
}) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const location = useLocation() // Pindahkan ke level komponen
    const visibleItems = section.items.filter((item) => hasPrivilege(item.menu, privileges))

    if (visibleItems.length === 0) return null

    // Filter items based on search query
    const filteredItems = searchQuery
        ? visibleItems.filter((item) =>
            getLabel(section, item).toLowerCase().includes(searchQuery.toLowerCase())
        )
        : visibleItems

    if (searchQuery && filteredItems.length === 0) return null

    const isActive = (path: string): boolean => {
        const currentPath = location.pathname
        if (currentPath === path) return true
        return path !== '/dashboard' && currentPath.startsWith(path);

    }

    const showItems = collapsed || !isCollapsed

    return (
        <div className="mb-4">
            {!collapsed && (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/60 hover:text-foreground transition-colors"
                >
                    <span>{getLabel(section)}</span>
                    <ChevronDown
                        className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200 text-foreground/40',
                            isCollapsed ? '-rotate-90' : 'rotate-0'
                        )}
                    />
                </button>
            )}
            {showItems && (
                <div className="space-y-0.5 px-1">
                    {filteredItems.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon] : null
                        const active = isActive(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onLinkClick}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                )}
                                title={collapsed ? getLabel(section, item) : undefined}
                            >
                                {Icon && <Icon className="h-[18px] w-[18px] shrink-0"/>}
                                {!collapsed && <span className="truncate">{getLabel(section, item)}</span>}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

interface SidebarProps {
    collapsed?: boolean
    onToggle?: () => void
}

export function Sidebar({collapsed = false}: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const privileges = useAuthStore((state) => state.privileges)
    const navRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const { data: settings, fetchSettings } = useSettingsStore()

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    // Restore scroll position on mount and location change
    useLayoutEffect(() => {
        if (navRef.current) {
            const savedScroll = localStorage.getItem('sidebar-scroll')
            if (savedScroll) {
                navRef.current.scrollTop = parseInt(savedScroll, 10)
            }
        }
    }, [location.pathname])

    // Save scroll position on scroll
    const handleScroll = () => {
        if (navRef.current) {
            localStorage.setItem('sidebar-scroll', String(navRef.current.scrollTop))
        }
    }

    // Save scroll before navigation
    const handleLinkClick = () => {
        if (navRef.current) {
            localStorage.setItem('sidebar-scroll', String(navRef.current.scrollTop))
        }
    }

    // Get settings values with defaults
    const appTitle = settings?.app_title || 'RGB ERP'
    const appLogo = settings?.app_logo
    const companyName = settings?.company_name || 'RGB ERP'

    const visibleSections = useMemo(
        () => navigationSections.filter((section) => sectionHasVisibleItems(section, privileges)),
        [privileges]
    )

    // Filter sections when searching - show sections that have matching items
    const filteredSections = useMemo(() => {
        if (!searchQuery) return visibleSections

        return visibleSections
            .map(section => {
                const filteredItems = section.items.filter(
                    item =>
                        hasPrivilege(item.menu, privileges) &&
                        getLabel(section, item).toLowerCase().includes(searchQuery.toLowerCase())
                )
                return {...section, items: filteredItems}
            })
            .filter(section => section.items.length > 0)
    }, [visibleSections, privileges, searchQuery])

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                    collapsed ? 'lg:w-16' : 'lg:w-64'
                )}
            >
                <div
                    className={cn('h-16 border-b border-border shrink-0 flex items-center', collapsed ? 'justify-center px-2' : 'px-5')}>
                    {appLogo && !collapsed ? (
                        <img
                            src={appLogo}
                            alt={appTitle}
                            className="h-10 w-10 rounded-md object-contain"
                        />
                    ) : (
                        <div
                            className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shrink-0">
                            <ShieldCheck className="h-5 w-5 text-primary-foreground"/>
                        </div>
                    )}
                    {!collapsed && (
                        <div className="ml-3">
                            <p className="font-bold text-sm leading-none">{companyName}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{appTitle}</p>
                        </div>
                    )}
                </div>

                {/* Search Input */}
                {!collapsed && (
                    <div className="px-3 py-3 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
                            <Input
                                type="text"
                                placeholder="Search menu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3.5 w-3.5"/>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <nav
                    ref={navRef}
                    className="flex-1 py-6 px-2 overflow-y-auto thin-scroll"
                    onScroll={handleScroll}
                >
                    {filteredSections.map((section) => (
                        <SidebarSection
                            key={section.label}
                            section={section}
                            privileges={privileges}
                            collapsed={collapsed}
                            searchQuery={searchQuery}
                            onLinkClick={handleLinkClick}
                        />
                    ))}
                    {filteredSections.length === 0 && searchQuery && (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                            No results found
                        </div>
                    )}
                </nav>
                <div className={cn('py-4 border-t border-border shrink-0', collapsed ? 'px-2' : 'px-3')}>
                    <p className="text-[10px] text-muted-foreground text-center">
                        &copy; {new Date().getFullYear()} {appTitle}
                    </p>
                </div>
            </aside>
        </>
    )
}

export function SidebarToggle() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
            >
                <Menu className="h-6 w-6"/>
            </button>
            {mobileOpen && <Sidebar/>}
        </>
    )
}
