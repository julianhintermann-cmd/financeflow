import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tags, PiggyBank, FileText, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/budget', icon: PiggyBank, label: 'Budget' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen border-r bg-card transition-all duration-300 sticky top-0',
          collapsed ? 'w-[68px]' : 'w-[220px]'
        )}
      >
        <div className={cn('flex items-center gap-2 p-4 border-b', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          {!collapsed && <span className="font-semibold text-lg tracking-tight">FinanceFlow</span>}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t space-y-1">
          <button
            onClick={() => setDark(!dark)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-muted-foreground hover:bg-accent hover:text-foreground',
              collapsed && 'justify-center px-0'
            )}
          >
            {dark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-muted-foreground hover:bg-accent hover:text-foreground',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
