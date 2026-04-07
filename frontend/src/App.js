import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';
import Home from './pages/Home';
import AwardSelector from './pages/AwardSelector';
import EmployeeProfile from './pages/EmployeeProfile';
import ShiftInput from './pages/ShiftInput';
import Results from './pages/Results';
import Warnings from './pages/Warnings';
import Classification from './pages/Classification';
import AuditTrail from './pages/AuditTrail';
import Admin from './pages/Admin';
import Help from './pages/Help';
import BatchImport from './pages/BatchImport';
import RosterTemplates from './pages/RosterTemplates';
import ShiftCalendar from './pages/ShiftCalendar';
import Analytics from './pages/Analytics';
import ComparisonTool from './pages/ComparisonTool';
import WeeklyOT from './pages/WeeklyOT';
import AnnualisedSalary from './pages/AnnualisedSalary';
import RateAlerts from './pages/RateAlerts';
import LeaveCalculator from './pages/LeaveCalculator';
import PayrollExport from './pages/PayrollExport';
import BulkEmployeeImport from './pages/BulkEmployeeImport';
import Reports from './pages/Reports';
import { Toaster } from './components/ui/sonner';
import '@/App.css';

function App() {
  const [selectedAward, setSelectedAward] = useState(() => sessionStorage.getItem('ait-award') || '');
  const [employeeData, setEmployeeData] = useState(() => {
    const saved = sessionStorage.getItem('ait-employee');
    return saved ? JSON.parse(saved) : null;
  });
  const [calculationResult, setCalculationResult] = useState(() => {
    const saved = sessionStorage.getItem('ait-result');
    return saved ? JSON.parse(saved) : null;
  });
  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = sessionStorage.getItem('ait-steps');
    return saved ? JSON.parse(saved) : {};
  });

  const completeStep1 = useCallback((awardCode) => {
    setSelectedAward(awardCode);
    sessionStorage.setItem('ait-award', awardCode);
    setCompletedSteps(prev => { const next = { ...prev, 1: true }; sessionStorage.setItem('ait-steps', JSON.stringify(next)); return next; });
  }, []);

  const completeStep2 = useCallback((empData) => {
    setEmployeeData(empData);
    sessionStorage.setItem('ait-employee', JSON.stringify(empData));
    setCompletedSteps(prev => { const next = { ...prev, 2: true }; sessionStorage.setItem('ait-steps', JSON.stringify(next)); return next; });
  }, []);

  const completeStep3 = useCallback((result) => {
    setCalculationResult(result);
    sessionStorage.setItem('ait-result', JSON.stringify(result));
    setCompletedSteps(prev => { const next = { ...prev, 3: true, 4: true }; sessionStorage.setItem('ait-steps', JSON.stringify(next)); return next; });
  }, []);

  const resetWorkflow = useCallback(() => {
    setSelectedAward('');
    setEmployeeData(null);
    setCalculationResult(null);
    setCompletedSteps({});
    sessionStorage.removeItem('ait-award');
    sessionStorage.removeItem('ait-employee');
    sessionStorage.removeItem('ait-result');
    sessionStorage.removeItem('ait-steps');
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout completedSteps={completedSteps} />}>
            <Route index element={<Home resetWorkflow={resetWorkflow} />} />
            <Route path="/award-selector" element={<AwardSelector onComplete={completeStep1} />} />
            <Route path="/employee-profile" element={<EmployeeProfile selectedAward={selectedAward} onComplete={completeStep2} />} />
            <Route path="/shift-input" element={<ShiftInput employeeData={employeeData} selectedAward={selectedAward} onComplete={completeStep3} />} />
            <Route path="/results" element={<Results calculationResult={calculationResult} resetWorkflow={resetWorkflow} />} />
            <Route path="/warnings" element={<Warnings />} />
            <Route path="/classification" element={<Classification />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/help" element={<Help />} />
            <Route path="/batch-import" element={<BatchImport />} />
            <Route path="/roster-templates" element={<RosterTemplates />} />
            <Route path="/shift-calendar" element={<ShiftCalendar />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/comparison" element={<ComparisonTool />} />
            <Route path="/weekly-ot" element={<WeeklyOT />} />
            <Route path="/annualised-salary" element={<AnnualisedSalary />} />
            <Route path="/rate-alerts" element={<RateAlerts />} />
            <Route path="/leave-calculator" element={<LeaveCalculator />} />
            <Route path="/payroll-export" element={<PayrollExport />} />
            <Route path="/bulk-employees" element={<BulkEmployeeImport />} />
            <Route path="/reports" element={<Reports calculationResult={calculationResult} />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
