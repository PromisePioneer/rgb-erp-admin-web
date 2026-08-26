import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'
import { requirePrivilegeInBeforeLoad } from '@/lib/privilege-guard'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ReportsTable } from '@/features/reports/components/reports-table'
import { ClientsTable } from '@/features/clients/components/clients-table'
import { ClientsForm } from '@/features/clients/components/clients-form'
import { DepartmentsTable } from '@/features/departments/components/departments-table'
import { RolesTable } from '@/features/roles/components/roles-table'
import { RolesPrivilegesForm } from '@/features/roles/components/roles-privileges-form'
import { Placeholder } from '@/components/placeholder'
import { MainLayout } from '@/components/layout'
import { SettingsForm } from '@/features/settings'
import { UsersTable } from '@/features/users'
import { ClientTypesTable } from '@/features/client-types'
import { PositionsTable } from '@/features/positions'
import { PositionPrivilegesForm } from '@/features/position-privileges'
import { BanksTable } from '@/features/banks'
import { DocumentsTable } from '@/features/documents'
import { ShiftsTable } from '@/features/shifts'
import { WarehousesTable } from '@/features/warehouses'
import { ProductCategoriesTable } from '@/features/product-categories'
import { SalaryComponentsTable } from '@/features/salary-components'
import { EmployeesTable, EmployeesForm } from '@/features/employees'
import { EmployeePlacementsTable } from '@/features/employee-placements'
import { AreasTable } from '@/features/areas'
import { PossTable } from '@/features/poss'
import { ProvincesTable } from '@/features/provinces'
import { AttendancesTable } from '@/features/attendances'
import { SchedulesTable } from '@/features/schedules'
import { BankAccountsTable } from '@/features/bank-accounts'
import { PettyCashTable } from '@/features/petty-cash'
import { InvoicesTable } from '@/features/invoices'
import {
  JournalTable,
  LedgerView,
  BalanceSheetView,
  ProfitLossView,
} from '@/features/finance'

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  ),
})

// Auth layout wrapper
function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

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
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type LoginFormValues = z.infer<typeof loginSchema>

function LoginPage() {
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await login(values.email, values.password)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">RGB ERP Login</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" type="email" placeholder="admin@example.com" {...form.register('email')}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring" />
            {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" type="password" placeholder="••••••••" {...form.register('password')}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring" />
            {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={isLoading}
            className="inline-flex items-center justify-center w-full h-8 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage })

// Dashboard
function DashboardPage() {
  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to RGB ERP Admin Panel</p>
      </div>
    </AuthLayout>
  )
}
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
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
      <ReportsTable />
    </AuthLayout>
  )
}
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <ClientsTable />
    </AuthLayout>
  )
}
const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Client', 'View')
  },
  component: ClientsPage,
})

function ClientsNewPage() {
  return (
    <AuthLayout>
      <ClientsForm />
    </AuthLayout>
  )
}
const clientsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients/new',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Client', 'Add')
  },
  component: ClientsNewPage,
})

function ClientsEditPage() {
  return (
    <AuthLayout>
      <ClientsForm />
    </AuthLayout>
  )
}
const clientsEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients/$id/edit',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <DepartmentsTable />
    </AuthLayout>
  )
}
const departmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/departments',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <RolesTable />
    </AuthLayout>
  )
}
const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/roles',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <RolesPrivilegesForm roleId={roleId} />
    </AuthLayout>
  )
}
const rolePrivilegesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/roles/$id/privileges',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Privilege', 'View')
  },
  component: RolePrivilegesPage,
})

// ===== PLACEHOLDER ROUTES (Waiting for migration) =====

// Helper to create placeholder route
function createPlaceholderRoute(path: string, title: string, menuName?: string) {
  const Component = () => {
    const { isAuthenticated } = useAuthStore()
    if (!isAuthenticated) { window.location.href = '/login'; return null }
    if (menuName) requirePrivilegeInBeforeLoad(menuName, 'View')
    return (
      <AuthLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">Manage {title.toLowerCase()}</p>
        </div>
        <Placeholder title={title} />
      </AuthLayout>
    )
  }
  return createRoute({ getParentRoute: () => rootRoute, path, component: Component })
}

// Users
function UsersPage() {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Users</h2>
        <p className="text-muted-foreground">Manage user accounts</p>
      </div>
      <UsersTable />
    </AuthLayout>
  )
}
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <PositionsTable />
    </AuthLayout>
  )
}
const positionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/positions',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Position', 'View')
  },
  component: PositionsPage,
})

// Position Privileges
function PositionPrivilegesPage() {
  return (
    <AuthLayout>
      <PositionPrivilegesForm />
    </AuthLayout>
  )
}
const positionPrivilegesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/positions/$id/privileges',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <BanksTable />
    </AuthLayout>
  )
}
const banksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/banks',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <ClientTypesTable />
    </AuthLayout>
  )
}
const clientTypesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client-types',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <DocumentsTable />
    </AuthLayout>
  )
}
const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <EmployeesTable />
    </AuthLayout>
  )
}
const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Employee', 'View')
  },
  component: EmployeesPage,
})

function EmployeesNewPage() {
  return (
    <AuthLayout>
      <EmployeesForm />
    </AuthLayout>
  )
}
const employeesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/new',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Employee', 'Add')
  },
  component: EmployeesNewPage,
})

function EmployeesEditPage() {
  return (
    <AuthLayout>
      <EmployeesForm />
    </AuthLayout>
  )
}
const employeesEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id/edit',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Employee', 'Edit')
  },
  component: EmployeesEditPage,
})

// Employee Placements - Modal form pattern (like clients)
function EmployeePlacementsPage() {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Employee Placements</h2>
        <p className="text-muted-foreground">Manage employee placement assignments</p>
      </div>
      <EmployeePlacementsTable />
    </AuthLayout>
  )
}
const employeePlacementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employee-placements',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Employee Placement', 'View')
  },
  component: EmployeePlacementsPage,
})

// Areas - can be filtered by client_id from query params
function AreasPage() {
  const navigate = useNavigate()
  const search = useAreasRoute.useSearch()
  const client_id = (search as { client_id?: number }).client_id
  const client_name = (search as { client_name?: string }).client_name

  const handleBack = () => {
    navigate({ to: '/clients' })
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        {client_id && client_name && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
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
      <AreasTable key={client_id ?? 'all'} clientId={client_id} clientName={client_name} />
    </AuthLayout>
  )
}
const useAreasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/areas',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Area', 'View')
  },
  validateSearch: (search: Record<string, unknown>) => {
    const client_id = search.client_id as number | undefined
    const client_name = search.client_name as string | undefined
    // Always return both properties so component receives consistent search params
    return { client_id, client_name }
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
      navigate({ to: '/areas', search: { client_id, client_name } })
    } else {
      navigate({ to: '/areas', search: { client_id: undefined, client_name: undefined } })
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
            <ArrowLeft className="h-4 w-4" />
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
      <PossTable areaId={area_id} areaName={area_name} clientId={client_id} clientName={client_name} />
    </AuthLayout>
  )
}
const usePossRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poss',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <AttendancesTable />
    </AuthLayout>
  )
}
const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/attendance',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <SchedulesTable />
    </AuthLayout>
  )
}
const schedulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedules',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <ShiftsTable />
    </AuthLayout>
  )
}
const shiftsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shifts',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <BankAccountsTable />
    </AuthLayout>
  )
}
const bankAccountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bank-accounts',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <SalaryComponentsTable />
    </AuthLayout>
  )
}
const salaryComponentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salary-components',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <PettyCashTable />
    </AuthLayout>
  )
}
const pettyCashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/petty-cash',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <InvoicesTable />
    </AuthLayout>
  )
}
const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Invoice', 'View')
  },
  component: InvoicesPage,
})

// Payroll
const payrollRoute = createPlaceholderRoute('/payroll', 'Payroll', 'Payroll')

// Warehouses
function WarehousesPage() {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Warehouses</h2>
        <p className="text-muted-foreground">Manage warehouse information</p>
      </div>
      <WarehousesTable />
    </AuthLayout>
  )
}
const warehousesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/warehouses',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <ProvincesTable />
    </AuthLayout>
  )
}
const provincesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provinces',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <ProductCategoriesTable />
    </AuthLayout>
  )
}
const productCategoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product-categories',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Product Category', 'View')
  },
  component: ProductCategoriesPage,
})

// Products
const productsRoute = createPlaceholderRoute('/products', 'Products', 'Product')
const productsNewRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/products/new',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Product', 'Add') },
  component: () => <AuthLayout><Placeholder title="Add Product" /></AuthLayout>,
})
const productsEditRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/products/$id/edit',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Product', 'Edit') },
  component: () => <AuthLayout><Placeholder title="Edit Product" /></AuthLayout>,
})

// Assets
const assetsRoute = createPlaceholderRoute('/assets', 'Assets', 'Asset')
const assetsNewRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/assets/new',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Asset', 'Add') },
  component: () => <AuthLayout><Placeholder title="Add Asset" /></AuthLayout>,
})
const assetsEditRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/assets/$id/edit',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Asset', 'Edit') },
  component: () => <AuthLayout><Placeholder title="Edit Asset" /></AuthLayout>,
})

// Purchase Requests
const purchaseRequestsRoute = createPlaceholderRoute('/purchase-requests', 'Purchase Requests', 'Purchase Request')
const purchaseRequestsNewRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/purchase-requests/new',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Purchase Request', 'Add') },
  component: () => <AuthLayout><Placeholder title="Add Purchase Request" /></AuthLayout>,
})
const purchaseRequestsEditRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/purchase-requests/$id/edit',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Purchase Request', 'Edit') },
  component: () => <AuthLayout><Placeholder title="Edit Purchase Request" /></AuthLayout>,
})

// Purchase Orders
const purchaseOrdersRoute = createPlaceholderRoute('/purchase-orders', 'Purchase Orders', 'Purchase Order')
const purchaseOrdersNewRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/purchase-orders/new',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Purchase Order', 'Add') },
  component: () => <AuthLayout><Placeholder title="Add Purchase Order" /></AuthLayout>,
})
const purchaseOrdersEditRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/purchase-orders/$id/edit',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Purchase Order', 'Edit') },
  component: () => <AuthLayout><Placeholder title="Edit Purchase Order" /></AuthLayout>,
})

// Receptions
const receptionsRoute = createPlaceholderRoute('/receptions', 'Receptions', 'Reception')
const receptionsNewRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/receptions/new',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Reception', 'Add') },
  component: () => <AuthLayout><Placeholder title="Add Reception" /></AuthLayout>,
})
const receptionsEditRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/receptions/$id/edit',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Reception', 'Edit') },
  component: () => <AuthLayout><Placeholder title="Edit Reception" /></AuthLayout>,
})

// Stock Opnames
const stockOpnamesRoute = createPlaceholderRoute('/stock-opnames', 'Stock Opnames', 'Stock Opname')

// Projects
const projectsRoute = createPlaceholderRoute('/projects', 'Projects', 'Project')
const projectsNewRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/projects/new',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Project', 'Add') },
  component: () => <AuthLayout><Placeholder title="Add Project" /></AuthLayout>,
})
const projectsEditRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/projects/$id/edit',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Project', 'Edit') },
  component: () => <AuthLayout><Placeholder title="Edit Project" /></AuthLayout>,
})

// Face Enrollments
const faceEnrollmentsRoute = createPlaceholderRoute('/face-enrollments', 'Face Enrollments', 'Face Enrollment')

// Panic Alerts
const panicAlertsRoute = createPlaceholderRoute('/panic-alerts', 'Panic Alerts', 'Panic Alert')

// News
const newsRoute = createPlaceholderRoute('/news', 'News', 'News')

// Approvals
const approvalsRoute = createPlaceholderRoute('/approvals', 'Approvals', 'Approval')

// Approval Flows
const approvalFlowsRoute = createPlaceholderRoute('/approval-flows', 'Approval Flows', 'Approval Flow')

// Patrol Report
const patrolReportRoute = createPlaceholderRoute('/patrol-report', 'Patrol Reports', 'Patrol Report')

// Checkpoints
const checkpointsRoute = createPlaceholderRoute('/checkpoints', 'Checkpoints', 'Checkpoint')
const checkpointsNewRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/checkpoints/new',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Checkpoint', 'Add') },
  component: () => <AuthLayout><Placeholder title="Add Checkpoint" /></AuthLayout>,
})
const checkpointsEditRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/checkpoints/$id/edit',
  beforeLoad: () => { const { isAuthenticated } = useAuthStore.getState(); if (!isAuthenticated) { window.location.href = '/login'; return } requirePrivilegeInBeforeLoad('Checkpoint', 'Edit') },
  component: () => <AuthLayout><Placeholder title="Edit Checkpoint" /></AuthLayout>,
})

// Settings (no privilege check)
function SettingsPage() {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Configure system settings</p>
      </div>
      <SettingsForm />
    </AuthLayout>
  )
}
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
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
      <JournalTable />
    </AuthLayout>
  )
}
const financeJournalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finance/journal',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <LedgerView />
    </AuthLayout>
  )
}
const financeLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finance/ledger',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <BalanceSheetView />
    </AuthLayout>
  )
}
const financeBalanceSheetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finance/balance-sheet',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
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
      <ProfitLossView />
    </AuthLayout>
  )
}
const financeProfitLossRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finance/profit-loss',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    requirePrivilegeInBeforeLoad('Finance Report', 'View')
  },
  component: FinanceProfitLossPage,
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
  employeePlacementsRoute,
  useAreasRoute,
  usePossRoute,
  attendanceRoute,
  schedulesRoute,
  bankAccountsRoute,
  pettyCashRoute,
  invoicesRoute,
  payrollRoute,
  productsRoute, productsNewRoute, productsEditRoute,
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
  checkpointsRoute, checkpointsNewRoute, checkpointsEditRoute,
  settingsRoute,
  financeJournalRoute,
  financeLedgerRoute,
  financeBalanceSheetRoute,
  financeProfitLossRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
