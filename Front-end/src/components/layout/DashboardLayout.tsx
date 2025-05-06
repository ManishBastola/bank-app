import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  CreditCard, 
  BarChart, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  FileText,
  HelpCircle,
  Bell,
  Plus,
  LayoutDashboard,
  Send,
  Receipt,
  Building2
} from 'lucide-react';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Logo } from '../ui/logo';
import { RealMadridSquadWatermark } from '../ui/RealMadridSquadWatermark';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication when component mounts
    if (!loading && !isAuthenticated()) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'CUSTOMER') {
      return [
        { name: 'Dashboard', href: '/customer-dashboard', icon: Home },
        { name: 'Accounts', href: '/accounts', icon: CreditCard },
        { name: 'Credit Cards', href: '/credit-cards', icon: CreditCard },
        { name: 'Loans', href: '/loans', icon: Building2 },
        { name: 'Transactions', href: '/transactions', icon: Send },
        { name: 'Pay Bill', href: '/pay-bill', icon: Receipt },
        { name: 'Settings', href: '/customer-settings', icon: Settings },
      ];
    } else if (user.role === 'EMPLOYEE') {
      return [
        { name: 'Dashboard', href: '/employee-dashboard', icon: Home },
        { name: 'Customers', href: '/employee/customers', icon: Users },
        { name: 'Applications', href: '/employee/applications', icon: FileText },
        { name: 'Settings', href: '/employee/settings', icon: Settings },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/admin-dashboard', icon: Home },
        { name: 'Employees', href: '/admin/employees', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    }
  };

  const navLinks = getNavLinks();

  // Get initials for avatar
  const getInitials = () => {
    return user?.username ? user.username.substring(0, 2).toUpperCase() : 'U';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show nothing if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative">
      <RealMadridSquadWatermark />
      
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full bg-white shadow-md"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40 
          w-64 transform transition-transform duration-300 ease-in-out
          bg-sidebar text-sidebar-foreground flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center">
          <Logo className="text-white" />
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="flex items-center gap-4 px-4 py-3 text-sm rounded-md hover:bg-sidebar-accent transition-colors"
            >
              <link.icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-sidebar-accent">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{user.username}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Log out"
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b py-4 px-6 md:px-10 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            {/* Create Account button for customers only */}
            {user?.role === 'CUSTOMER' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/create-account')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Account
              </Button>
            )}
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 text-center">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
