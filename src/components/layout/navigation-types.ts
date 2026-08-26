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
    label: 'finance_reports',
    items: [
      { label: 'Journal', path: '/finance/journal', menu: 'Finance Report', icon: 'book-open' },
      { label: 'Ledger', path: '/finance/ledger', menu: 'Finance Report', icon: 'book' },
      { label: 'Balance Sheet', path: '/finance/balance-sheet', menu: 'Finance Report', icon: 'scale' },
      { label: 'Profit & Loss', path: '/finance/profit-loss', menu: 'Finance Report', icon: 'trending-up' },
    ],
  },
  {
    label: 'inventory_procurement',
    items: [
      { label: 'Warehouses', path: '/warehouses', menu: 'Warehouse', icon: 'warehouse' },
      { label: 'Product Categories', path: '/product-categories', menu: 'Product Category', icon: 'layers' },
      { label: 'Products', path: '/products', menu: 'Product', icon: 'package' },
      { label: 'Assets', path: '/assets', menu: 'Asset', icon: 'shirt' },
      { label: 'Purchase Requests', path: '/purchase-requests', menu: 'Purchase Request', icon: 'clipboard-list' },
      { label: 'Purchase Orders', path: '/purchase-orders', menu: 'Purchase Order', icon: 'shopping-cart' },
      { label: 'Receptions', path: '/receptions', menu: 'Reception', icon: 'inbox' },
      { label: 'Stock Opname', path: '/stock-opnames', menu: 'Stock Opname', icon: 'boxes' },
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
    master_data: 'Master Data',
    provinces: 'Provinces',
    human_resources: 'Human Resources',
    finance: 'Finance',
    finance_reports: 'Finance Reports',
    inventory_procurement: 'Inventory & Procurement',
    projects_nav: 'Projects',
    security_ops: 'Security & Operations',
    administration: 'Administration',
    dashboard: 'Dashboard',
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
    journal: 'Journal',
    ledger: 'Ledger',
    balance_sheet: 'Balance Sheet',
    profit_loss: 'Profit & Loss',
    warehouses: 'Warehouses',
    product_categories: 'Product Categories',
    products: 'Products',
    assets: 'Assets',
    purchase_requests: 'Purchase Requests',
    purchase_orders: 'Purchase Orders',
    receptions: 'Receptions',
    stock_opname: 'Stock Opname',
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
    master_data: 'Data Master',
    provinces: 'Provinsi',
    human_resources: 'Sumber Daya Manusia',
    finance: 'Keuangan',
    finance_reports: 'Laporan Keuangan',
    inventory_procurement: 'Inventori & Pengadaan',
    projects_nav: 'Proyek',
    security_ops: 'Keamanan & Operasi',
    administration: 'Administrasi',
    dashboard: 'Dasbor',
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
    journal: 'Jurnal',
    ledger: 'Buku Besar',
    balance_sheet: 'Neraca',
    profit_loss: 'Laba Rugi',
    warehouses: 'Gudang',
    product_categories: 'Kategori Produk',
    products: 'Produk',
    assets: 'Aset',
    purchase_requests: 'Permintaan Pembelian',
    purchase_orders: 'Pesanan Pembelian',
    receptions: 'Penerimaan',
    stock_opname: 'Stock Opname',
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
