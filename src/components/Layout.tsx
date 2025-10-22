import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate, location.pathname]);

  const currentUser = authService.getCurrentUser();
  const roles = currentUser?.roles ?? [];

  const navItems = useMemo(
    () =>
      [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: UserPlus, label: 'Manage users', roles: [Roles.Admin] },
        { path: '/products', icon: Package, label: 'Products', roles: [Roles.Admin, Roles.InventoryManager] },
        { path: '/customers', icon: Users, label: 'Customers', roles: [Roles.Admin, Roles.InventoryManager, Roles.Cashier] },
        { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: [Roles.Admin, Roles.Cashier] },
        { path: '/suppliers', icon: Truck, label: 'Suppliers', roles: [Roles.Admin, Roles.InventoryManager] },
        { path: '/inventory', icon: ClipboardList, label: 'Inventory', roles: [Roles.Admin, Roles.InventoryManager] },
        { path: '/reports', icon: BarChart3, label: 'Reports', roles: [Roles.Admin, Roles.InventoryManager] },
      ].filter((item) => !item.roles || item.roles.some((role) => roles.includes(role))),
    [roles]
  );

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground">Inventory System</h1>
          {currentUser && (
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as <span className="font-medium">{currentUser.userName}</span>
            </p>
          )}
        </div>
        <nav className="px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
