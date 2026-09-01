"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from '@/components/ui/card'
import { SidebarProvider } from "@/components/ui/sidebar"
import { useSettingsStore } from "@/features/settings/store/settings-store"
import { PanelLeft, PanelLeftClose } from "lucide-react"

// Re-export for backward compatibility
export { AppSidebar as Sidebar } from "@/components/app-sidebar"

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

export function MainLayout({ children }: MainLayoutProps) {
  const { isCollapsed, toggleCollapse } = useCollapseState()
  const { data: settings } = useSettingsStore()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar isCollapsed={isCollapsed} />
        {/* Content area - adjusts based on sidebar state */}
        <div className={`
          flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out
          ${isCollapsed ? "ml-16" : "ml-[280px]"}
        `}>
          {/* Header with toggle button */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
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
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium">{settings?.app_title || 'Dashboard'}</h1>
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
