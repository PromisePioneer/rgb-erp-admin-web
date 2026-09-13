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
    children?: NavItem[] // For nested menus
}

export interface NavSection {
    label: string
    items: NavItem[]
}

// Navigation sections - Master Data items moved to Master Data Hub
export const navigationSections: NavSection[] = [
    {
        label: 'overview',
        items: [
            {label: 'dashboard', path: '/dashboard', icon: 'layout-dashboard'},
        ],
    },
    {
        label: 'master_data',
        items: [
            {label: 'master_data', path: '/master-data', icon: 'database'},
        ],
    },
    {
        label: 'accounting',
        items: [
            {label: 'journal_entries', path: '/journal-entries', menu: 'Journal Entry', icon: 'file-text'},
            {label: 'opening_balance', path: '/opening-balance', menu: 'Financial Report', icon: 'scale'},
            {label: 'fixed_assets', path: '/fixed-assets', menu: 'Fixed Asset', icon: 'building'},
            {label: 'accounting_periods', path: '/accounting-periods', menu: 'Accounting Period', icon: 'calendar'},
        ],
    },
    {
        label: 'financial_reports',
        items: [
            {label: 'financial_reports', path: '/financial-reports', icon: 'bar-chart'},
        ],
    },
    {
        label: 'human_resources',
        items: [
            {label: 'attendance', path: '/attendance', menu: 'Attendance', icon: 'clock'},
            {label: 'work_schedule', path: '/schedules', menu: 'Work Schedule', icon: 'calendar-days'},
        ],
    },
    {
        label: 'finance',
        items: [
            {label: 'invoices', path: '/invoices', menu: 'Invoice', icon: 'receipt'},
            {label: 'payroll', path: '/payroll', menu: 'Payroll', icon: 'wallet'},
        ],
    },
    {
        label: 'inventory',
        items: [
            {label: 'inventory', path: '/inventory', menu: 'Product', icon: 'scan', badge: 'new'},
            {label: 'procurement', path: '/procurement', icon: 'shopping-cart'},
            {label: 'stock_opname', path: '/stock-opnames', menu: 'Stock Opname', icon: 'boxes'},
            {label: 'stock_card', path: '/stock-card', menu: 'Stock Card', icon: 'layers'},
        ],
    },
    {
        label: 'projects',
        items: [
            {label: 'projects', path: '/projects', menu: 'Project', icon: 'folder-kanban'},
        ],
    },
    {
        label: 'security_ops',
        items: [
            {label: 'face_enrollment', path: '/face-enrollments', menu: 'Face Enrollment', icon: 'scan-face'},
            {label: 'field_reports', path: '/reports', menu: 'Field Report', icon: 'camera'},
            {label: 'panic_alert', path: '/panic-alerts', menu: 'Panic Alert', icon: 'alert-triangle'},
            {label: 'news', path: '/news', menu: 'News', icon: 'megaphone'},
            {
                label: 'approvals',
                path: '/approvals',
                icon: 'inbox',
                children: [
                    {label: 'approval_list', path: '/approvals', menu: 'Approval', icon: 'inbox'},
                    {label: 'approval_types', path: '/approval-types', menu: 'Approval Flow', icon: 'list'},
                ]
            },
            {label: 'patrol_report', path: '/patrol-report', menu: 'Patrol Report', icon: 'scan'},
            {label: 'checkpoints', path: '/checkpoints', menu: 'Checkpoint', icon: 'map-pin'},
            {label: 'daily_task_reports', path: '/daily-task-reports', menu: 'Daily Task', icon: 'clipboard-list'},
        ],
    },
]
