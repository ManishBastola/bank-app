import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Home, Users, CreditCard, Settings } from 'lucide-react';

const navigation = [
  {
    title: 'Dashboard',
    href: '/employee-dashboard',
    icon: Home,
  },
  {
    title: 'Customers',
    href: '/employee/customers',
    icon: Users,
  },
  {
    title: 'Accounts',
    href: '/accounts',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/employee/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span>Bank of Madrid</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground',
                location.pathname === item.href && 'bg-muted text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 