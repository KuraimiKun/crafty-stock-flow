import { Link, useLocation } from 'react-router-dom';
import { authService } from '@/services/auth';
import { Roles } from '@/constants/roles';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Truck,
  ClipboardList,
  BarChart3,
  LogOut,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const currentUser = authService.getCurrentUser();
  const roles = currentUser?.roles ?? [];

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: UserPlus, label: 'Manage users', roles: [Roles.Admin] },
    { path: '/products', icon: Package, label: 'Products', roles: [Roles.Admin, Roles.InventoryManager] },
    { path: '/customers', icon: Users, label: 'Customers', roles: [Roles.Admin, Roles.InventoryManager, Roles.Cashier] },
    { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: [Roles.Admin, Roles.Cashier] },
    { path: '/suppliers', icon: Truck, label: 'Suppliers', roles: [Roles.Admin, Roles.InventoryManager] },
    { path: '/inventory', icon: ClipboardList, label: 'Inventory', roles: [Roles.Admin, Roles.InventoryManager] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: [Roles.Admin, Roles.InventoryManager] },
  ].filter((item) => !item.roles || item.roles.some((role) => roles.includes(role)));

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          {state === 'expanded' && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Inventory System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link to={item.path}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {currentUser && state === 'expanded' && (
          <>
            <div className="px-4 py-2">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium truncate">{currentUser.userName}</p>
            </div>
            <Separator />
          </>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
