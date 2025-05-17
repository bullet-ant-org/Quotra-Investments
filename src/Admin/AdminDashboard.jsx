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
      {/*
        The 'content-wrapper' class should have CSS to adjust its margin-left
        based on whether the sidebar is open or closed.
        Example CSS in your main CSS file (e.g., index.css or App.css):

        .content-wrapper {
          padding-top: 70px; // Adjust based on your navbar height
          transition: margin-left 0.3s ease-in-out;
          margin-left: 0; // Default for mobile or when sidebar is closed
        }

        .content-wrapper.sidebar-open {
          margin-left: 250px; // Adjust to your sidebar's width
        }

        // On smaller screens, the sidebar is usually an offcanvas, so no margin needed
        @media (max-width: 991.98px) { // lg breakpoint in Bootstrap
          .content-wrapper.sidebar-open {
            margin-left: 0;
          }
        }
      */}
      <main className={`content-wrapper ${isDesktopSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
