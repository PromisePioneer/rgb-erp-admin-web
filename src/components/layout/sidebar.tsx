"use client"

import * as React from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { type LucideIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from '@/components/ui/card'
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSettingsStore } from "@/features/settings/store/settings-store"
import { useCompanyStore } from '@/stores/company-store'
import { useTranslationStore } from '@/stores/translation-store'
import { useAuthStore } from '@/stores/auth-store'
import { navigationSections } from "@/components/layout/navigation-types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  PanelLeft,
  PanelLeftClose,
  Bell,
  Globe,
  Menu,
  Database,
} from "lucide-react"
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { companyApi } from '@/features/companies/api/companies-api'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

// Re-export for backward compatibility
export { AppSidebar as Sidebar } from "@/components/app-sidebar"

// Helper function
function getLabel(key: string): string {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function hasPrivilege(menu: string | undefined, privileges: string[]): boolean {
  if (!menu) return true
  return privileges.some((p) => p.startsWith(`${menu},View`))
}

// Icon map
const iconMap: Record<string, LucideIcon> = {
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
}

// Mobile navigation menu (inline version for Sheet)
function NavMenuMobile({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const privileges = useAuthStore((state) => state.privileges) || []
  const navigate = useNavigate()

  const isActive = (path: string): boolean => {
    const currentPath = location.pathname
    if (currentPath === path) return true
    return path !== '/dashboard' && currentPath.startsWith(path)
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

  // Debug: log filtered sections count
  React.useEffect(() => {
    console.log('[MobileSidebar] Navigation sections:', filteredSections.length)
  }, [filteredSections])

  const handleNavigation = (path: string) => {
    console.log('[MobileSidebar] Navigating to:', path)
    onNavigate()
    navigate({ to: path })
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
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          {filteredSections.map((section, sectionIndex) => (
            <div key={section.label} className="mb-4">
              {/* Section Header */}
              <div className="px-2 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {getLabel(section.label)}
                </span>
              </div>

              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon ? iconMap[item.icon] : null
                  const active = isActive(item.path)

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{getLabel(item.label)}</span>
                    </button>
                  )
                })}
              </div>

              {/* Separator between sections */}
              {sectionIndex < filteredSections.length - 1 && (
                <Separator className="mt-4 bg-sidebar-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mobile sidebar wrapper with Sheet
function MobileSidebar() {
  const [open, setOpen] = React.useState(false)
  const { user } = useAuthStore()
  const { data: settings } = useSettingsStore()

  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/default.jpg",
  }

  const handleNavigate = () => {
    console.log('[MobileSidebar] Closing sidebar')
    setOpen(false)
  }

  console.log('[MobileSidebar] Rendering, open:', open)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col p-0 w-[280px] bg-sidebar border-r border-sidebar-border"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              {settings?.company_name || "RGB Corp"}
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {settings?.app_title || "Admin"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <NavMenuMobile onNavigate={handleNavigate} />

        {/* Footer / User */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback className="rounded-lg text-xs">
                {userData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">{userData.name}</span>
              <span className="text-xs text-sidebar-foreground/60">{userData.email}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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

  return { isCollapsed, toggleCollapse }
}

// Load companies for select
async function loadCompanies(search: string): Promise<SelectOption[]> {
  try {
    const response = await companyApi.getSelectOptions({ q: search })
    return response.map((company) => ({
      value: company.id,
      label: company.name,
    }))
  } catch {
    return []
  }
}

// Clock component
function HeaderClock() {
  const [time, setTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="font-medium">{formatTime(time)}</span>
      <span className="text-xs">·</span>
      <span>{formatDate(time)}</span>
    </div>
  )
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isCollapsed, toggleCollapse } = useCollapseState()
  const { data: settings } = useSettingsStore()
  const { currentCompany, switchCompany, fetchCompanies } = useCompanyStore()
  const { locale, setLocale } = useTranslationStore()
  const [langMenuOpen, setLangMenuOpen] = React.useState(false)
  const isMobile = useIsMobile()

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

  // Handle language change
  const handleLanguageChange = (newLocale: 'en' | 'id') => {
    setLocale(newLocale)
    setLangMenuOpen(false)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar - hidden on mobile */}
        {!isMobile && <AppSidebar isCollapsed={isCollapsed} />}

        {/* Content area - adjusts based on sidebar state */}
        <div className={cn(
          "flex flex-col flex-1 min-h-screen transition-all duration-200 ease-in-out",
          !isMobile && (isCollapsed ? "md:ml-16" : "md:ml-[280px]")
        )}>
          {/* Header with toggle button */}
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
            {/* Mobile hamburger menu - always rendered, hidden on md+ */}
            <MobileSidebar />

            {/* Desktop collapse toggle */}
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="p-1.5 hover:bg-accent rounded-md transition-colors"
              >
                {isCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            )}
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium">{settings?.app_title || 'Dashboard'}</h1>
            </div>

            {/* Clock - Center */}
            <div className="flex-1 flex justify-center">
              <HeaderClock />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Company Selector - hidden on small mobile */}
              {!isMobile && (
                <div className="w-[200px]">
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
                  title="Change Language"
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-xs font-medium uppercase">{locale}</span>
                </button>

                {/* Dropdown */}
                {langMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => handleLanguageChange('id')}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors ${
                            locale === 'id' ? 'bg-accent text-primary font-medium' : 'text-foreground'
                          }`}
                        >
                          🇮🇩 Indonesia
                        </button>
                        <button
                          onClick={() => handleLanguageChange('en')}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors ${
                            locale === 'en' ? 'bg-accent text-primary font-medium' : 'text-foreground'
                          }`}
                        >
                          🇬🇧 English
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Card className="min-h-[calc(100vh-180px)]">
              <div className="p-4 sm:p-6">
                {children}
              </div>
            </Card>
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card px-6 py-4 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {settings?.app_title || 'ERP'} &middot;
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
