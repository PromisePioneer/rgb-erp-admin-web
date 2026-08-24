import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
} from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'
import { requirePrivilege } from '@/lib/privilege-guard'
import { ReportsTable } from '@/features/reports/components/reports-table'
import { ClientsTable } from '@/features/clients/components/clients-table'
import { ClientsForm } from '@/features/clients/components/clients-form'

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Sidebar navigation items with privilege checks
function SidebarNav() {
  const { privileges } = useAuthStore()

  // Helper to check if user can view a menu
  const canView = (menu: string) =>
    privileges.some((p) => p.startsWith(`${menu},`))

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Clients', path: '/clients', menu: 'Client' },
    { label: 'Reports', path: '/reports', menu: 'Field Report' },
  ]

  return (
    <nav className="p-2 space-y-1">
      {navItems.map((item) => {
        // Skip items with menu requirement if user lacks privilege
        if ('menu' in item && item.menu && !canView(item.menu)) {
          return null
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className="block px-4 py-2 rounded hover:bg-accent transition-colors"
            activeProps={{ className: 'bg-accent font-medium' }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

// Auth layout wrapper
function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-4 font-semibold text-lg border-b">RGB ERP</div>
        <SidebarNav />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-card flex items-center px-6 justify-between">
          <h1 className="font-semibold">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

// Index route - redirect to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    window.location.href = '/dashboard'
  },
  component: () => null,
})

// Login Form Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// Login Page with react-hook-form + zod
function LoginPage() {
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      await login(values.email, values.password)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">RGB ERP Login</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              {...form.register('email')}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center w-full h-8 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Dashboard route
function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome to RGB ERP Admin Panel
      </p>
    </div>
  )
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      window.location.href = '/login'
    }
  },
  component: () => (
    <AuthLayout>
      <DashboardPage />
    </AuthLayout>
  ),
})

// Reports route
function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Field Reports</h2>
        <p className="text-muted-foreground">
          View and manage field reports from employees
        </p>
      </div>
      <ReportsTable />
    </div>
  )
}

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  beforeLoad: () => {
    // Require authentication
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    // Require Field Report View privilege
    requirePrivilege('Field Report', 'View')
  },
  component: () => (
    <AuthLayout>
      <ReportsPage />
    </AuthLayout>
  ),
})

// Clients route
function ClientsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Clients</h2>
        <p className="text-muted-foreground">
          Manage client information and settings
        </p>
      </div>
      <ClientsTable />
    </div>
  )
}

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  beforeLoad: () => {
    // Require authentication
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    // Require Client View privilege
    requirePrivilege('Client', 'View')
  },
  component: () => (
    <AuthLayout>
      <ClientsPage />
    </AuthLayout>
  ),
})

// Clients New route
function ClientsNewPage() {
  return (
    <AuthLayout>
      <ClientsForm mode="create" />
    </AuthLayout>
  )
}

const clientsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients/new',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    requirePrivilege('Client', 'Add')
  },
  component: () => <ClientsNewPage />,
})

// Clients Edit route
function ClientsEditPage() {
  const params = clientsEditRoute.useParams()
  return (
    <AuthLayout>
      <ClientsForm mode="edit" clientId={Number.parseInt(params.id, 10)} />
    </AuthLayout>
  )
}

const clientsEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients/$id/edit',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    requirePrivilege('Client', 'Edit')
  },
  component: () => <ClientsEditPage />,
})

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  reportsRoute,
  clientsRoute,
  clientsNewRoute,
  clientsEditRoute,
])

// Create and export router
export const router = createRouter({ routeTree })

// Type declarations for TanStack Router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
