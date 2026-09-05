/**
 * Topbar Component
 * Header with breadcrumbs, user menu, and notifications
 */
import {useState, useCallback, useEffect} from 'react'
import {useLocation} from '@tanstack/react-router'
import {useAuthStore} from '@/stores/auth-store'
import {useCompanyStore} from '@/stores/company-store'
import {useTranslationStore} from '@/stores/translation-store'
import {SidebarToggle} from './sidebar'
import {NotificationBell} from '@/components/layout/notification-bell'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {companyApi} from '@/features/companies/api/companies-api'
import {CommandPalette, useCommandPalette} from '@/components/ui/command-palette'
import {ChevronDown, Globe, LogOut, Moon, PanelLeftClose, Search, Sun, User} from "lucide-react";

// Get page title from path
function getPageTitle(path: string): string {
    const titles: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/clients': 'Clients',
        '/client-types': 'Client Types',
        '/banks': 'Banks',
        '/documents': 'Documents',
        '/employees': 'Employees',
        '/employee-placements': 'Employee Placements',
        '/attendance': 'Attendance',
        '/schedules': 'Work Schedule',
        '/shifts': 'Shifts',
        '/bank-accounts': 'Bank Accounts',
        '/salary-components': 'Salary Components',
        '/petty-cash': 'Petty Cash',
        '/invoices': 'Invoices',
        '/payroll': 'Payroll',
        '/finance/journal': 'Journal',
        '/finance/ledger': 'Ledger',
        '/finance/balance-sheet': 'Balance Sheet',
        '/finance/profit-loss': 'Profit & Loss',
        '/warehouses': 'Warehouses',
        '/product-categories': 'Product Categories',
        '/products': 'Products',
        '/assets': 'Assets',
        '/purchase-requests': 'Purchase Requests',
        '/purchase-orders': 'Purchase Orders',
        '/receptions': 'Receptions',
        '/stock-opnames': 'Stock Opname',
        '/projects': 'Projects',
        '/face-enrollments': 'Face Enrollment',
        '/reports': 'Field Reports',
        '/panic-alerts': 'Panic Alert',
        '/news': 'News',
        '/approvals': 'Approvals',
        '/approval-flows': 'Approval Flows',
        '/patrol-report': 'Patrol Report',
        '/checkpoints': 'Checkpoints',
        '/users': 'Users',
        '/departments': 'Departments',
        '/roles': 'Roles',
        '/settings': 'Settings',
    }

    // Check exact match first
    if (titles[path]) return titles[path]

    // Check parent paths
    for (const [key, title] of Object.entries(titles)) {
        if (path.startsWith(key)) return title
    }

    return 'Admin Panel'
}

interface TopbarProps {
    onCollapse?: () => void
}

export function Topbar({onCollapse}: TopbarProps) {
    const {user, logout} = useAuthStore()
    const {currentCompany, switchCompany, fetchCompanies} = useCompanyStore()
    const {locale, setLocale} = useTranslationStore()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [langMenuOpen, setLangMenuOpen] = useState(false)
    const location = useLocation()
    const pageTitle = getPageTitle(location.pathname)
    const {open: isCommandPaletteOpen, setOpen: setCommandPaletteOpen} = useCommandPalette()

    // Dark mode toggle
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark')
        }
        return false
    })

    const toggleDarkMode = () => {
        const newIsDark = !isDark
        setIsDark(newIsDark)
        if (newIsDark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    // Init dark mode from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark').matches)) {
            document.documentElement.classList.add('dark')
            setIsDark(true)
        }
    }, [])

    // Fetch companies on mount
    useEffect(() => {
        fetchCompanies()
    }, [fetchCompanies])

    const handleLogout = async () => {
        try {
            await logout()
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleLanguageChange = async (newLocale: 'en' | 'id') => {
        setLocale(newLocale)
        setLangMenuOpen(false)
        // Optionally reload to refresh all translations
        // window.location.reload()
    }

    // Load companies for select
    const loadCompanies = useCallback(async (search: string): Promise<SelectOption[]> => {
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

    // Handle company change
    const handleCompanyChange = async (value: number | string | null) => {
        if (!value) return
        try {
            await switchCompany(Number(value))
            // Reload the page to refresh all data with new company context
            window.location.reload()
        } catch (error) {
            console.error('Failed to switch company:', error)
        }
    }

    return (
        <header
            className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4">
            {/* Mobile menu toggle */}
            <SidebarToggle/>

            {/* Collapse button - desktop only */}
            {onCollapse && (
                <button
                    onClick={onCollapse}
                    className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Collapse sidebar"
                >
                    <PanelLeftClose className="h-5 w-5 rotate-180"/>
                </button>
            )}

            {/* Page title */}
            <h1 className="font-bold text-lg text-foreground">{pageTitle}</h1>

            {/* Spacer */}
            <div className="flex-1"/>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                {/* Command Palette Search Input - always visible */}
                <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                >
                    <Search className="h-4 w-4 shrink-0"/>
                    <span className="text-sm">Search menus...</span>
                    <kbd
                        className="pointer-events-none hidden sm:flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>

                {/* Company Selector */}
                <div className="w-[200px]">
                    <AsyncSelect
                        value={currentCompany?.id ?? null}
                        onChange={handleCompanyChange}
                        loadOptions={loadCompanies}
                        placeholder="Select Company"
                    />
                </div>

                {/* Language Switcher */}
                <div className="relative" data-state={langMenuOpen ? 'open' : 'closed'}>
                    <button
                        onClick={() => setLangMenuOpen(!langMenuOpen)}
                        className="flex items-center gap-1.5 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Change Language"
                    >
                        <Globe className="h-5 w-5"/>
                        <span className="text-xs font-medium uppercase">{locale}</span>
                    </button>

                    {/* Dropdown */}
                    {langMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}/>
                            <div
                                className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
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
                <NotificationBell/>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title={isDark ? 'Light Mode' : 'Dark Mode'}
                >
                    {isDark ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
                </button>

                {/* User menu */}
                <div className="relative" data-state={userMenuOpen ? 'open' : 'closed'}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md hover:bg-accent transition-colors"
                    >
            <span
                className="h-8 w-8 rounded-md bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
                        <span className="hidden sm:flex items-center gap-2">
              <span className="text-left leading-tight">
                <span className="block text-sm font-semibold text-foreground">
                  {user?.name || 'User'}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Staff
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground"/>
            </span>
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}/>
                            <div
                                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                                <div className="py-1">
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4"/>
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-accent transition-colors"
                                    >
                                        <LogOut className="h-4 w-4"/>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Command Palette Dialog */}
            <CommandPalette open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}/>
        </header>
    )
}
