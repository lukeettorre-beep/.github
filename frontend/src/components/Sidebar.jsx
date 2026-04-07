import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Scales, UserCircle, Clock, ChartBar,
  Warning, ListChecks, ClockCounterClockwise,
  GearSix, Question, House, CheckCircle, UploadSimple
} from '@phosphor-icons/react';

const WORKFLOW_STEPS = [
  { num: 1, path: '/award-selector', label: 'Select Award', icon: Scales },
  { num: 2, path: '/employee-profile', label: 'Employee Profile', icon: UserCircle },
  { num: 3, path: '/shift-input', label: 'Shift Input', icon: Clock },
  { num: 4, path: '/results', label: 'View Results', icon: ChartBar },
];

const TOOLS = [
  { path: '/batch-import', label: 'Batch Import', icon: UploadSimple },
  { path: '/warnings', label: 'Warnings', icon: Warning },
  { path: '/classification', label: 'Classification', icon: ListChecks },
  { path: '/audit-trail', label: 'Audit Trail', icon: ClockCounterClockwise },
];

const SYSTEM = [
  { path: '/admin', label: 'Admin', icon: GearSix },
  { path: '/help', label: 'Help', icon: Question },
];

export default function Sidebar({ completedSteps = {}, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      {/* Home */}
      <button
        data-testid="sidebar-home"
        onClick={() => handleNav('/')}
        className={`mx-3 mb-4 px-3 py-2 text-xs font-medium flex items-center gap-2 rounded-sm transition-colors ${
          location.pathname === '/'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        <House size={16} />
        Dashboard
      </button>

      {/* Workflow */}
      <div className="px-4 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Workflow
        </span>
      </div>
      <div className="space-y-0.5 mb-6">
        {WORKFLOW_STEPS.map(step => {
          const Icon = step.icon;
          const isActive = location.pathname === step.path;
          const isComplete = completedSteps[step.num];
          return (
            <button
              key={step.path}
              data-testid={`sidebar-step-${step.num}`}
              onClick={() => handleNav(step.path)}
              className={`w-full px-4 py-2.5 text-xs font-medium flex items-center gap-3 transition-colors ${
                isActive
                  ? 'bg-secondary border-l-2 border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isComplete
                  ? 'bg-emerald-600 text-white'
                  : isActive
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
              }`}>
                {isComplete ? <CheckCircle size={12} weight="bold" /> : step.num}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tools */}
      <div className="px-4 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Tools
        </span>
      </div>
      <div className="space-y-0.5 mb-6">
        {TOOLS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              data-testid={`sidebar-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => handleNav(item.path)}
              className={`w-full px-4 py-2 text-xs font-medium flex items-center gap-3 transition-colors ${
                isActive
                  ? 'bg-secondary border-l-2 border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* System */}
      <div className="mt-auto">
        <div className="px-4 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            System
          </span>
        </div>
        <div className="space-y-0.5">
          {SYSTEM.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                data-testid={`sidebar-${item.label.toLowerCase()}`}
                onClick={() => handleNav(item.path)}
                className={`w-full px-4 py-2 text-xs font-medium flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-secondary border-l-2 border-foreground text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        data-testid="sidebar"
        className="hidden lg:flex w-52 border-r border-border bg-background flex-col flex-shrink-0 overflow-y-auto"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-background border-r border-border overflow-y-auto">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
