// src/layout/DashboardNav.jsx
import React, { useState } from 'react';
import { Container, Navbar, Nav, Offcanvas, Button, Image, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { List as MenuIcon, PersonCircle } from 'react-bootstrap-icons';

const Sidebar = ({ show, navLinks, renderNavLinks, handleLogout, currentUserEmail }) => (
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
        Your Brand/Logo
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

const DashboardNav = ({ isSidebarOpen, toggleSidebar }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();

  // Get current user from localStorage (set at login/signup)
  // Consistently use 'loggedInUser'
  const storedUserString = localStorage.getItem('loggedInUser');
  const currentUser = storedUserString ? JSON.parse(storedUserString) : null;

  const handleOffcanvasToggle = () => setShowOffcanvas(!showOffcanvas);
  const closeOffcanvas = () => setShowOffcanvas(false);

  // Simple logout: remove user and redirect
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    // localStorage.removeItem('user'); // Remove if 'loggedInUser' is primary
    window.dispatchEvent(new CustomEvent('authChange')); // Notify other components
    navigate('/login');
  };

  const navLinks = [
    { to: '.', text: 'Dashboard Home' },
    { to: 'loans', text: 'Loans' },
    { to: 'profile', text: 'Profile' },
    { to: 'settings', text: 'Settings' },
    { to: 'pricing', text: 'Pricing Plans' },
    { to: 'support', text: 'Support' },
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

  return (
    <>
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
                  currentUser.profileImageUrl ? (
                    <Image src={currentUser.profileImageUrl} roundedCircle className="profile-image-sm" />
                  ) : (
                    <PersonCircle size={30} className="text-secondary profile-icon-placeholder" />
                  )
                }
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="settings">
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

      <Navbar.Offcanvas
        id={`offcanvasNavbar-expand-lg`}
        aria-labelledby={`offcanvasNavbarLabel-expand-lg`}
        placement="start"
        show={showOffcanvas}
        onHide={handleOffcanvasToggle}
        className="bg-light d-lg-none"
        style={{ zIndex: 1040 }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id={`offcanvasNavbarLabel-expand-lg`}>Menu</Offcanvas.Title>
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

      <Sidebar
        show={isSidebarOpen}
        navLinks={navLinks}
        renderNavLinks={renderNavLinks}
        handleLogout={handleLogout}
        currentUserEmail={currentUser?.email}
      />
    </>
  );
};

export default DashboardNav;
