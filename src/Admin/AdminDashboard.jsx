// src/Admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminDashboardNav from './AdminDashboardNav';

// This component is now much simpler as AdminDashboardNav handles its own sidebar.
// We just need to manage the state for the sidebar toggle if AdminDashboardNav expects it.
const AdminDashboardLayout = () => {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // Default to open

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {/* Top Bar - AdminDashboardNav will also render its own sidebar */}
      <AdminDashboardNav
        isSidebarOpen={isDesktopSidebarOpen}
        toggleSidebar={toggleDesktopSidebar}
      />

      {/* Main Content Area */}
      <main className={`content-wrapper ${isDesktopSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
