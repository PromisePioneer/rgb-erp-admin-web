/**
 * Procurement Hub Component
 * Unified page for: Purchase Request, Purchase Order, Reception, Distribution, Fund Request
 */
import { useState } from 'react'
import {
  ShoppingCart,
  ClipboardList,
  Package,
  GitBranch,
  Wallet,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Components
import { PurchaseRequestsTable } from '@/features/purchase-requests'
import { PurchaseOrdersTable } from '@/features/purchase-orders'
import { ReceptionsTable } from '@/features/receptions'
import { DistributionRequestsTable } from '@/features/distribution-requests'
import { FundRequestsTable } from '@/features/fund-requests'

// Types
type ProcurementTab = 'purchase-requests' | 'purchase-orders' | 'receptions' | 'distribution-requests' | 'fund-requests'

interface ProcurementTabItem {
  id: ProcurementTab
  name: string
  nameId: string
  description: string
  icon: LucideIcon
  color: string
}

// Tab configuration
const procurementTabs: ProcurementTabItem[] = [
  {
    id: 'purchase-requests',
    name: 'Purchase Requests',
    nameId: 'Pengajuan Pembelian',
    description: 'Manage purchase requests',
    icon: ClipboardList,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'purchase-orders',
    name: 'Purchase Orders',
    nameId: 'Purchase Order',
    description: 'Manage purchase orders',
    icon: ShoppingCart,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'receptions',
    name: 'Receptions',
    nameId: 'Penerimaan Barang',
    description: 'Manage goods reception',
    icon: Package,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    id: 'distribution-requests',
    name: 'Distribution Requests',
    nameId: 'Distribusi',
    description: 'Manage distribution requests',
    icon: GitBranch,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    id: 'fund-requests',
    name: 'Fund Requests',
    nameId: 'Pengajuan Dana',
    description: 'Manage fund requests',
    icon: Wallet,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
  },
]

// Tab content mapping
const TabContent: Record<ProcurementTab, React.ReactNode> = {
  'purchase-requests': <PurchaseRequestsTable />,
  'purchase-orders': <PurchaseOrdersTable />,
  'receptions': <ReceptionsTable />,
  'distribution-requests': <DistributionRequestsTable />,
  'fund-requests': <FundRequestsTable />,
}

// Tab titles
const TabTitles: Record<ProcurementTab, { title: string; subtitle: string }> = {
  'purchase-requests': {
    title: 'Pengajuan Pembelian',
    subtitle: 'Kelola pengajuan pembelian barang'
  },
  'purchase-orders': {
    title: 'Purchase Order',
    subtitle: 'Kelola purchase order dari supplier'
  },
  'receptions': {
    title: 'Penerimaan Barang',
    subtitle: 'Kelola data penerimaan barang dari supplier'
  },
  'distribution-requests': {
    title: 'Distribusi',
    subtitle: 'Kelola permintaan distribusi barang'
  },
  'fund-requests': {
    title: 'Pengajuan Dana',
    subtitle: 'Kelola pengajuan dana untuk purchase order'
  },
}

export function ProcurementHub() {
  const [activeTab, setActiveTab] = useState<ProcurementTab>('purchase-requests')

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* ===== LEFT SIDEBAR - Tab Navigation ===== */}
      <div className="w-72 flex-shrink-0 overflow-y-auto rounded-lg border bg-card">
        <div className="sticky top-0 z-10 border-b bg-card px-4 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Procurement
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Kelola procurement & distribusi
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="p-3">
          <div className="space-y-1">
            {procurementTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all',
                    isActive
                      ? `${tab.color} border bg-card shadow-sm`
                      : 'border-transparent bg-card hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-background/80 shadow-sm'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Text */}
                  <div className="flex flex-1 flex-col">
                    <span className={cn(
                      'text-sm font-semibold',
                      isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {tab.nameId}
                    </span>
                    <span className={cn(
                      'text-xs',
                      isActive ? 'text-foreground/70' : 'text-muted-foreground'
                    )}>
                      {tab.description}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition-transform',
                      isActive ? 'text-foreground' : 'text-muted-foreground/50'
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== RIGHT CONTENT ===== */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        {/* Content Header */}
        <div className="flex-shrink-0 border-b bg-card px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Procurement</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">
              {TabTitles[activeTab].title}
            </span>
          </div>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {TabTitles[activeTab].title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {TabTitles[activeTab].subtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6">
          {TabContent[activeTab]}
        </div>
      </div>
    </div>
  )
}
