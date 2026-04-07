import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ComplianceBanner from './ComplianceBanner';
import TopNav from './TopNav';
import Sidebar from './Sidebar';

export default function Layout({ completedSteps }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ComplianceBanner />
      <TopNav onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          completedSteps={completedSteps}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          data-testid="main-content"
          className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
