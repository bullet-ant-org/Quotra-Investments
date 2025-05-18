// src/Admin/AdminDashboardNav.jsx
import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Offcanvas, Button, Image, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { List as MenuIcon, PersonCircle } from 'react-bootstrap-icons';
import { API_BASE_URL } from '../utils/api'; // Import your API_BASE_URL

const Sidebar = ({ show, navLinks, renderNavLinks, currentUserEmail, handleLogout }) => {
  return (
    <div
      className={`d-none d-lg-flex flex-column vh-100 p-3 bg-light shadow desktop-sidebar ${show ? 'open' : 'closed'}`}
      style={{
        width: show ? '250px' : '0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10000,
        overflowX: 'hidden',
        transition: 'width 0.3s ease-in-out',
        padding: show ? '1rem' : '0',
      }}
    >
      <div style={{ display: show ? 'block' : 'none' }}>
        <Link to="." className="navbar-brand mb-4 mt-2 text-center text-dark d-block">
          Admin Dashboard
        </Link>
        <Nav className="flex-column nav-pills">{renderNavLinks()}</Nav>
        <div className="mt-auto text-center pb-2">
          {currentUserEmail && (
            <>
              <small>User: {currentUserEmail}</small>
              <br />
            </>
          )}
          <Button variant="outline-secondary" size="sm" onClick={handleLogout} className="mt-2">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboardNav = ({ isSidebarOpen, toggleSidebar }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch current admin user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!storedUserId || !token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/${storedUserId}`);

        if (!response.ok) {
          if (response.status === 401) navigate('/login'); // Unauthorized
          throw new Error('Failed to fetch user data for admin check');
        }

        const userData = await response.json();
        if (userData && userData.role === 'admin') {
          setCurrentUser(userData);
          // localStorage.setItem('loggedInUser', JSON.stringify(userData)); // Already set by login
        } else {
          // Not an admin or user role not defined
          console.warn('User is not an admin or role is not defined. Redirecting.');
          navigate('/login'); // Or to a "not authorized" page
        }
      } catch (err) {
        console.error('Error fetching admin user data:', err);
        navigate('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleOffcanvasToggle = () => setShowOffcanvas(!showOffcanvas);
  const closeOffcanvas = () => setShowOffcanvas(false);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('authChange')); // Notify other components
    navigate('/login'); // Redirect to login page
  };

  const navLinks = [
    { to: '.', text: 'Dashboard Home' }, // Links to AdminOverview
    { to: 'users', text: 'Manage Users' },
    { to: 'orders', text: 'Manage Investments' }, // Renamed for clarity, links to AdminOrders
    { to: 'pricing-admin', text: 'Manage Assets' }, // Links to AdminPricing
    { to: 'loan-types-admin', text: 'Manage Loan Types' }, // Links to AdminLoanTypes
    { to: 'settings', text: 'Site Settings' }, // Links to AdminSettingsPage
    { to: '/admin/withdrawal-requests', text: 'Withdrawal Requests' },
  ];

  const renderNavLinks = (onClickHandler) =>
    navLinks.map((link) => (
      <Nav.Link
        key={link.to}
        as={NavLink}
        to={link.to}
        onClick={onClickHandler}
        className={({ isActive }) => `mb-2 ${isActive ? 'active-dashboard-link' : ''}`}
        end={link.to === '.'}
      >
        {link.text}
      </Nav.Link>
    ));

  if (isLoadingUser) {
    return null; // Or a loading spinner for the nav itself
  }

  return (
    <>
      {/* Top Navbar */}
      <Navbar bg="light" variant="light" expand="lg" className="fixed-top shadow main-navbar" style={{ zIndex: 1031 }}>
        <Container fluid>
          <Button
            variant="outline-secondary"
            className="d-lg-none me-2"
            onClick={handleOffcanvasToggle}
          >
            <MenuIcon size={24} />
          </Button>
          <Button
            variant="outline-secondary"
            className="d-none d-lg-inline-block me-3"
            onClick={toggleSidebar}
          >
            <MenuIcon size={24} />
          </Button>

          <Nav className="ms-auto align-items-center">
            {currentUser ? (
              <NavDropdown
                title={
                  currentUser.profileImageUrl || currentUser.profilePictureUrl ? (
                    <Image src={currentUser.profileImageUrl || currentUser.profilePictureUrl} roundedCircle className="profile-image-sm" />
                  ) : (
                    <PersonCircle size={30} className="text-secondary profile-icon-placeholder" />
                  )
                }
                id="basic-nav-dropdown"
                align="end"
              >
                {/* Admin profile page if you have one, e.g., /admin/profile */}
                {/* <NavDropdown.Item as={Link} to="profile"> 
                  Profile
                </NavDropdown.Item> */}
                <NavDropdown.Item as={Link} to="settings"> {/* Links to Admin Settings */}
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button as={Link} to="/login" variant="outline-primary" size="sm">
                Login
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Navbar.Offcanvas
        id={`offcanvasNavbar-expand-lg-admin`} // Unique ID for admin offcanvas
        aria-labelledby={`offcanvasNavbarLabel-expand-lg-admin`}
        placement="start"
        show={showOffcanvas}
        onHide={handleOffcanvasToggle}
        className="bg-light d-lg-none"
        style={{ zIndex: 1040 }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id={`offcanvasNavbarLabel-expand-lg-admin`}>Admin Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="justify-content-end flex-grow-1 pe-3 flex-column">
            {renderNavLinks(closeOffcanvas)}
            <Nav.Link
              onClick={() => {
                handleLogout();
                closeOffcanvas();
              }}
              className="mt-3"
              style={{ cursor: 'pointer' }}
            >
              Logout
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>

      {/* Desktop Sidebar */}
      <Sidebar
        show={isSidebarOpen}
        navLinks={navLinks}
        renderNavLinks={() => renderNavLinks(null)} // Pass null or empty fn if no specific click handler needed for desktop
        currentUserEmail={currentUser?.email}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default AdminDashboardNav;
