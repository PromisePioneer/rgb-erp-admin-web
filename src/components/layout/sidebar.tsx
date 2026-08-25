"use client"

import {useState, useMemo} from 'react'
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
} from 'lucide-react'
import {useAuthStore} from '@/stores/auth-store'
import {navigationSections, navLabels, type NavItem, type NavSection} from './navigation-types'
import {cn} from '@/lib/utils'
import * as React from "react";

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

function SidebarSection({section, privileges, collapsed = false}: {
    section: NavSection
    privileges: string[]
    collapsed?: boolean
}) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const location = useLocation() // Pindahkan ke level komponen
    const visibleItems = section.items.filter((item) => hasPrivilege(item.menu, privileges))

    if (visibleItems.length === 0) return null

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
                    {visibleItems.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon] : null
                        const active = isActive(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
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
    const privileges = useAuthStore((state) => state.privileges)

    const visibleSections = useMemo(
        () => navigationSections.filter((section) => sectionHasVisibleItems(section, privileges)),
        [privileges]
    )

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
                    <div
                        className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shrink-0">
                        <ShieldCheck className="h-5 w-5 text-primary-foreground"/>
                    </div>
                    {!collapsed && (
                        <div className="ml-3">
                            <p className="font-bold text-sm leading-none">RGB-86</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Security ERP</p>
                        </div>
                    )}
                </div>
                <nav className="flex-1 py-6 px-2 overflow-y-auto thin-scroll">
                    {visibleSections.map((section) => (
                        <SidebarSection key={section.label} section={section} privileges={privileges}
                                        collapsed={collapsed}/>
                    ))}
                </nav>
                <div className={cn('py-4 border-t border-border shrink-0', collapsed ? 'px-2' : 'px-3')}>
                    <p className="text-[10px] text-muted-foreground text-center">
                        &copy; {new Date().getFullYear()} RGB ERP
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
