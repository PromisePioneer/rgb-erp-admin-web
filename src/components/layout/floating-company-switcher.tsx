/**
 * Floating Company Switcher
 * Sticky floating button at bottom-right corner
 */
"use client"

import * as React from "react"
import { Building2, Check, ChevronUp } from "lucide-react"
import { useCompanyStore } from '@/stores/company-store'
import { companyApi } from '@/features/companies/api/companies-api'
import { cn } from "@/lib/utils"

interface Company {
  id: number
  name: string
}

export function FloatingCompanySwitcher() {
  const { currentCompany, switchCompany, fetchCompanies } = useCompanyStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Fetch companies
  const loadCompanies = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await companyApi.getSelectOptions({ q: '' })
      setCompanies(response)
    } catch (error) {
      console.error('Failed to load companies:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load companies on mount
  React.useEffect(() => {
    fetchCompanies()
    loadCompanies()
  }, [fetchCompanies, loadCompanies])

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle company switch
  const handleSwitch = async (companyId: number) => {
    try {
      await switchCompany(companyId)
      window.location.reload()
    } catch (error) {
      console.error('Failed to switch company:', error)
    }
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="fixed bottom-6 right-6 z-50">
      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute bottom-full mb-3 right-0 w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pilih Perusahaan
            </p>
          </div>

          {/* Company List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Memuat...
              </div>
            ) : companies.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada perusahaan
              </div>
            ) : (
              companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSwitch(company.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors",
                    currentCompany?.id === company.id && "bg-primary/5"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {company.name}
                    </p>
                  </div>
                  {currentCompany?.id === company.id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center gap-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300",
          isOpen ? "px-4 py-3" : "p-3"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full">
          <img src="/logo-compact.svg" alt="Logo" className="h-full w-full object-contain"/>
        </div>
        {isOpen && (
          <>
            <div className="pr-1">
              <p className="text-sm font-semibold whitespace-nowrap">{currentCompany?.name || 'Pilih'}</p>
            </div>
            <ChevronUp className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </>
        )}
      </button>
    </div>
  )
}
