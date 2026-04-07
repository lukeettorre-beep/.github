import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import {
  House, Scales, Clock, ChartBar, UploadSimple, TrendUp,
  CalendarBlank, ArrowsLeftRight, Moon, Sun, List,
  CaretDown
} from '@phosphor-icons/react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '../components/ui/dropdown-menu';

const PRIMARY_NAV = [
  { path: '/', label: 'Home', icon: House },
  { path: '/award-selector', label: 'Awards', icon: Scales },
  { path: '/shift-input', label: 'Shift', icon: Clock },
  { path: '/results', label: 'Results', icon: ChartBar },
  { path: '/batch-import', label: 'Batch', icon: UploadSimple },
  { path: '/analytics', label: 'Analytics', icon: TrendUp },
  { path: '/shift-calendar', label: 'Calendar', icon: CalendarBlank },
];

const MORE_ITEMS = [
  { label: 'Tools', items: [
    { path: '/comparison', label: 'What-If Compare' },
    { path: '/roster-templates', label: 'Roster Templates' },
  ]},
  { label: 'Compliance', items: [
    { path: '/warnings', label: 'Warnings' },
    { path: '/weekly-ot', label: 'Weekly OT' },
    { path: '/leave-calculator', label: 'Leave Calculator' },
    { path: '/annualised-salary', label: 'Annualised Salary' },
    { path: '/rate-alerts', label: 'Rate Alerts' },
  ]},
  { label: 'Data', items: [
    { path: '/audit-trail', label: 'Audit Trail' },
    { path: '/classification', label: 'Classification' },
    { path: '/reports', label: 'PDF Reports' },
    { path: '/payroll-export', label: 'Payroll Export' },
    { path: '/bulk-employees', label: 'Bulk Employees' },
  ]},
  { label: 'System', items: [
    { path: '/admin', label: 'Admin' },
    { path: '/help', label: 'Help' },
  ]},
];

export default function TopNav({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header data-testid="top-nav" className="w-full border-b border-border bg-background flex items-center justify-between px-4 h-12 z-40">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" data-testid="sidebar-toggle" onClick={onToggleSidebar} className="lg:hidden p-1">
          <List size={20} />
        </Button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')} data-testid="logo">
          <Scales size={22} weight="bold" className="text-foreground" />
          <span className="font-heading font-bold text-sm tracking-tight hidden sm:inline">Award Interpreter</span>
        </div>
        <span className="text-[10px] font-mono bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm hidden sm:inline">v2.0</span>
      </div>

      <nav className="hidden md:flex items-center gap-0.5" data-testid="top-nav-links">
        {PRIMARY_NAV.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={`px-2 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors rounded-sm ${
                isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={14} weight={isActive ? 'bold' : 'regular'} />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}

        {/* More dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="nav-more" className="px-2 py-1.5 text-xs font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm">
              More <CaretDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {MORE_ITEMS.map((group, gi) => (
              <React.Fragment key={gi}>
                {gi > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-[10px]">{group.label}</DropdownMenuLabel>
                {group.items.map(item => (
                  <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)} className="text-xs cursor-pointer" data-testid={`nav-more-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <Button variant="ghost" size="sm" data-testid="theme-toggle" onClick={toggleTheme} className="p-1.5" aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </header>
  );
}
