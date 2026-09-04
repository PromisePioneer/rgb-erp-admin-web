"use client"

import * as React from "react"
import { useLocation, Link, useNavigate } from "@tanstack/react-router"
import { type LucideIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"
import { useSettingsStore } from "@/features/settings/store/settings-store"
import { navigationSections } from "./layout/navigation-types"
import { cn } from "@/lib/utils"
import {
  ShieldCheck,
  LayoutDashboard,
  Briefcase,
  Tags,
  Landmark,
  IdCard,
  FileText,
  Users,
  MapPin,
  Clock,
  CalendarDays,
  Wallet,
  Coins,
  Banknote,
  Receipt,
  BookOpen,
  Book,
  Scale,
  TrendingUp,
  Warehouse,
  Layers,
  Package,
  ClipboardList,
  ShoppingCart,
  Inbox,
  Boxes,
  FolderKanban,
  ScanFace,
  Camera,
  AlertTriangle,
  Megaphone,
  GitBranch,
  Scan,
  UserCog,
  Network,
  Lock,
  Settings,
  ChevronsUpDown,
  LogOut,
  Database,
  ChevronDown,
  ChevronRight,
  List,
} from "lucide-react"

// Icon map
const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'briefcase': Briefcase,
  'tags': Tags,
  'landmark': Landmark,
  'id-card': IdCard,
  'file-text': FileText,
  'users': Users,
  'map-pin': MapPin,
  'clock': Clock,
  'calendar-days': CalendarDays,
  'calendar': CalendarDays,
  'wallet': Wallet,
  'coins': Coins,
  'banknote': Banknote,
  'receipt': Receipt,
  'book-open': BookOpen,
  'book': Book,
  'scale': Scale,
  'trending-up': TrendingUp,
  'warehouse': Warehouse,
  'layers': Layers,
  'package': Package,
  'clipboard-list': ClipboardList,
  'shopping-cart': ShoppingCart,
  'inbox': Inbox,
  'boxes': Boxes,
  'folder-kanban': FolderKanban,
  'scan-face': ScanFace,
  'camera': Camera,
  'alert-triangle': AlertTriangle,
  'megaphone': Megaphone,
  'git-branch': GitBranch,
  'scan': Scan,
  'user-cog': UserCog,
  'network': Network,
  'lock': Lock,
  'settings': Settings,
  'building': Landmark,
  'bar-chart': TrendingUp,
  'database': Database,
  'list': List,
}

// Helper function
function getLabel(key: string): string {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function hasPrivilege(menu: string | undefined, privileges: string[]): boolean {
  if (!menu) return true
  return privileges.some((p) => p.startsWith(`${menu},View`))
}

// User Menu Component
function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const getInitials = (name: string): string => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate({ to: "/login" })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// Navigation Menu from API
function NavMenu({
  isCollapsed,
}: {
  isCollapsed: boolean
}) {
  const location = useLocation()
  const privileges = useAuthStore((state) => state.privileges)
  const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(new Set())

  const isActive = (path: string): boolean => {
    const currentPath = location.pathname
    if (currentPath === path) return true
    return path !== '/dashboard' && currentPath.startsWith(path)
  }

  // Check if any child is active
  const isChildActive = (children: { path: string }[]): boolean => {
    return children.some(child => isActive(child.path))
  }

  // Only expand parent menus on route change
  React.useEffect(() => {
    const expandActiveParents = () => {
      const newExpanded = new Set(expandedMenus)
      navigationSections.forEach(section => {
        section.items.forEach(item => {
          if (item.children && isChildActive(item.children)) {
            newExpanded.add(item.label)
          }
        })
      })
      setExpandedMenus(newExpanded)
    }

    expandActiveParents()
  }, [location.pathname])

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(label)) {
        newSet.delete(label)
      } else {
        newSet.add(label)
      }
      return newSet
    })
  }

  // Filter sections based on privileges
  const filteredSections = React.useMemo(() => {
    return navigationSections
      .filter(section => section.items.some(item => hasPrivilege(item.menu, privileges)))
      .map(section => ({
        ...section,
        items: section.items.filter(item => hasPrivilege(item.menu, privileges))
      }))
      .filter(section => section.items.length > 0)
  }, [privileges])

  // Helper function to render a single item (recursive for nested)
  const renderItem = (item: any, depth: number = 0) => {
    const Icon = item.icon ? iconMap[item.icon] : null
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus.has(item.label)
    const childActive = hasChildren && isChildActive(item.children)

    if (hasChildren) {
      // Parent item with children
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.label)}
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors",
              (childActive || isExpanded)
                ? "bg-sidebar-accent/50 text-sidebar-accent-foreground font-medium"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {!isCollapsed && <span className="flex-1 text-left">{getLabel(item.label)}</span>}
            {!isCollapsed && (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Children items */}
          {!isCollapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-2">
              {item.children.map((child: any) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    } else {
      // Regular item
      const active = isActive(item.path)

      const menuButton = (
        <Link
          to={item.path}
          className={cn(
            "flex items-center gap-2 h-9 px-2 rounded-md text-sm transition-colors",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
          )}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          {!isCollapsed && <span>{getLabel(item.label)}</span>}
        </Link>
      )

      if (isCollapsed) {
        return (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              {menuButton}
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{getLabel(item.label)}</span>
            </TooltipContent>
          </Tooltip>
        )
      }

      return <div key={item.path}>{menuButton}</div>
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarGroup className="px-2 py-0">
        <SidebarMenu className="gap-0">
          {filteredSections.map((section, sectionIndex) => (
            <div key={section.label}>
              {/* Section Header */}
              {!isCollapsed && (
                <div className="flex items-center justify-between px-2 py-2 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                    {getLabel(section.label)}
                  </span>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => renderItem(item))}
              </div>

              {/* Separator between sections */}
              {!isCollapsed && sectionIndex < filteredSections.length - 1 && (
                <Separator className="my-3 bg-sidebar-border" />
              )}
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </TooltipProvider>
  )
}

interface AppSidebarProps {
  isCollapsed: boolean
}

export function AppSidebar({ isCollapsed }: AppSidebarProps) {
  const { user } = useAuthStore()
  const { data: settings } = useSettingsStore()
  const sidebarRef = React.useRef<HTMLDivElement>(null)

  // Restore scroll position from localStorage on mount
  React.useEffect(() => {
    if (sidebarRef.current) {
      const savedScroll = localStorage.getItem('sidebar_scroll_top')
      if (savedScroll) {
        sidebarRef.current.scrollTop = parseInt(savedScroll, 10)
      }
    }
  }, [])

  // Save scroll position to localStorage on scroll
  const handleScroll = () => {
    if (sidebarRef.current) {
      localStorage.setItem('sidebar_scroll_top', sidebarRef.current.scrollTop.toString())
    }
  }

  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/default.jpg",
  }

  return (
    <Sidebar className={cn(
      "border-r border-sidebar-border transition-all duration-200 ease-in-out",
      isCollapsed ? "w-16" : "w-[280px]"
    )}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShieldCheck className="size-4" />
                </div>
                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {settings?.company_name || "RGB Corp"}
                    </span>
                    <span className="truncate text-xs">
                      {settings?.app_title || "Admin"}
                    </span>
                  </div>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar overflow-y-auto" ref={sidebarRef} onScroll={handleScroll}>
        <NavMenu isCollapsed={isCollapsed} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!isCollapsed && <NavUser user={userData} />}
        {isCollapsed && (
          <div className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton asChild size="lg" className="h-auto w-full justify-center p-2">
                  <a href="#" className="flex items-center justify-center">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback className="rounded-lg text-xs">
                        {userData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </a>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-sm">
                  <div className="font-medium">{userData.name}</div>
                  <div className="text-xs text-muted-foreground">{userData.email}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
