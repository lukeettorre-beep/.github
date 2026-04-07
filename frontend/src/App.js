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
  const [selectedAward, setSelectedAward] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  const completeStep1 = useCallback((awardCode) => {
    setSelectedAward(awardCode);
    setCompletedSteps(prev => ({ ...prev, 1: true }));
  }, []);

  const completeStep2 = useCallback((empData) => {
    setEmployeeData(empData);
    setCompletedSteps(prev => ({ ...prev, 2: true }));
  }, []);

  const completeStep3 = useCallback((result) => {
    setCalculationResult(result);
    setCompletedSteps(prev => ({ ...prev, 3: true, 4: true }));
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
