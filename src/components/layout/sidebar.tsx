"use client"

import * as React from "react"
import {useLocation, useNavigate} from "@tanstack/react-router"
import {type LucideIcon} from "lucide-react"
import {AppSidebar} from "@/components/app-sidebar"
import {Card} from '@/components/ui/card'
import {SidebarProvider} from "@/components/ui/sidebar"
import {Sheet, SheetContent} from "@/components/ui/sheet"
import {Separator} from "@/components/ui/separator"
import {useSettingsStore} from "@/features/settings/store/settings-store"
import {useTranslationStore} from "@/stores/translation-store"
import {useAuthStore} from '@/stores/auth-store'
import {navigationSections} from "@/components/layout/navigation-types"
import {cn} from "@/lib/utils"
import {
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
    Database,
    ChevronDown,
    ChevronRight,
    List,
} from "lucide-react"
import {useIsMobile} from '@/hooks/use-mobile'
import {CommandPalette, useCommandPalette} from '@/components/ui/command-palette'
import {Topbar} from './topbar'

// Re-export for backward compatibility
export {AppSidebar as Sidebar} from "@/components/app-sidebar"

function hasPrivilege(menu: string | undefined, privileges: string[]): boolean {
    if (!menu) return true
    return privileges.some((p) => p.startsWith(`${menu},View`))
}

// Icon map
const iconMap: Record<string, LucideIcon> = {
    'layout-dashboard': LayoutDashboard,
    'layout': LayoutDashboard,
    'briefcase': Briefcase,
    'tags': Tags,
    'landmark': Landmark,
    'id-card': IdCard,
    'file-text': FileText,
    'users': Users,
    'map-pin': MapPin,
    'clock': Clock,
    'calendar-days': CalendarDays,
    'calendar': CalendarDays,
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
    'building': Landmark,
    'bar-chart': TrendingUp,
    'database': Database,
    'list': List,
}

// Helper function - translate label or fallback to formatted key
function getTranslatedLabelMobile(key: string, t: (key: string) => string, isLoaded: boolean): string {
    if (isLoaded) {
        // Try the direct key first (matches lang/id/messages.php structure)
        const translated = t(key)
        // Only use translation if it's different from the key (meaning translation exists)
        if (translated !== key) {
            return translated
        }
        // Also try with nav. prefix for compatibility
        const translatedWithPrefix = t(`nav.${key}`)
        if (translatedWithPrefix !== `nav.${key}`) {
            return translatedWithPrefix
        }
    }
    // Fallback: format the key like before
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Mobile navigation menu (inline version for Sheet)
function NavMenuMobile({onNavigate}: { onNavigate: () => void }) {
    const location = useLocation()
    const privileges = useAuthStore((state) => state.privileges) || []
    const navigate = useNavigate()
    const { t, isLoaded } = useTranslationStore()
    const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(new Set())

    const isActive = (path: string): boolean => {
        const currentPath = location.pathname
        if (currentPath === path) return true
        return path !== '/dashboard' && currentPath.startsWith(path)
    }

    // Check if any child is active
    const isChildActive = (children: { path: string }[]): boolean => {
        return children.some(child => isActive(child.path))
    }

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev => {
            const newSet = new Set(prev)
            if (newSet.has(label)) {
                newSet.delete(label)
            } else {
                newSet.add(label)
            }
            return newSet
        })
    }

    // Filter sections based on privileges - show all if privileges array is empty
    const filteredSections = React.useMemo(() => {
        const hasAnyPrivileges = privileges.length > 0

        if (!hasAnyPrivileges) {
            // Show all navigation items if no privileges are set
            return navigationSections.filter(section => section.items.length > 0)
        }

        return navigationSections
            .filter((section) => section.items.some((item) => hasPrivilege(item.menu, privileges)))
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => hasPrivilege(item.menu, privileges))
            }))
            .filter((section) => section.items.length > 0)
    }, [privileges])

    const handleNavigation = (path: string) => {
        onNavigate()
        navigate({to: path})
    }

    // Helper function to render a single item (recursive for nested)
    const renderItem = (item: any, depth: number = 0) => {
        const Icon = item.icon ? iconMap[item.icon] : null
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedMenus.has(item.label)
        const childActive = hasChildren && isChildActive(item.children)
        const label = getTranslatedLabelMobile(item.label, t, isLoaded)

        if (hasChildren) {
            // Parent item with children
            return (
                <div key={item.label}>
                    <button
                        onClick={() => toggleMenu(item.label)}
                        className={cn(
                            "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition-colors",
                            (childActive || isExpanded)
                                ? "bg-sidebar-accent/50 text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                        style={{paddingLeft: `${12 + depth * 16}px`}}
                    >
                        {Icon && <Icon className="h-4 w-4 shrink-0"/>}
                        <span className="flex-1 text-left truncate">{label}</span>
                        {isExpanded ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                    </button>

                    {/* Children items */}
                    {isExpanded && (
                        <div className="mt-1 space-y-0.5">
                            {item.children.map((child: any) => renderItem(child, depth + 1))}
                        </div>
                    )}
                </div>
            )
        } else {
            // Regular item
            const active = isActive(item.path)

            return (
                <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                        "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition-colors",
                        active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    style={{paddingLeft: `${12 + depth * 16}px`}}
                >
                    {Icon && <Icon className="h-4 w-4 shrink-0"/>}
                    <span className="truncate">{label}</span>
                </button>
            )
        }
    }

    // Show debug message if no sections
    if (filteredSections.length === 0) {
        return (
            <div className="flex flex-col h-full bg-sidebar p-4">
                <div className="text-center text-sidebar-foreground/60 text-sm">
                    <p className="mb-2">No navigation items available</p>
                    <p className="text-xs">privileges: {JSON.stringify(privileges.slice(0, 3))}...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-sidebar">
            {/* Navigation Menu - scrollable */}
            <div className="flex-1 overflow-y-auto py-2">
                <div className="px-3">
                    {filteredSections.map((section, sectionIndex) => {
                        const sectionLabel = getTranslatedLabelMobile(section.label, t, isLoaded)
                        return (
                            <div key={section.label} className="mb-4">
                                {/* Section Header */}
                                <div className="px-2 py-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                                      {sectionLabel}
                                    </span>
                                </div>

                                {/* Section Items */}
                                <div className="space-y-0.5">
                                    {section.items.map((item) => renderItem(item))}
                                </div>

                                {/* Separator between sections */}
                                {sectionIndex < filteredSections.length - 1 && (
                                    <Separator className="mt-4 bg-sidebar-border"/>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// SidebarToggle for backward compatibility
export function SidebarToggle() {
    return null
}

interface MainLayoutProps {
    children: React.ReactNode
    className?: string
}

// Persist collapse state in localStorage
function useCollapseState() {
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        if (typeof window === 'undefined') return false
        const saved = localStorage.getItem('sidebar-collapsed')
        return saved === 'true'
    })

    const toggleCollapse = React.useCallback(() => {
        setIsCollapsed(prev => {
            const newValue = !prev
            localStorage.setItem('sidebar-collapsed', String(newValue))
            return newValue
        })
    }, [])

    return {isCollapsed, toggleCollapse}
}

// Command Palette Root - renders at root level for proper backdrop
function CommandPaletteRoot() {
    const {open, setOpen} = useCommandPalette()
    return <CommandPalette open={open} onOpenChange={setOpen}/>
}

export function MainLayout({children}: MainLayoutProps) {
    const {isCollapsed, toggleCollapse} = useCollapseState()
    const {data: settings} = useSettingsStore()
    const isMobile = useIsMobile()
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                {/* Desktop Sidebar - hidden on mobile */}
                {!isMobile && <AppSidebar isCollapsed={isCollapsed}/>}

                {/* Content area */}
                <div className={cn(
                    "flex flex-col flex-1 min-h-screen transition-all duration-200 ease-in-out",
                    !isMobile && (isCollapsed ? "md:ml-16" : "md:ml-[280px]")
                )}>
                    {/* Topbar */}
                    <Topbar
                        onCollapse={toggleCollapse}
                        isMobile={isMobile}
                        isCollapsed={isCollapsed}
                    />

                    {/* Main Content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <Card className="min-h-[calc(100vh-180px)]">
                            <div className="p-4 sm:p-6">
                                {children}
                            </div>
                        </Card>
                    </main>

                    {/* Footer */}
                    <footer
                        className="border-t border-border bg-card px-6 py-4 text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} {settings?.app_title || 'ERP'} &middot;
                    </footer>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetContent side="left" className="p-0 w-[280px]">
                    <NavMenuMobile onNavigate={() => setMobileSidebarOpen(false)}/>
                </SheetContent>
            </Sheet>

            {/* Command Palette - rendered at root level */}
            <CommandPaletteRoot/>
        </SidebarProvider>
    )
}
