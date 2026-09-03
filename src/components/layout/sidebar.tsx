"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from '@/components/ui/card'
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSettingsStore } from "@/features/settings/store/settings-store"
import { useCompanyStore } from '@/stores/company-store'
import { useTranslationStore } from '@/stores/translation-store'
import { PanelLeft, PanelLeftClose, Bell, Globe, Menu } from "lucide-react"
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { companyApi } from '@/features/companies/api/companies-api'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

// Re-export for backward compatibility
export { AppSidebar as Sidebar } from "@/components/app-sidebar"

// Mobile sidebar wrapper with Sheet
function MobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <AppSidebar isCollapsed={false} />
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
        <div className={`
          flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out
          ${!isMobile ? (isCollapsed ? "ml-16" : "ml-[280px]") : ""}
        `}>
          {/* Header with toggle button */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
            {/* Mobile hamburger menu */}
            {isMobile && <MobileSidebar />}

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
