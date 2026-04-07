import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import {
  House, Scales, UserCircle, Clock, ChartBar,
  Warning, ListChecks, ClockCounterClockwise,
  GearSix, Question, Moon, Sun, List, UploadSimple
} from '@phosphor-icons/react';
import { Button } from '../components/ui/button';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: House },
  { path: '/award-selector', label: 'Awards', icon: Scales },
  { path: '/employee-profile', label: 'Employee', icon: UserCircle },
  { path: '/shift-input', label: 'Shift', icon: Clock },
  { path: '/results', label: 'Results', icon: ChartBar },
  { path: '/batch-import', label: 'Batch', icon: UploadSimple },
  { path: '/warnings', label: 'Warnings', icon: Warning },
  { path: '/classification', label: 'Classification', icon: ListChecks },
  { path: '/audit-trail', label: 'Audit', icon: ClockCounterClockwise },
  { path: '/admin', label: 'Admin', icon: GearSix },
  { path: '/help', label: 'Help', icon: Question },
];

export default function TopNav({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header
      data-testid="top-nav"
      className="w-full border-b border-border bg-background flex items-center justify-between px-4 h-12 z-40"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          data-testid="sidebar-toggle"
          onClick={onToggleSidebar}
          className="lg:hidden p-1"
        >
          <List size={20} />
        </Button>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
          data-testid="logo"
        >
          <Scales size={22} weight="bold" className="text-foreground" />
          <span className="font-heading font-bold text-sm tracking-tight hidden sm:inline">
            Award Interpreter
          </span>
        </div>
        <span className="text-[10px] font-mono bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm hidden sm:inline">
          v1.0
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-0.5" data-testid="top-nav-links">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={`px-2 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors rounded-sm ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={14} weight={isActive ? 'bold' : 'regular'} />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        size="sm"
        data-testid="theme-toggle"
        onClick={toggleTheme}
        className="p-1.5"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </header>
  );
}
