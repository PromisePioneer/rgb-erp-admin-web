# RGB ERP - Admin SPA Conventions

Dokumen ini menjelaskan pola pengembangan untuk React Admin SPA yang berkomunikasi dengan backend Laravel melalui JSON API.

---

## 1. Tech Stack

| Komponen | Pilihan | Catatan |
|----------|---------|---------|
| Framework | React + TypeScript | Vite build |
| State | **Zustand** | Simple, minimal boilerplate |
| Routing | **TanStack Router** | File-based routing |
| UI Components | **shadcn/ui** | Pakai yang sudah ada, jangan custom |
| Forms | react-hook-form + **zod** | Standar shadcn |
| Icons | **lucide-react** | |
| HTTP Client | **axios** | withCredentials untuk Sanctum |

---

## 2. Struktur Folder

```
frontend/src/
├── app.tsx                    # Root app dengan TanStack Router
├── routes/
│   ├── __root.tsx             # Layout root (auth guard + sidebar)
│   ├── _index.tsx             # Redirect atau dashboard
│   ├── login.tsx              # Login page
│   └── features/
│       └── <modul>/
│           ├── index.tsx      # List + table (TanStack route)
│           ├── new.tsx        # Create form
│           └── $id.edit.tsx   # Edit form (dynamic segment)
├── features/
│   └── <modul>/
│       ├── api/
│       │   └── <modul>-api.ts    # API calls (getList, create, update, delete)
│       ├── store/
│       │   └── <modul>-store.ts   # Zustand store
│       ├── components/
│       │   ├── <modul>-table.tsx  # shadcn Table/DataTable
│       │   ├── <modul>-form.tsx   # react-hook-form + zod
│       │   └── <modul>-filters.tsx # Search/filter bar
│       └── types/
│           └── <modul>.types.ts   # TypeScript interfaces
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── breadcrumb.tsx
│   └── ui/                    # shadcn components
│       ├── button.tsx
│       ├── table.tsx
│       └── ...
├── lib/
│   ├── api-client.ts          # Axios instance dengan interceptors
│   ├── privilege-guard.ts     # Cek privilege user
│   └── utils.ts               # cn() dan helpers
└── stores/
    └── auth-store.ts          # Auth state (Zustand)
```

---

## 3. API Client Pattern

```typescript
// src/lib/api-client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Sanctum SPA cookie
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// 401 → redirect login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 4. API Module Pattern

```typescript
// src/features/<modul>/api/<modul>-api.ts
import { apiClient } from '@/lib/api-client'
import type { <Modul> } from '../types/<modul>.types'

export const <modul>Api = {
  getList: async (params?: ListParams) => {
    const { data } = await apiClient.get<ApiResponse<<Modul>[]>>('/admin/<modul>', { params })
    return data
  },

  getById: async (id: string | number) => {
    const { data } = await apiClient.get<ApiResponse<<Modul>>>(`/admin/<modul>/${id}`)
    return data
  },

  create: async (payload: Create<Modul>Payload) => {
    const { data } = await apiClient.post<ApiResponse<<Modul>>('/admin/<modul>', payload)
    return data
  },

  update: async (id: string | number, payload: Update<Modul>Payload) => {
    const { data } = await apiClient.put<ApiResponse<<Modul>>(`/admin/<modul>/${id}`, payload)
    return data
  },

  delete: async (id: string | number) => {
    await apiClient.delete(`/admin/<modul>/${id}`)
  },
}
```

---

## 5. Zustand Store Pattern

```typescript
// src/features/<modul>/store/<modul>-store.ts
import { create } from 'zustand'
import type { <Modul> } from '../types/<modul>.types'
import { <modul>Api } from '../api/<modul>-api'

interface <Modul>State {
  items: <Modul>[]
  selectedItem: <Modul> | null
  isLoading: boolean
  error: string | null
  filters: Filters
  pagination: Pagination

  // Actions
  fetchItems: (params?: Filters) => Promise<void>
  fetchById: (id: string | number) => Promise<void>
  create: (payload: CreatePayload) => Promise<void>
  update: (id: string | number, payload: UpdatePayload) => Promise<void>
  remove: (id: string | number) => Promise<void>
  setFilters: (filters: Partial<Filters>) => void
  reset: () => void
}

const initialState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: { page: 1, limit: 10, total: 0 },
}

export const use<Modul>Store = create<<Modul>State>((set, get) => ({
  ...initialState,

  fetchItems: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const filters = { ...get().filters, ...params }
      const response = await <modul>Api.getList(filters)
      set({
        items: response.data,
        pagination: response.meta,
        isLoading: false,
      })
    } catch (error) {
      set({ error: 'Failed to fetch', isLoading: false })
    }
  },

  // ... other actions
}))
```

---

## 6. Table Component Pattern (shadcn Table)

```tsx
// src/features/<modul>/components/<modul>-table.tsx
import { use<Modul>Store } from '../store/<modul>-store'
import { <Modul>Filters } from './<modul>-filters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'tanstack/react-router'
import { AlertDialog } from '@/components/ui/alert-dialog'

export function <Modul>Table() {
  const { items, isLoading, pagination, fetchItems, remove } = use<Modul>Store()

  return (
    <div className="space-y-4">
      <<Modul>Filters />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No data</TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="flex gap-2">
                    <Link to="/features/<modul>/$id.edit" params={{ id: item.id }}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog
                      title="Delete"
                      description="Are you sure?"
                      onConfirm={() => remove(item.id)}
                    >
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(page) => fetchItems({ page })}
      />
    </div>
  )
}
```

---

## 7. Form Component Pattern (react-hook-form + zod)

```tsx
// src/features/<modul>/components/<modul>-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function <Modul>Form({ defaultValues, onSubmit, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
      status: true,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 8. TanStack Router File-Based Routing

```tsx
// src/routes/__root.tsx
import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Auth guard wrapper
function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

// Route tree
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Dashboard</div>,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const <modul>IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features/<modul>',
  beforeLoad: ({ context }) => {
    requirePrivilege('<Modul>', 'View')
  },
  component: () => <AuthLayout><<Modul>Table /></AuthLayout>,
})

const <modul>NewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features/<modul>/new',
  beforeLoad: ({ context }) => {
    requirePrivilege('<Modul>', 'Add')
  },
  component: () => <AuthLayout><<Modul>Form onSubmit={handleCreate} /></AuthLayout>,
})

const <modul>EditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features/<modul>/$id/edit',
  beforeLoad: ({ context }) => {
    requirePrivilege('<Modul>', 'Edit')
  },
  component: () => <AuthLayout><<Modul>Form onSubmit={handleUpdate} /></AuthLayout>,
})

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  <modul>IndexRoute,
  <modul>NewRoute,
  <modul>EditRoute,
])

// Create router
export const router = createRouter({ routeTree })
```

---

## 9. Privilege Guard

```typescript
// src/lib/privilege-guard.ts
import { useAuthStore } from '@/stores/auth-store'

type Action = 'View' | 'Add' | 'Edit' | 'Delete' | 'Generate'

export function useCanAccess(menu: string, action: Action): boolean {
  const { privileges } = useAuthStore()
  return privileges.includes(`${menu},${action}`)
}

export function requirePrivilege(menu: string, action: Action): void {
  const { privileges } = useAuthStore()
  if (!privileges.includes(`${menu},${action}`)) {
    throw new Error('Unauthorized')
  }
}

// For sidebar menu filtering
export function canViewMenu(menu: string): boolean {
  const { privileges } = useAuthStore()
  return privileges.some(p => p.startsWith(`${menu},`))
}
```

---

## 10. Auth Store

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

interface User {
  id: number
  name: string
  email: string
  role_id: number
}

interface AuthState {
  user: User | null
  privileges: string[] // Format: "MenuName,Action" e.g. "Bank,View"
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      privileges: [],
      isAuthenticated: false,

      login: async (email, password) => {
        // Get CSRF cookie first
        await apiClient.get('/sanctum/csrf-cookie')

        // Login
        const { data } = await apiClient.post('/login', { email, password })
        set({
          user: data.user,
          privileges: data.privileges,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        await apiClient.post('/logout')
        set({ user: null, privileges: [], isAuthenticated: false })
      },

      fetchUser: async () => {
        try {
          const { data } = await apiClient.get('/api/admin/me')
          set({
            user: data.user,
            privileges: data.privileges,
            isAuthenticated: true,
          })
        } catch {
          set({ user: null, privileges: [], isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        privileges: state.privileges,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

---

## 11. API Response Format

### List with Pagination
```json
{
  "data": [
    { "id": 1, "name": "..." }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  }
}
```

### Single Resource
```json
{
  "data": { "id": 1, "name": "..." }
}
```

### Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

---

## 12. Immutability Rules

**SELALU buat object baru, JANGAN mutate:**

```typescript
// ❌ SALAH - Mutation
function updateItem(items: Item[], id: number, updates: Partial<Item>) {
  const index = items.findIndex(i => i.id === id)
  items[index] = { ...items[index], ...updates } // MUTATION!
  return items
}

// ✅ BENAR - Immutability
function updateItem(items: Item[], id: number, updates: Partial<Item>) {
  return items.map(item =>
    item.id === id ? { ...item, ...updates } : item
  )
}
```

---

## 13. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Feature folder | kebab-case | `employee-placements` |
| Type/Interface | PascalCase | `EmployeePlacement` |
| Store | camelCase + `Store` suffix | `useEmployeePlacementStore` |
| API module | kebab-case + `-api` suffix | `employee-placement-api.ts` |
| Route file | kebab-case | `$id.edit.tsx` |
| Component | PascalCase | `<Modul>Table` |
| Database column | snake_case | `employee_id` |
| API field | camelCase | `employeeId` |

---

## 14. File Size Limits

| Type | Max Lines | Reason |
|------|-----------|--------|
| Component | < 200 | Single responsibility |
| Store | < 150 | Focused state management |
| API module | < 100 | Simple CRUD wrapper |
| Types | < 100 | Just interfaces |

---

*Document Version: 1.0*
*For: RGB ERP Admin SPA Migration*
