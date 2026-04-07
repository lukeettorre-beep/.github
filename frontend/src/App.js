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
    setCompletedSteps(prev => {
      const next = { ...prev, 1: true };
      sessionStorage.setItem('ait-steps', JSON.stringify(next));
      return next;
    });
  }, []);

  const completeStep2 = useCallback((empData) => {
    setEmployeeData(empData);
    sessionStorage.setItem('ait-employee', JSON.stringify(empData));
    setCompletedSteps(prev => {
      const next = { ...prev, 2: true };
      sessionStorage.setItem('ait-steps', JSON.stringify(next));
      return next;
    });
  }, []);

  const completeStep3 = useCallback((result) => {
    setCalculationResult(result);
    sessionStorage.setItem('ait-result', JSON.stringify(result));
    setCompletedSteps(prev => {
      const next = { ...prev, 3: true, 4: true };
      sessionStorage.setItem('ait-steps', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout completedSteps={completedSteps} />}>
            <Route index element={<Home />} />
            <Route path="/award-selector" element={
              <AwardSelector onComplete={completeStep1} />
            } />
            <Route path="/employee-profile" element={
              <EmployeeProfile selectedAward={selectedAward} onComplete={completeStep2} />
            } />
            <Route path="/shift-input" element={
              <ShiftInput employeeData={employeeData} selectedAward={selectedAward} onComplete={completeStep3} />
            } />
            <Route path="/results" element={
              <Results calculationResult={calculationResult} />
            } />
            <Route path="/warnings" element={<Warnings />} />
            <Route path="/classification" element={<Classification />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
