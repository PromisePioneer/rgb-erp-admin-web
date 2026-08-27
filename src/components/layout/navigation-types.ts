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
      { label: 'Dashboard', path: '/dashboard' },
    ],
  },
  {
    label: 'accounting',
    items: [
      { label: 'Chart of Accounts', path: '/chart-of-accounts', menu: 'Chart of Account', icon: 'book' },
      { label: 'Journal Entries', path: '/journal-entries', menu: 'Journal Entry', icon: 'file-text' },
      { label: 'Fixed Assets', path: '/fixed-assets', menu: 'Fixed Asset', icon: 'building' },
      { label: 'Accounting Periods', path: '/accounting-periods', menu: 'Accounting Period', icon: 'calendar' },
    ],
  },
  {
    label: 'financial_reports',
    items: [
      { label: 'Trial Balance', path: '/reports/trial-balance', menu: 'Financial Report', icon: 'scale' },
      { label: 'Income Statement', path: '/reports/income-statement', menu: 'Financial Report', icon: 'trending-up' },
      { label: 'Balance Sheet', path: '/reports/balance-sheet', menu: 'Financial Report', icon: 'layout' },
      { label: 'Cash Flow', path: '/reports/cash-flow', menu: 'Financial Report', icon: 'wallet' },
      { label: 'Equity Statement', path: '/reports/equity-statement', menu: 'Financial Report', icon: 'bar-chart' },
    ],
  },
  {
    label: 'master_data',
    items: [
      { label: 'Clients', path: '/clients', menu: 'Client', icon: 'briefcase' },
      { label: 'Client Types', path: '/client-types', menu: 'Client Type', icon: 'tags' },
      { label: 'Provinces', path: '/provinces', menu: 'Province', icon: 'map-pin' },
      { label: 'Banks', path: '/banks', menu: 'Bank', icon: 'landmark' },
      { label: 'Positions', path: '/positions', menu: 'Position', icon: 'id-card' },
      { label: 'Documents', path: '/documents', menu: 'Document', icon: 'file-text' },
    ],
  },
  {
    label: 'human_resources',
    items: [
      { label: 'Employees', path: '/employees', menu: 'Employee', icon: 'users' },
      { label: 'Attendance', path: '/attendance', menu: 'Attendance', icon: 'clock' },
      { label: 'Work Schedule', path: '/schedules', menu: 'Work Schedule', icon: 'calendar-days' },
      { label: 'Shifts', path: '/shifts', menu: 'Shift', icon: 'clock' },
    ],
  },
  {
    label: 'finance',
    items: [
      { label: 'Bank Accounts', path: '/bank-accounts', menu: 'Bank Account', icon: 'wallet' },
      { label: 'Salary Components', path: '/salary-components', menu: 'Salary Component', icon: 'coins' },
      { label: 'Petty Cash', path: '/petty-cash', menu: 'Petty Cash', icon: 'banknote' },
      { label: 'Invoices', path: '/invoices', menu: 'Invoice', icon: 'receipt' },
      { label: 'Payroll', path: '/payroll', menu: 'Payroll', icon: 'wallet' },
    ],
  },
  {
    label: 'inventory',
    items: [
      { label: 'Warehouses', path: '/warehouses', menu: 'Warehouse', icon: 'warehouse' },
      { label: 'Product Categories', path: '/product-categories', menu: 'Product Category', icon: 'layers' },
      { label: 'Products', path: '/products', menu: 'Product', icon: 'package' },
      { label: 'Purchase Requests', path: '/purchase-requests', menu: 'Purchase Request', icon: 'clipboard-list' },
      { label: 'Purchase Orders', path: '/purchase-orders', menu: 'Purchase Order', icon: 'shopping-cart' },
      { label: 'Receptions', path: '/receptions', menu: 'Reception', icon: 'inbox' },
      { label: 'Stock Opname', path: '/stock-opnames', menu: 'Stock Opname', icon: 'boxes' },
      { label: 'Stock Card', path: '/stock-card', menu: 'Stock Card', icon: 'layers' },
    ],
  },
  {
    label: 'projects',
    items: [
      { label: 'Projects', path: '/projects', menu: 'Project', icon: 'folder-kanban' },
    ],
  },
  {
    label: 'security_ops',
    items: [
      { label: 'Face Enrollment', path: '/face-enrollments', menu: 'Face Enrollment', icon: 'scan-face' },
      { label: 'Field Reports', path: '/reports', menu: 'Field Report', icon: 'camera' },
      { label: 'Panic Alert', path: '/panic-alerts', menu: 'Panic Alert', icon: 'alert-triangle' },
      { label: 'News', path: '/news', menu: 'News', icon: 'megaphone' },
      { label: 'Approvals', path: '/approvals', menu: 'Approval', icon: 'inbox' },
      { label: 'Approval Flows', path: '/approval-flows', menu: 'Approval Flow', icon: 'git-branch' },
      { label: 'Patrol Report', path: '/patrol-report', menu: 'Patrol Report', icon: 'scan' },
      { label: 'Checkpoints', path: '/checkpoints', menu: 'Checkpoint', icon: 'map-pin' },
    ],
  },
  {
    label: 'administration',
    items: [
      { label: 'Users', path: '/users', menu: 'User', icon: 'user-cog' },
      { label: 'Departments', path: '/departments', menu: 'Department', icon: 'network' },
      { label: 'Roles', path: '/roles', menu: 'Role', icon: 'lock' },
      { label: 'Settings', path: '/settings', icon: 'settings' },
    ],
  },
]

// Translation labels (same as Laravel lang files)
export const navLabels: Record<string, Record<string, string>> = {
  en: {
    overview: 'Overview',
    accounting: 'Accounting',
    financial_reports: 'Financial Reports',
    master_data: 'Master Data',
    human_resources: 'Human Resources',
    finance: 'Finance',
    inventory: 'Inventory',
    projects: 'Projects',
    security_ops: 'Security & Operations',
    administration: 'Administration',
    dashboard: 'Dashboard',
    chart_of_accounts: 'Chart of Accounts',
    journal_entries: 'Journal Entries',
    fixed_assets: 'Fixed Assets',
    accounting_periods: 'Accounting Periods',
    trial_balance: 'Trial Balance',
    income_statement: 'Income Statement',
    cash_flow: 'Cash Flow',
    equity_statement: 'Equity Statement',
    clients: 'Clients',
    client_types: 'Client Types',
    banks: 'Banks',
    positions: 'Positions',
    documents: 'Documents',
    employees: 'Employees',
    employee_placements: 'Employee Placements',
    attendance: 'Attendance',
    work_schedule: 'Work Schedule',
    shifts: 'Shifts',
    bank_accounts: 'Bank Accounts',
    salary_components: 'Salary Components',
    petty_cash: 'Petty Cash',
    invoices: 'Invoices',
    payroll: 'Payroll',
    warehouses: 'Warehouses',
    product_categories: 'Product Categories',
    products: 'Products',
    purchase_requests: 'Purchase Requests',
    purchase_orders: 'Purchase Orders',
    receptions: 'Receptions',
    stock_opname: 'Stock Opname',
    stock_card: 'Stock Card',
    face_enrollment: 'Face Enrollment',
    field_reports: 'Field Reports',
    panic_alert: 'Panic Alert',
    news: 'News',
    approvals: 'Approvals',
    approval_flows: 'Approval Flows',
    patrol_report: 'Patrol Report',
    checkpoints: 'Checkpoints',
    users: 'Users',
    departments: 'Departments',
    roles: 'Roles',
    settings: 'Settings',
  },
  id: {
    overview: 'Ikhtisar',
    accounting: 'Akuntansi',
    financial_reports: 'Laporan Keuangan',
    master_data: 'Data Master',
    human_resources: 'Sumber Daya Manusia',
    finance: 'Keuangan',
    inventory: 'Inventori',
    projects: 'Proyek',
    security_ops: 'Keamanan & Operasi',
    administration: 'Administrasi',
    dashboard: 'Dasbor',
    chart_of_accounts: 'Daftar Akun',
    journal_entries: 'Jurnal Umum',
    fixed_assets: 'Aktiva Tetap',
    accounting_periods: 'Periode Akuntansi',
    trial_balance: 'Neraca Percobaan',
    income_statement: 'Laporan Laba Rugi',
    cash_flow: 'Arus Kas',
    equity_statement: 'Perubahan Modal',
    clients: 'Klien',
    client_types: 'Tipe Klien',
    banks: 'Bank',
    positions: 'Jabatan',
    documents: 'Dokumen',
    employees: 'Karyawan',
    employee_placements: 'Penempatan Karyawan',
    attendance: 'Kehadiran',
    work_schedule: 'Jadwal Kerja',
    shifts: 'Shift',
    bank_accounts: 'Rekening Bank',
    salary_components: 'Komponen Gaji',
    petty_cash: 'Kas Kecil',
    invoices: 'Faktur',
    payroll: 'Payroll',
    warehouses: 'Gudang',
    product_categories: 'Kategori Produk',
    products: 'Produk',
    purchase_requests: 'Permintaan Pembelian',
    purchase_orders: 'Pesanan Pembelian',
    receptions: 'Penerimaan',
    stock_opname: 'Stock Opname',
    stock_card: 'Kartu Stok',
    face_enrollment: 'Face Enrollment',
    field_reports: 'Laporan Lapangan',
    panic_alert: 'Panik Alert',
    news: 'Berita',
    approvals: 'Persetujuan',
    approval_flows: 'Alur Persetujuan',
    patrol_report: 'Laporan Patroli',
    checkpoints: 'Titik Pemeriksaan',
    users: 'Pengguna',
    departments: 'Departemen',
    roles: 'Peran',
    settings: 'Pengaturan',
  },
}
