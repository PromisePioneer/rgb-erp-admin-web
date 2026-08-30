import {
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,
} from '@tanstack/react-router'
import {Toaster} from 'sonner'
import {useState, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useAuthStore} from '@/stores/auth-store'
import {requirePrivilegeInBeforeLoad} from '@/lib/privilege-guard'
import {useNavigate} from '@tanstack/react-router'
import {ArrowLeft, ShieldCheck, Eye, EyeOff} from 'lucide-react'
import {ReportsTable} from '@/features/reports/components/reports-table'
import {ClientsTable} from '@/features/clients/components/clients-table'
import {ClientsForm} from '@/features/clients/components/clients-form'
import {DepartmentsTable} from '@/features/departments/components/departments-table'
import {RolesTable} from '@/features/roles/components/roles-table'
import {RolesPrivilegesForm} from '@/features/roles/components/roles-privileges-form'
import {Placeholder} from '@/components/placeholder'
import {MainLayout} from '@/components/layout'
import {SettingsForm} from '@/features/settings'
import {UsersTable} from '@/features/users'
import {ClientTypesTable} from '@/features/client-types'
import {PositionsTable} from '@/features/positions'
import {PositionPrivilegesForm} from '@/features/position-privileges'
import {BanksTable} from '@/features/banks'
import {DocumentsTable} from '@/features/documents'
import {ShiftsTable} from '@/features/shifts'
import {WarehousesTable} from '@/features/warehouses'
import {ProductCategoriesTable} from '@/features/product-categories'
import {SalaryComponentsTable} from '@/features/salary-components'
import {EmployeesTable, EmployeesForm} from '@/features/employees'
import {AreasTable} from '@/features/areas'
import {PossTable} from '@/features/poss'
import {ProvincesTable} from '@/features/provinces'
import {AttendancesTable} from '@/features/attendances'
import {SchedulesTable} from '@/features/schedules'
import {BankAccountsTable} from '@/features/bank-accounts'
import {PettyCashTable} from '@/features/petty-cash'
import {InvoicesTable} from '@/features/invoices'
import {
    JournalTable,
    LedgerView,
    BalanceSheetView,
    ProfitLossView,
} from '@/features/finance'
import {PayrollTable} from '@/features/payroll'
import {AccountsTable} from '@/features/accounts'
import {AccountsTable as ChartOfAccountsTable} from '@/features/chart-of-accounts/components/accounts-table'
import {JournalEntriesTable} from '@/features/journal-entries/components/journal-table'
import {StockCardTable} from '@/features/stock-card/components/stock-card-table'
import {TrialBalanceReport} from '@/features/financial-reports/components/trial-balance'
import {DashboardPage as DashboardContent} from '@/features/dashboard'
import {IncomeStatementReport} from '@/features/financial-reports/components/income-statement'
import {BalanceSheetReport} from '@/features/financial-reports/components/balance-sheet'
import {CashFlowReport} from '@/features/financial-reports/components/cash-flow'
import {EquityStatementReport} from '@/features/financial-reports/components/equity-statement'
import {AccountingPeriodsTable} from '@/features/accounting-periods/components/accounting-periods-table'
import {OpeningBalancePage} from '@/features/opening-balance/components/OpeningBalancePage'
import {FixedAssetsTable} from '@/features/fixed-assets/components/fixed-assets-table'
import {TangibleAssetClassesTable} from '@/features/tangible-asset-classes/components/tangible-asset-classes-table'
import {Button} from "@/components/ui";
import {PanicAlertsTable} from '@/features/panic-alerts'
import {ApprovalsTable} from '@/features/approvals'
import {ApprovalFlowsTable} from '@/features/approval-flows'
import {CheckpointsTable} from '@/features/checkpoints'
import {PatrolReportsTable} from '@/features/patrol-reports'
import {DailyTaskReportsList} from '@/features/daily-task-reports'
import {ProductsTable} from '@/features/products'
import {PurchaseRequestsTable, PurchaseRequestsForm} from '@/features/purchase-requests'
import {PurchaseOrdersTable, PurchaseOrdersForm} from '@/features/purchase-orders'
import {ReceptionsTable, ReceptionsForm} from '@/features/receptions'
import {StockOpnameForm} from '@/features/stock-opnames'

// Root route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet/>
            <Toaster position="top-right" richColors/>
        </>
    ),
})

// Auth layout wrapper
function AuthLayout({children}: { children: React.ReactNode }) {
    const {isAuthenticated} = useAuthStore()

    if (!isAuthenticated) {
        window.location.href = '/login'
        return null
    }

    return <MainLayout>{children}</MainLayout>
}

// Index route
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        window.location.href = '/dashboard'
    },
    component: () => null,
})

// Login Form
const loginSchema = z.object({
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(1, 'Kata sandi wajib diisi'),
})
type LoginFormValues = z.infer<typeof loginSchema>

// OPS Module Status options from settings
function getOpsModules(settings: any) {
    if (!settings) {
        return [
            {label: 'Absensi & Jadwal Kerja', status: 'Aktif'},
            {label: 'Patroli & Checkpoint', status: 'Aktif'},
            {label: 'Panic Button', status: 'Siaga'},
            {label: 'Enrollment Wajah', status: 'Aktif'},
        ]
    }
    return [
        {label: 'Absensi & Jadwal Kerja', status: settings.ops_absensi_status || 'Aktif'},
        {label: 'Patroli & Checkpoint', status: settings.ops_patroli_status || 'Aktif'},
        {label: 'Panic Button', status: settings.ops_panic_status || 'Siaga'},
        {label: 'Enrollment Wajah', status: settings.ops_enrollment_status || 'Aktif'},
    ]
}

function LoginPage() {
    const {login} = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [settings, setSettings] = useState<any>(null)

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000)

            try {
                const baseURL = import.meta.env.VITE_API_URL
                const response = await fetch(`${baseURL}/api/admin/settings`, {
                    credentials: 'include',
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)

                if (response.ok) {
                    const data = await response.json()
                    setSettings(data.data)
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    console.warn('Settings fetch timed out')
                } else {
                    console.error('Failed to fetch settings:', err)
                }
            }
        }
        fetchSettings()
    }, [])

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {email: '', password: ''},
    })

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true)
        setError(null)
        try {
            await login(values.email, values.password)
            window.location.href = '/dashboard'
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login gagal, periksa kembali email dan kata sandi Anda')
        } finally {
            setIsLoading(false)
        }
    }

    // Get values from settings with defaults
    const appTitle = settings?.app_title || 'RGB ERP'
    const companyName = settings?.company_name || 'PT. Rajawali Buana 86 (RGB 86)'
    const companyTagline = settings?.company_tagline || 'Bermitra Bersama Kami dan Raih Sukses Bersama.'
    const companyDescription = settings?.company_description || 'Perusahaan outsourcing sejak 2009.\nMelayani: Security, Cleaning, Catering, Parking, Gardener, Driver & lainnya.'
    const loginImage = settings?.login_image || '/assets/images/login-background.webp'
    const opsModules = getOpsModules(settings)

    return (
        <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-5">
            {/* Panel operasional (kiri, hanya desktop) */}
            <div
                className="relative hidden overflow-hidden bg-slate-950 lg:col-span-3 lg:flex lg:flex-col lg:justify-between"
                style={{
                    backgroundImage: `url('${loginImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                {/* Backdrop overlay */}
                <div className="absolute inset-0 bg-slate-950/70"/>
                {/* Grid pattern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* Glow effect */}
                <div
                    className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-20"
                    style={{background: 'radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)'}}
                />

                <div className="relative z-10 flex flex-1 flex-col justify-center px-16 py-12">
                    <div className="mb-10 flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-400/30">
                            <ShieldCheck className="h-5 w-5 text-sky-400"/>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-[0.25em] text-slate-400">
              {appTitle}
            </span>
                    </div>

                    <h1 className="max-w-md text-3xl font-bold leading-tight text-white">
                        {companyTagline}
                    </h1>
                    <div className="mt-4 space-y-2 text-base text-slate-300">
                        <p className="font-semibold text-white">{companyName}</p>
                        {companyDescription.split('\n').map((line: string, i: number) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>

                    <div className="mt-12 space-y-3">
                        {opsModules.map((m) => (
                            <div
                                key={m.label}
                                className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.03] px-4 py-2.5"
                            >
                                <div className="flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60"/>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400"/>
                  </span>
                                    <span className="text-sm text-slate-200">{m.label}</span>
                                </div>
                                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  {m.status}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 border-t border-white/5 px-16 py-6">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                        Service Excellence • Integrity • Action • Positive Attitude
                    </p>
                </div>
            </div>

            {/* Panel form login */}
            <div className="flex min-h-screen items-center justify-center px-6 py-12 lg:col-span-2">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <ShieldCheck className="h-5 w-5 text-primary"/>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {appTitle}
            </span>
                    </div>

                    <h2 className="text-2xl font-semibold text-foreground">Masuk ke Panel Admin</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Kelola tim, aset, dan laporan operasional di satu tempat.
                    </p>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="admin@example.com"
                                {...form.register('email')}
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    {...form.register('password')}
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Masuk...' : 'Masuk'}
                        </Button>
                    </form>

                    <div className="mt-6 border-t pt-6 lg:hidden">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground text-center">
                            Akses khusus personel terverifikasi
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const loginRoute = createRoute({getParentRoute: () => rootRoute, path: '/login', component: LoginPage})

// Dashboard
function DashboardPage() {
    return (
        <AuthLayout>
            <DashboardContent/>
        </AuthLayout>
    )
}

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) window.location.href = '/login'
    },
    component: DashboardPage,
})

// ===== FULLY MIGRATED MODULES =====

// Reports
function ReportsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Field Reports</h2>
                <p className="text-muted-foreground">View and manage field reports from employees</p>
            </div>
            <ReportsTable/>
        </AuthLayout>
    )
}

const reportsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Field Report', 'View')
    },
    component: ReportsPage,
})

// Clients
function ClientsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Clients</h2>
                <p className="text-muted-foreground">Manage client information and settings</p>
            </div>
            <ClientsTable/>
        </AuthLayout>
    )
}

const clientsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/clients',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Client', 'View')
    },
    component: ClientsPage,
})

function ClientsNewPage() {
    return (
        <AuthLayout>
            <ClientsForm/>
        </AuthLayout>
    )
}

const clientsNewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/clients/new',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Client', 'Add')
    },
    component: ClientsNewPage,
})

function ClientsEditPage() {
    return (
        <AuthLayout>
            <ClientsForm/>
        </AuthLayout>
    )
}

const clientsEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/clients/$id/edit',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Client', 'Edit')
    },
    component: ClientsEditPage,
})

// Departments
function DepartmentsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Departments</h2>
                <p className="text-muted-foreground">Manage department information</p>
            </div>
            <DepartmentsTable/>
        </AuthLayout>
    )
}

const departmentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/departments',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Department', 'View')
    },
    component: DepartmentsPage,
})

// Roles
function RolesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Roles</h2>
                <p className="text-muted-foreground">Manage role information</p>
            </div>
            <RolesTable/>
        </AuthLayout>
    )
}

const rolesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/roles',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Role', 'View')
    },
    component: RolesPage,
})

// Role Privileges
function RolePrivilegesPage() {
    // Get role ID from route params
    const routeParams = rolePrivilegesRoute.useParams()
    const roleId = Number.parseInt(routeParams.id, 10)

    return (
        <AuthLayout>
            <RolesPrivilegesForm roleId={roleId}/>
        </AuthLayout>
    )
}

const rolePrivilegesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/roles/$id/privileges',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Privilege', 'View')
    },
    component: RolePrivilegesPage,
})

// ===== PLACEHOLDER ROUTES (Waiting for migration) =====

// Helper to create placeholder route
function createPlaceholderRoute(path: string, title: string, menuName?: string) {
    const Component = () => {
        const {isAuthenticated} = useAuthStore()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return null
        }
        if (menuName) requirePrivilegeInBeforeLoad(menuName, 'View')
        return (
            <AuthLayout>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{title}</h2>
                    <p className="text-muted-foreground">Manage {title.toLowerCase()}</p>
                </div>
                <Placeholder title={title}/>
            </AuthLayout>
        )
    }
    return createRoute({getParentRoute: () => rootRoute, path, component: Component})
}

// Users
function UsersPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Users</h2>
                <p className="text-muted-foreground">Manage user accounts</p>
            </div>
            <UsersTable/>
        </AuthLayout>
    )
}

const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('User', 'View')
    },
    component: UsersPage,
})

// Positions
function PositionsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Positions</h2>
                <p className="text-muted-foreground">Manage position information</p>
            </div>
            <PositionsTable/>
        </AuthLayout>
    )
}

const positionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/positions',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Position', 'View')
    },
    component: PositionsPage,
})

// Position Privileges
function PositionPrivilegesPage() {
    return (
        <AuthLayout>
            <PositionPrivilegesForm/>
        </AuthLayout>
    )
}

const positionPrivilegesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/positions/$id/privileges',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Position', 'Edit')
    },
    component: PositionPrivilegesPage,
})

// Banks
function BanksPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Banks</h2>
                <p className="text-muted-foreground">Manage bank information</p>
            </div>
            <BanksTable/>
        </AuthLayout>
    )
}

const banksRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/banks',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Bank', 'View')
    },
    component: BanksPage,
})

// Client Types
function ClientTypesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Client Types</h2>
                <p className="text-muted-foreground">Manage client type information</p>
            </div>
            <ClientTypesTable/>
        </AuthLayout>
    )
}

const clientTypesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/client-types',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Client Type', 'View')
    },
    component: ClientTypesPage,
})

// Positions placeholder replaced above

// Documents
function DocumentsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Documents</h2>
                <p className="text-muted-foreground">Manage document information</p>
            </div>
            <DocumentsTable/>
        </AuthLayout>
    )
}

const documentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/documents',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Document', 'View')
    },
    component: DocumentsPage,
})

// Employees - Full page form (complex module)
function EmployeesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Employees</h2>
                <p className="text-muted-foreground">Manage employee information</p>
            </div>
            <EmployeesTable/>
        </AuthLayout>
    )
}

const employeesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/employees',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Employee', 'View')
    },
    component: EmployeesPage,
})

function EmployeesNewPage() {
    return (
        <AuthLayout>
            <EmployeesForm/>
        </AuthLayout>
    )
}

const employeesNewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/employees/new',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Employee', 'Add')
    },
    component: EmployeesNewPage,
})

function EmployeesEditPage() {
    return (
        <AuthLayout>
            <EmployeesForm/>
        </AuthLayout>
    )
}

const employeesEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/employees/$id/edit',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Employee', 'Edit')
    },
    component: EmployeesEditPage,
})

// Areas - can be filtered by client_id from query params
function AreasPage() {
    const navigate = useNavigate()
    const search = useAreasRoute.useSearch()
    const client_id = (search as { client_id?: number }).client_id
    const client_name = (search as { client_name?: string }).client_name

    const handleBack = () => {
        navigate({to: '/clients'})
    }

    return (
        <AuthLayout>
            <div className="mb-6">
                {client_id && client_name && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Kembali ke Clients
                    </button>
                )}
                {client_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span>Client:</span>
                        <span className="font-medium text-foreground">{client_name}</span>
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-2">Areas</h2>
                <p className="text-muted-foreground">
                    {client_name
                        ? `Manage areas for ${client_name}`
                        : 'Manage client areas'}
                </p>
            </div>
            <AreasTable key={client_id ?? 'all'} clientId={client_id} clientName={client_name}/>
        </AuthLayout>
    )
}

const useAreasRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/areas',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Area', 'View')
    },
    validateSearch: (search: Record<string, unknown>) => {
        const client_id = search.client_id as number | undefined
        const client_name = search.client_name as string | undefined
        // Always return both properties so component receives consistent search params
        return {client_id, client_name}
    },
    component: AreasPage,
})

// Poss - can be filtered by area_id/client_id from query params
function PossPage() {
    const navigate = useNavigate()
    const search = usePossRoute.useSearch()
    const area_id = (search as { area_id?: number }).area_id
    const area_name = (search as { area_name?: string }).area_name
    const client_id = (search as { client_id?: number }).client_id
    const client_name = (search as { client_name?: string }).client_name

    const handleBack = () => {
        if (client_id && client_name) {
            navigate({to: '/areas', search: {client_id, client_name}})
        } else {
            navigate({to: '/areas', search: {client_id: undefined, client_name: undefined}})
        }
    }

    return (
        <AuthLayout>
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Kembali
                    </button>
                </div>
                {client_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span>Client:</span>
                        <span className="font-medium text-foreground">{client_name}</span>
                    </div>
                )}
                {area_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>Area:</span>
                        <span className="font-medium text-foreground">{area_name}</span>
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-2">Pos Management</h2>
                <p className="text-muted-foreground">
                    {area_name
                        ? `Manage pos for ${area_name}`
                        : client_name
                            ? `Manage pos for ${client_name}`
                            : 'Manage pos'}
                </p>
            </div>
            <PossTable areaId={area_id} areaName={area_name} clientId={client_id} clientName={client_name}/>
        </AuthLayout>
    )
}

const usePossRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/poss',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Pos', 'View')
    },
    validateSearch: (search: Record<string, unknown>) => {
        return {
            area_id: search.area_id as number | undefined,
            area_name: search.area_name as string | undefined,
            client_id: search.client_id as number | undefined,
            client_name: search.client_name as string | undefined,
        }
    },
    component: PossPage,
})

// Attendance - Full migration (READ-ONLY with recap)
function AttendancePage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Attendance</h2>
                <p className="text-muted-foreground">View and manage employee attendance records</p>
            </div>
            <AttendancesTable/>
        </AuthLayout>
    )
}

const attendanceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/attendance',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Attendance', 'View')
    },
    component: AttendancePage,
})

// Schedules - Full migration
function SchedulesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Schedules</h2>
                <p className="text-muted-foreground">Manage employee work schedules and attendance locations</p>
            </div>
            <SchedulesTable/>
        </AuthLayout>
    )
}

const schedulesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedules',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Work Schedule', 'View')
    },
    component: SchedulesPage,
})

// Shifts
function ShiftsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Shifts</h2>
                <p className="text-muted-foreground">Manage shift schedules and working hours</p>
            </div>
            <ShiftsTable/>
        </AuthLayout>
    )
}

const shiftsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/shifts',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Shift', 'View')
    },
    component: ShiftsPage,
})

// Bank Accounts
function BankAccountsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Bank Accounts</h2>
                <p className="text-muted-foreground">Manage bank account information</p>
            </div>
            <BankAccountsTable/>
        </AuthLayout>
    )
}

const bankAccountsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/bank-accounts',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Bank Account', 'View')
    },
    component: BankAccountsPage,
})

// Salary Components
function SalaryComponentsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Salary Components</h2>
                <p className="text-muted-foreground">Manage salary component information</p>
            </div>
            <SalaryComponentsTable/>
        </AuthLayout>
    )
}

const salaryComponentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/salary-components',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Salary Component', 'View')
    },
    component: SalaryComponentsPage,
})

// Petty Cash
function PettyCashPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Petty Cash</h2>
                <p className="text-muted-foreground">Manage petty cash records</p>
            </div>
            <PettyCashTable/>
        </AuthLayout>
    )
}

const pettyCashRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/petty-cash',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Petty Cash', 'View')
    },
    component: PettyCashPage,
})

// Invoices
function InvoicesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Invoices</h2>
                <p className="text-muted-foreground">Manage client invoices</p>
            </div>
            <InvoicesTable/>
        </AuthLayout>
    )
}

const invoicesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/invoices',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Invoice', 'View')
    },
    component: InvoicesPage,
})

// Payroll
function PayrollPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Payroll</h2>
                <p className="text-muted-foreground">Attendance-based salary · BPJS · PPh21 (TER) · THR</p>
            </div>
            <PayrollTable/>
        </AuthLayout>
    )
}

const payrollRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payroll',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Payroll', 'View')
    },
    component: PayrollPage,
})

// Warehouses
function WarehousesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Warehouses</h2>
                <p className="text-muted-foreground">Manage warehouse information</p>
            </div>
            <WarehousesTable/>
        </AuthLayout>
    )
}

const warehousesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/warehouses',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Warehouse', 'View')
    },
    component: WarehousesPage,
})

// Provinces (modal form - no separate pages)
function ProvincesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Provinces</h2>
                <p className="text-muted-foreground">Manage provinces</p>
            </div>
            <ProvincesTable/>
        </AuthLayout>
    )
}

const provincesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/provinces',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Province', 'View')
    },
    component: ProvincesPage,
})

// Product Categories
function ProductCategoriesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Product Categories</h2>
                <p className="text-muted-foreground">Manage product category information</p>
            </div>
            <ProductCategoriesTable/>
        </AuthLayout>
    )
}

const productCategoriesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/product-categories',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Product Category', 'View')
    },
    component: ProductCategoriesPage,
})

// Products
function ProductsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Products</h2>
                <p className="text-muted-foreground">Manage product information</p>
            </div>
            <ProductsTable/>
        </AuthLayout>
    )
}

const productsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/products',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Product', 'View')
    },
    component: ProductsPage,
})

// Assets
const assetsRoute = createPlaceholderRoute('/assets', 'Assets', 'Asset')
const assetsNewRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/assets/new',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Asset', 'Add')
    },
    component: () => <AuthLayout><Placeholder title="Add Asset"/></AuthLayout>,
})
const assetsEditRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/assets/$id/edit',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Asset', 'Edit')
    },
    component: () => <AuthLayout><Placeholder title="Edit Asset"/></AuthLayout>,
})

// Purchase Requests
function PurchaseRequestsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Purchase Requests</h2>
                <p className="text-muted-foreground">Manage purchase request information</p>
            </div>
            <PurchaseRequestsTable/>
        </AuthLayout>
    )
}

const purchaseRequestsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/purchase-requests',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Purchase Request', 'View')
    },
    component: PurchaseRequestsPage,
})

function PurchaseRequestsNewPage() {
    return (
        <AuthLayout>
            <PurchaseRequestsForm/>
        </AuthLayout>
    )
}

const purchaseRequestsNewRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/purchase-requests/new',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Purchase Request', 'Add')
    },
    component: PurchaseRequestsNewPage,
})

function PurchaseRequestsEditPage() {
    return (
        <AuthLayout>
            <PurchaseRequestsForm/>
        </AuthLayout>
    )
}

const purchaseRequestsEditRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/purchase-requests/$id/edit',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Purchase Request', 'Edit')
    },
    component: PurchaseRequestsEditPage,
})

// Purchase Orders
function PurchaseOrdersPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Purchase Orders</h2>
                <p className="text-muted-foreground">Manage purchase order information</p>
            </div>
            <PurchaseOrdersTable/>
        </AuthLayout>
    )
}

const purchaseOrdersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/purchase-orders',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Purchase Order', 'View')
    },
    component: PurchaseOrdersPage,
})

function PurchaseOrdersNewPage() {
    return (
        <AuthLayout>
            <PurchaseOrdersForm/>
        </AuthLayout>
    )
}

const purchaseOrdersNewRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/purchase-orders/new',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Purchase Order', 'Add')
    },
    component: PurchaseOrdersNewPage,
})

function PurchaseOrdersEditPage() {
    return (
        <AuthLayout>
            <PurchaseOrdersForm/>
        </AuthLayout>
    )
}

const purchaseOrdersEditRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/purchase-orders/$id/edit',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Purchase Order', 'Edit')
    },
    component: PurchaseOrdersEditPage,
})

// Receptions
function ReceptionsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Penerimaan Barang</h2>
                <p className="text-muted-foreground">Kelola data penerimaan barang dari supplier</p>
            </div>
            <ReceptionsTable/>
        </AuthLayout>
    )
}

const receptionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/receptions',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Reception', 'View')
    },
    component: ReceptionsPage,
})

function ReceptionsNewPage() {
    return (
        <AuthLayout>
            <ReceptionsForm/>
        </AuthLayout>
    )
}

const receptionsNewRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/receptions/new',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Reception', 'Add')
    },
    component: ReceptionsNewPage,
})

function ReceptionsEditPage() {
    return (
        <AuthLayout>
            <ReceptionsForm/>
        </AuthLayout>
    )
}

const receptionsEditRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/receptions/$id/edit',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Reception', 'Edit')
    },
    component: ReceptionsEditPage,
})

// Stock Opnames
function StockOpnamesPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Stock Opname</h2>
                <p className="text-muted-foreground">Kelola data stock opname gudang</p>
            </div>
            <StockOpnameForm/>
        </AuthLayout>
    )
}

const stockOpnamesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/stock-opnames',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Stock Opname', 'View')
    },
    component: StockOpnamesPage,
})

// Projects
const projectsRoute = createPlaceholderRoute('/projects', 'Projects', 'Project')
const projectsNewRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/projects/new',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Project', 'Add')
    },
    component: () => <AuthLayout><Placeholder title="Add Project"/></AuthLayout>,
})
const projectsEditRoute = createRoute({
    getParentRoute: () => rootRoute, path: '/projects/$id/edit',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Project', 'Edit')
    },
    component: () => <AuthLayout><Placeholder title="Edit Project"/></AuthLayout>,
})

// Face Enrollments
const faceEnrollmentsRoute = createPlaceholderRoute('/face-enrollments', 'Face Enrollments', 'Face Enrollment')

// Panic Alerts
function PanicAlertsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Panic Alerts</h2>
                <p className="text-muted-foreground">View panic button alerts from employees</p>
            </div>
            <PanicAlertsTable/>
        </AuthLayout>
    )
}

const panicAlertsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/panic-alerts',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Panic Alert', 'View')
    },
    component: PanicAlertsPage,
})

// News
const newsRoute = createPlaceholderRoute('/news', 'News', 'News')

// Approvals
function ApprovalsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Approvals</h2>
                <p className="text-muted-foreground">Review and approve pending requests</p>
            </div>
            <ApprovalsTable/>
        </AuthLayout>
    )
}

const approvalsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/approvals',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Approval', 'View')
    },
    component: ApprovalsPage,
})

// Approval Flows
function ApprovalFlowsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Approval Flows</h2>
                <p className="text-muted-foreground">Configure approval workflows for different request types</p>
            </div>
            <ApprovalFlowsTable/>
        </AuthLayout>
    )
}

const approvalFlowsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/approval-flows',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Approval Flow', 'View')
    },
    component: ApprovalFlowsPage,
})

// Patrol Report
function PatrolReportPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Patrol Reports</h2>
                <p className="text-muted-foreground">View patrol session reports and statistics</p>
            </div>
            <PatrolReportsTable/>
        </AuthLayout>
    )
}

const patrolReportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/patrol-report',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Patrol Report', 'View')
    },
    component: PatrolReportPage,
})

// Checkpoints
function CheckpointsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Checkpoints</h2>
                <p className="text-muted-foreground">Manage patrol checkpoints for projects</p>
            </div>
            <CheckpointsTable/>
        </AuthLayout>
    )
}

const checkpointsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/checkpoints',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Checkpoint', 'View')
    },
    component: CheckpointsPage,
})

// Daily Task Reports
function DailyTaskReportsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Daily Task Reports</h2>
                <p className="text-muted-foreground">View completed tasks and submit reviews</p>
            </div>
            <DailyTaskReportsList/>
        </AuthLayout>
    )
}

const dailyTaskReportsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/daily-task-reports',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Daily Task', 'View')
    },
    component: DailyTaskReportsPage,
})

// Settings (no privilege check)
function SettingsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p className="text-muted-foreground">Configure system settings</p>
            </div>
            <SettingsForm/>
        </AuthLayout>
    )
}

const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) window.location.href = '/login'
    },
    component: SettingsPage,
})

// Finance Reports - Journal
function FinanceJournalPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">General Journal</h2>
                <p className="text-muted-foreground">All posted journal entries</p>
            </div>
            <JournalTable/>
        </AuthLayout>
    )
}

const financeJournalRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/finance/journal',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Finance Report', 'View')
    },
    component: FinanceJournalPage,
})

// Finance Reports - Ledger
function FinanceLedgerPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Ledger</h2>
                <p className="text-muted-foreground">Account ledger with transactions</p>
            </div>
            <LedgerView/>
        </AuthLayout>
    )
}

const financeLedgerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/finance/ledger',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Finance Report', 'View')
    },
    component: FinanceLedgerPage,
})

// Finance Reports - Balance Sheet
function FinanceBalanceSheetPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Balance Sheet</h2>
                <p className="text-muted-foreground">Financial position as of a date</p>
            </div>
            <BalanceSheetView/>
        </AuthLayout>
    )
}

const financeBalanceSheetRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/finance/balance-sheet',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Finance Report', 'View')
    },
    component: FinanceBalanceSheetPage,
})

// Finance Reports - Profit & Loss
function FinanceProfitLossPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Profit & Loss</h2>
                <p className="text-muted-foreground">Income and expenses over a period</p>
            </div>
            <ProfitLossView/>
        </AuthLayout>
    )
}

const financeProfitLossRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/finance/profit-loss',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Finance Report', 'View')
    },
    component: FinanceProfitLossPage,
})

// Accounts
function AccountsPage() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Chart of Accounts</h2>
                <p className="text-muted-foreground">Manage accounting account codes and types</p>
            </div>
            <AccountsTable/>
        </AuthLayout>
    )
}

const accountsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/accounts',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Account', 'View')
    },
    component: AccountsPage,
})

// ===== ACCOUNTING =====
function ChartOfAccountsRoute() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Daftar Akun</h2>
                <p className="text-muted-foreground">Chart of Accounts - Hierarchical</p>
            </div>
            <ChartOfAccountsTable/>
        </AuthLayout>
    )
}

const chartOfAccountsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/chart-of-accounts',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Chart of Account', 'View')
    },
    component: ChartOfAccountsRoute,
})

function JournalEntriesRoute() {
    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Jurnal Umum</h2>
                <p className="text-muted-foreground">Manual journal entries</p>
            </div>
            <JournalEntriesTable/>
        </AuthLayout>
    )
}

const journalEntriesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/journal-entries',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Journal Entry', 'View')
    },
    component: JournalEntriesRoute,
})

function FixedAssetsRoute() {
    return (
        <AuthLayout>
            <FixedAssetsTable/>
        </AuthLayout>
    )
}

const fixedAssetsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/fixed-assets',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Fixed Asset', 'View')
    },
    component: FixedAssetsRoute,
})

function TangibleAssetClassesRoute() {
    return (
        <AuthLayout>
            <TangibleAssetClassesTable/>
        </AuthLayout>
    )
}

const tangibleAssetClassesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tangible-asset-classes',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Tangible Asset Class', 'View')
    },
    component: TangibleAssetClassesRoute,
})

function AccountingPeriodsRoute() {
    return (
        <AuthLayout>
            <AccountingPeriodsTable/>
        </AuthLayout>
    )
}

const accountingPeriodsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/accounting-periods',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Accounting Period', 'View')
    },
    component: AccountingPeriodsRoute,
})

function OpeningBalanceRoute() {
    return (
        <AuthLayout>
            <OpeningBalancePage/>
        </AuthLayout>
    )
}

const openingBalanceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/opening-balance',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Opening Balance', 'View')
    },
    component: OpeningBalanceRoute,
})

// ===== FINANCIAL REPORTS =====
function TrialBalanceRoute() {
    return (
        <AuthLayout>
            <TrialBalanceReport/>
        </AuthLayout>
    )
}

const trialBalanceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/trial-balance',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Financial Report', 'View')
    },
    component: TrialBalanceRoute,
})

function IncomeStatementRoute() {
    return (
        <AuthLayout>
            <IncomeStatementReport/>
        </AuthLayout>
    )
}

const incomeStatementRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/income-statement',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Financial Report', 'View')
    },
    component: IncomeStatementRoute,
})

function BalanceSheetReportRoute() {
    return (
        <AuthLayout>
            <BalanceSheetReport/>
        </AuthLayout>
    )
}

const balanceSheetReportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/balance-sheet',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Financial Report', 'View')
    },
    component: BalanceSheetReportRoute,
})

function CashFlowRoute() {
    return (
        <AuthLayout>
            <CashFlowReport/>
        </AuthLayout>
    )
}

const cashFlowRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/cash-flow',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Financial Report', 'View')
    },
    component: CashFlowRoute,
})

function EquityStatementRoute() {
    return (
        <AuthLayout>
            <EquityStatementReport/>
        </AuthLayout>
    )
}

const equityStatementRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/equity-statement',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Financial Report', 'View')
    },
    component: EquityStatementRoute,
})

// ===== INVENTORY =====
function StockCardRoute() {
    return (
        <AuthLayout>
            <StockCardTable/>
        </AuthLayout>
    )
}

const stockCardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/stock-card',
    beforeLoad: () => {
        const {isAuthenticated} = useAuthStore.getState()
        if (!isAuthenticated) {
            window.location.href = '/login';
            return
        }
        requirePrivilegeInBeforeLoad('Stock Card', 'View')
    },
    component: StockCardRoute,
})

// Build route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    dashboardRoute,
    // Fully migrated
    reportsRoute,
    clientsRoute, clientsNewRoute, clientsEditRoute,
    departmentsRoute,
    rolesRoute,
    rolePrivilegesRoute,
    clientTypesRoute,
    positionsRoute,
    positionPrivilegesRoute,
    banksRoute,
    documentsRoute,
    shiftsRoute,
    warehousesRoute,
    productCategoriesRoute,
    provincesRoute,
    salaryComponentsRoute,
    // Placeholder routes
    usersRoute,
    employeesRoute, employeesNewRoute, employeesEditRoute,
    useAreasRoute,
    usePossRoute,
    attendanceRoute,
    schedulesRoute,
    bankAccountsRoute,
    pettyCashRoute,
    invoicesRoute,
    payrollRoute,
    productsRoute,
    assetsRoute, assetsNewRoute, assetsEditRoute,
    purchaseRequestsRoute, purchaseRequestsNewRoute, purchaseRequestsEditRoute,
    purchaseOrdersRoute, purchaseOrdersNewRoute, purchaseOrdersEditRoute,
    receptionsRoute, receptionsNewRoute, receptionsEditRoute,
    stockOpnamesRoute,
    projectsRoute, projectsNewRoute, projectsEditRoute,
    faceEnrollmentsRoute,
    panicAlertsRoute,
    newsRoute,
    approvalsRoute,
    approvalFlowsRoute,
    patrolReportRoute,
    checkpointsRoute,
    dailyTaskReportsRoute,
    settingsRoute,
    financeJournalRoute,
    financeLedgerRoute,
    financeBalanceSheetRoute,
    financeProfitLossRoute,
    // Accounts
    chartOfAccountsRoute,
    journalEntriesRoute,
    fixedAssetsRoute,
    tangibleAssetClassesRoute,
    accountingPeriodsRoute,
    openingBalanceRoute,
    trialBalanceRoute,
    incomeStatementRoute,
    balanceSheetReportRoute,
    cashFlowRoute,
    equityStatementRoute,
    stockCardRoute,
    accountsRoute,
])

export const router = createRouter({routeTree})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
