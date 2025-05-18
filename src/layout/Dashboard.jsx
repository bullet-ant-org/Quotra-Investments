// src/layout/Dashboard.jsx
import React, { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import DashboardNav from './DashboardNav'; // Ensure DashboardNav is correctly using profileImageUrl from user object

// Sidebar navigation links
const navLinks = [
  { to: '.', text: 'Dashboard Home', icon: 'fas fa-home' },
  { to: 'loans', text: 'Loans', icon: 'fas fa-hand-holding-usd' },
  { to: 'profile', text: 'Profile', icon: 'fas fa-user-circle' },
  { to: 'settings', text: 'Settings', icon: 'fas fa-cog' },
  { to: 'pricing', text: 'Pricing Plans', icon: 'fas fa-tags' },
  { to: 'support', text: 'Support', icon: 'fas fa-headset' },
  { to: 'withdrawal', text: 'Withdraw Funds', icon: 'fas fa-money-bill-wave' },
];

const DesktopSidebar = ({ currentUserEmail, onLogout }) => (
  <div
    className="d-none d-lg-flex flex-column vh-100 p-3 bg-light shadow"
    style={{
      width: '250px',
      zIndex: 10000,
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      overflowY: 'auto',
    }}
  >
    <Link to="." className="navbar-brand mb-4 mt-2 text-center text-dark d-block">
      Quotra
    </Link>
    <Nav className="flex-column nav-pills">
      {navLinks.map((link) => (
        <Nav.Item key={link.to}>
          <Nav.Link
            as={NavLink}
            to={link.to}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center mb-1 ${isActive ? 'active-dashboard-link' : ''}`
            }
            end={link.to === '.'}
          >
            <i className={`${link.icon} me-2`} style={{ width: '1.1em' }}></i>
            <span>{link.text}</span>
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
    <div className="mt-auto text-center pb-2">
      {currentUserEmail && (
        <>
          <small>User: {currentUserEmail}</small>
          <br />
        </>
      )}
      <Button variant="outline-secondary" size="sm" onClick={onLogout} className="mt-2">
        Logout
      </Button>
    </div>
  </div>
);

const DashboardLayout = () => {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Get current user from localStorage (set at login/signup)
  // Ensure 'user' in localStorage is updated with the Cloudinary profileImageUrl by Settings.jsx/Profile.jsx
  // Let's consistently use 'loggedInUser' as set by LoginPage
  const storedUserString = localStorage.getItem('loggedInUser');
  const currentUser = storedUserString ? JSON.parse(storedUserString) : null;

  // Simple logout: remove user and redirect
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('token'); // If you use a token
    // localStorage.removeItem('user'); // Remove this if 'loggedInUser' is the primary key
    window.dispatchEvent(new CustomEvent('authChange')); // Notify other components
    window.location.href = '/login'; // Or use navigate from react-router-dom if DashboardLayout is within Router context
  };

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <DashboardNav
        isSidebarOpen={isDesktopSidebarOpen}
        toggleSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        currentUserEmail={currentUser?.email}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      {/* If APPWRITE_BUCKET_ID was solely for profile images, it's no longer needed in context. */}
      {/* If it's used for other Appwrite buckets by child routes, you might keep it or manage context differently. */}
      <main className="content-wrapper"><Outlet /></main>
    </div>
  );
};

export default DashboardLayout;
