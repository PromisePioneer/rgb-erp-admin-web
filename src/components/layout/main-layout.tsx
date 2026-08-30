"use client"

import {useState} from 'react'
import {Sidebar} from './sidebar'
import {Topbar} from './topbar'

interface MainLayoutProps {
    children: React.ReactNode
    className?: string
}

export function MainLayout({children}: MainLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            <Sidebar collapsed={sidebarCollapsed}/>
            <div className="min-h-screen flex flex-col lg:pl-64">
                <Topbar onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}/>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
                <footer className="px-6 py-4 text-center text-xs text-muted-foreground border-t border-border">
                    &copy; {new Date().getFullYear()} ERP Security &middot;
                </footer>
            </div>
        </div>
    )
}
