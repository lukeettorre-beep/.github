import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Scales, UserCircle, Clock, ChartBar,
  Warning, ListChecks, ClockCounterClockwise,
  GearSix, Question, House, CheckCircle, UploadSimple,
  CalendarBlank, ArrowsLeftRight, Bell, CalendarCheck,
  Export, Users, FileText, Timer, TrendUp
} from '@phosphor-icons/react';

const WORKFLOW_STEPS = [
  { num: 1, path: '/award-selector', label: 'Select Award', icon: Scales },
  { num: 2, path: '/employee-profile', label: 'Employee Profile', icon: UserCircle },
  { num: 3, path: '/shift-input', label: 'Shift Input', icon: Clock },
  { num: 4, path: '/results', label: 'View Results', icon: ChartBar },
];

const TOOLS = [
  { path: '/batch-import', label: 'Batch Import', icon: UploadSimple },
  { path: '/shift-calendar', label: 'Shift Calendar', icon: CalendarBlank },
  { path: '/comparison', label: 'What-If Compare', icon: ArrowsLeftRight },
  { path: '/roster-templates', label: 'Roster Templates', icon: CalendarCheck },
];

const COMPLIANCE = [
  { path: '/warnings', label: 'Warnings', icon: Warning },
  { path: '/weekly-ot', label: 'Weekly OT', icon: Timer },
  { path: '/leave-calculator', label: 'Leave Calculator', icon: CalendarCheck },
  { path: '/annualised-salary', label: 'Annualised Salary', icon: Scales },
  { path: '/rate-alerts', label: 'Rate Alerts', icon: Bell },
];

const DATA = [
  { path: '/analytics', label: 'Analytics', icon: TrendUp },
  { path: '/audit-trail', label: 'Audit Trail', icon: ClockCounterClockwise },
  { path: '/classification', label: 'Classification', icon: ListChecks },
  { path: '/reports', label: 'PDF Reports', icon: FileText },
  { path: '/payroll-export', label: 'Payroll Export', icon: Export },
  { path: '/bulk-employees', label: 'Bulk Employees', icon: Users },
];

const SYSTEM = [
  { path: '/admin', label: 'Admin', icon: GearSix },
  { path: '/help', label: 'Help', icon: Question },
];

const ALL_SECTIONS = [
  { title: 'Tools', items: TOOLS },
  { title: 'Compliance', items: COMPLIANCE },
  { title: 'Data & Reports', items: DATA },
  { title: 'System', items: SYSTEM },
];

export default function Sidebar({ completedSteps = {}, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => { navigate(path); onClose?.(); };

  const NavButton = ({ path, label, icon: Icon, isActive }) => (
    <button
      data-testid={`sidebar-${label.toLowerCase().replace(/[\s\/]/g, '-')}`}
      onClick={() => handleNav(path)}
      className={`w-full px-4 py-2 text-xs font-medium flex items-center gap-3 transition-colors ${
        isActive
          ? 'bg-secondary border-l-2 border-foreground text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-3 overflow-y-auto">
      {/* Home */}
      <button
        data-testid="sidebar-home"
        onClick={() => handleNav('/')}
        className={`mx-3 mb-3 px-3 py-2 text-xs font-medium flex items-center gap-2 rounded-sm transition-colors ${
          location.pathname === '/' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        <House size={14} /> Dashboard
      </button>

      {/* Workflow */}
      <div className="px-4 mb-1"><span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workflow</span></div>
      <div className="space-y-0 mb-3">
        {WORKFLOW_STEPS.map(step => {
          const isActive = location.pathname === step.path;
          const isComplete = completedSteps[step.num];
          return (
            <button
              key={step.path}
              data-testid={`sidebar-step-${step.num}`}
              onClick={() => handleNav(step.path)}
              className={`w-full px-4 py-2 text-xs font-medium flex items-center gap-3 transition-colors ${
                isActive ? 'bg-secondary border-l-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                isComplete ? 'bg-emerald-600 text-white' : isActive ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
              }`}>
                {isComplete ? <CheckCircle size={10} weight="bold" /> : step.num}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic sections */}
      {ALL_SECTIONS.map(section => (
        <div key={section.title} className="mb-2">
          <div className="px-4 mb-1"><span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{section.title}</span></div>
          <div className="space-y-0">
            {section.items.map(item => (
              <NavButton key={item.path} {...item} isActive={location.pathname === item.path} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <aside data-testid="sidebar" className="hidden lg:flex w-52 border-r border-border bg-background flex-col flex-shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>
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
