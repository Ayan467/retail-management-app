import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  Users,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Store,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'cashier', 'inventory_manager', 'supplier'],
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    roles: ['admin', 'inventory_manager', 'cashier'],
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Warehouse,
    roles: ['admin', 'inventory_manager'],
  },
  {
    title: 'POS',
    href: '/pos',
    icon: ShoppingCart,
    roles: ['admin', 'cashier'],
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    roles: ['admin', 'inventory_manager', 'supplier'],
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'inventory_manager'],
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Settings,
    roles: ['admin'],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter((item) =>
    profile?.role ? item.roles.includes(profile.role) : false
  );

  const NavLinks = () => (
    <>
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-sidebar shrink-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border">
            <div className="p-2 bg-sidebar-primary rounded-lg">
              <Store className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">Supermarket</h1>
              <p className="text-xs text-sidebar-foreground/70">Automation System</p>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <NavLinks />
          </nav>
          
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.username || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">
                  {profile?.role?.replace('_', ' ') || 'Role'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-card border-b">
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border">
                  <div className="p-2 bg-sidebar-primary rounded-lg">
                    <Store className="h-5 w-5 text-sidebar-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sidebar-foreground">Supermarket</h1>
                    <p className="text-xs text-sidebar-foreground/70">Automation System</p>
                  </div>
                </div>
                
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  <NavLinks />
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          {/* Notifications */}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/alerts">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden xl:inline-block">
                  {profile?.username || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {profile?.role?.replace('_', ' ') || 'Role'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 xl:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
