/**
 * Navigation Types
 * Type definitions for sidebar navigation
 */

export interface NavItem {
  label: string
  path: string
  icon?: string
  menu?: string // Privilege menu name (e.g., 'Client', 'Department')
  badge?: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

// Navigation sections matching the Blade template structure
export const navigationSections: NavSection[] = [
  {
    label: 'overview',
    items: [
      { label: 'dashboard', path: '/dashboard' },
    ],
  },
  {
    label: 'master_data',
    items: [
      { label: 'master_data', path: '/master-data', icon: 'database' },
    ],
  },
  {
    label: 'accounting',
    items: [
      { label: 'chart_of_accounts', path: '/chart-of-accounts', menu: 'Chart of Account', icon: 'book' },
      { label: 'journal_entries', path: '/journal-entries', menu: 'Journal Entry', icon: 'file-text' },
      { label: 'opening_balance', path: '/opening-balance', menu: 'Financial Report', icon: 'scale' },
      { label: 'fixed_assets', path: '/fixed-assets', menu: 'Fixed Asset', icon: 'building' },
      { label: 'asset_classes', path: '/tangible-asset-classes', menu: 'Tangible Asset Class', icon: 'layers' },
      { label: 'accounting_periods', path: '/accounting-periods', menu: 'Accounting Period', icon: 'calendar' },
    ],
  },
  {
    label: 'financial_reports',
    items: [
      { label: 'trial_balance', path: '/reports/trial-balance', menu: 'Financial Report', icon: 'scale' },
      { label: 'income_statement', path: '/reports/income-statement', menu: 'Financial Report', icon: 'trending-up' },
      { label: 'balance_sheet', path: '/reports/balance-sheet', menu: 'Financial Report', icon: 'layout' },
      { label: 'cash_flow', path: '/reports/cash-flow', menu: 'Financial Report', icon: 'wallet' },
      { label: 'equity_statement', path: '/reports/equity-statement', menu: 'Financial Report', icon: 'bar-chart' },
    ],
  },
  {
    label: 'human_resources',
    items: [
      { label: 'employees', path: '/employees', menu: 'Employee', icon: 'users' },
      { label: 'attendance', path: '/attendance', menu: 'Attendance', icon: 'clock' },
      { label: 'work_schedule', path: '/schedules', menu: 'Work Schedule', icon: 'calendar-days' },
      { label: 'shifts', path: '/shifts', menu: 'Shift', icon: 'clock' },
    ],
  },
  {
    label: 'finance',
    items: [
      { label: 'bank_accounts', path: '/bank-accounts', menu: 'Bank Account', icon: 'wallet' },
      { label: 'salary_components', path: '/salary-components', menu: 'Salary Component', icon: 'coins' },
      { label: 'petty_cash', path: '/petty-cash', menu: 'Petty Cash', icon: 'banknote' },
      { label: 'invoices', path: '/invoices', menu: 'Invoice', icon: 'receipt' },
      { label: 'payroll', path: '/payroll', menu: 'Payroll', icon: 'wallet' },
    ],
  },
  {
    label: 'inventory',
    items: [
      { label: 'warehouses', path: '/warehouses', menu: 'Warehouse', icon: 'warehouse' },
      { label: 'product_categories', path: '/product-categories', menu: 'Product Category', icon: 'layers' },
      { label: 'products', path: '/products', menu: 'Product', icon: 'package' },
      { label: 'purchase_requests', path: '/purchase-requests', menu: 'Purchase Request', icon: 'clipboard-list' },
      { label: 'purchase_orders', path: '/purchase-orders', menu: 'Purchase Order', icon: 'shopping-cart' },
      { label: 'receptions', path: '/receptions', menu: 'Reception', icon: 'inbox' },
      { label: 'stock_opname', path: '/stock-opnames', menu: 'Stock Opname', icon: 'boxes' },
      { label: 'stock_card', path: '/stock-card', menu: 'Stock Card', icon: 'layers' },
    ],
  },
  {
    label: 'projects',
    items: [
      { label: 'projects', path: '/projects', menu: 'Project', icon: 'folder-kanban' },
    ],
  },
  {
    label: 'security_ops',
    items: [
      { label: 'face_enrollment', path: '/face-enrollments', menu: 'Face Enrollment', icon: 'scan-face' },
      { label: 'field_reports', path: '/reports', menu: 'Field Report', icon: 'camera' },
      { label: 'panic_alert', path: '/panic-alerts', menu: 'Panic Alert', icon: 'alert-triangle' },
      { label: 'news', path: '/news', menu: 'News', icon: 'megaphone' },
      { label: 'approvals', path: '/approvals', menu: 'Approval', icon: 'inbox' },
      { label: 'approval_flows', path: '/approval-flows', menu: 'Approval Flow', icon: 'git-branch' },
      { label: 'patrol_report', path: '/patrol-report', menu: 'Patrol Report', icon: 'scan' },
      { label: 'checkpoints', path: '/checkpoints', menu: 'Checkpoint', icon: 'map-pin' },
      { label: 'daily_task_reports', path: '/daily-task-reports', menu: 'Daily Task', icon: 'clipboard-list' },
      { label: 'daily_task_items', path: '/daily-task-items', menu: 'Daily Task Item', icon: 'clipboard-list' },
    ],
  },
  {
    label: 'administration',
    items: [
      { label: 'users', path: '/users', menu: 'User', icon: 'user-cog' },
      { label: 'departments', path: '/departments', menu: 'Department', icon: 'network' },
      { label: 'roles', path: '/roles', menu: 'Role', icon: 'lock' },
      { label: 'settings', path: '/settings', icon: 'settings' },
    ],
  },
]
