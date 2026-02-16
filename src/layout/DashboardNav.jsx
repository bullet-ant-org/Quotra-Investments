// src/layout/DashboardNav.jsx
import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Offcanvas, Button, Image, NavDropdown, Collapse } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PersonCircle, BoxArrowRight } from 'react-bootstrap-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCog, faHeartbeat, faSignOutAlt, faTachometerAlt, faExchangeAlt, faChartLine, faTags, faChevronDown, faChevronUp, faWallet, faMoneyBillWave, faHandHoldingUsd, } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ show, navLinks, renderNavLinks, handleLogout, currentUserEmail }) => (
  <div
    className={`d-none d-lg-flex flex-column vh-100 p-3 bg-light shadow desktop-sidebar ${show ? 'open' : 'closed'}`}
    style={{
      width: show ? '250px' : '0',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000000,
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
  const [openAccountDetails, setOpenAccountDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // State for current user

  // Fetch user data on mount and listen for auth changes
  useEffect(() => {
    const fetchUser = () => {
      const storedUserString = localStorage.getItem('loggedInUser');
      setCurrentUser(storedUserString ? JSON.parse(storedUserString) : null);
    };
    fetchUser(); // Fetch initially
    window.addEventListener('authChange', fetchUser); // Listen for custom event
    return () => window.removeEventListener('authChange', fetchUser); // Cleanup listener
  }, []);


  // Dummy currency formatter, replace with your actual utility
  const formatCurrency = (amount, currency = 'USD') => {
    if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
    const value = amount.toFixed(2);
    return `${value} ${currency}`;
  };

  // Get current user from localStorage (set at login/signup)
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

  // Main navigation links for the offcanvas (and potentially desktop sidebar if structure is shared)
  const mainDashboardNavLinks = [
    { to: '.', text: 'Dashboard', icon: faTachometerAlt },
    { to: 'transactions', text: 'Transactions', icon: faExchangeAlt }, // Assuming a transactions page
    { to: 'investments', text: 'Investments', icon: faChartLine }, // Assuming an investment page
    { to: 'pricing', text: 'Pricing Plans', icon: faTags },
    { to: 'loan-types', text: 'Apply for Loan', icon: faHandHoldingUsd }, // Link to new Loan Types page
    { to: 'profile', text: 'My Profile', icon: faUserCircle }, // My Profile link
  ];

  // Re-purposing renderNavLinks for the main dashboard links in offcanvas
  const renderMainOffcanvasLinks = (onClickHandler) =>
    mainDashboardNavLinks.map((link) => (
      <Nav.Link
        key={link.to}
        as={NavLink}
        to={link.to}
        onClick={onClickHandler}
        className={({ isActive }) => `dashboard-offcanvas-link ${isActive ? 'active-dashboard-link' : 'text-dark-100'}`}
        end={link.to === '.'}
      >
        {link.icon && <FontAwesomeIcon icon={link.icon} className="me-2" />}
        {link.text}
      </Nav.Link>
    ));
  
  // Links for the desktop sidebar (can be different or same as offcanvas)
  // For now, let's assume desktop sidebar uses a similar set of links or its own logic
  const desktopSidebarLinks = mainDashboardNavLinks; // Or define separately
  const renderDesktopSidebarLinks = () => desktopSidebarLinks.map((link) => (
    <Nav.Link
      key={link.to}
      as={NavLink}
      to={link.to}
      className={({ isActive }) => `dashboard-sidebar-link mb-2 ${isActive ? 'active-dashboard-link' : ''}`} // Added dashboard-sidebar-link class
      end={link.to === '.'}
    > {link.icon && <FontAwesomeIcon icon={link.icon} className="me-2" />}{link.text}</Nav.Link>
  ));
  return (
    <>
      <Navbar bg="light" variant="light" expand="lg" className="fixed-top shadow main-navbar" style={{ zIndex: 1031 }}>
        <Container fluid>
          <Button
            
            className="d-lg-none me-2 bg-transparent border-0"
            onClick={handleOffcanvasToggle}
          >
            <span className="material-symbols-outlined text-muted icon mt-1">
              menu_open
            </span>
          </Button>
          <Button
            
            className="d-none d-lg-inline-block me-3"
            onClick={toggleSidebar}
          >
            <span className="material-symbols-outlined text-black icon">
              menu_open
            </span>
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
                 {/* Display user info in dropdown header */}
                 <NavDropdown.Header>
                    <div className="fw-bold">{currentUser.username || 'User'}</div>
                    <div className="text-muted small">{currentUser.email}</div>
                 </NavDropdown.Header>
                 <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="profile" onClick={closeOffcanvas}> {/* Added onClick */}
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="settings" onClick={closeOffcanvas}> {/* Added onClick */}
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
        onHide={closeOffcanvas} // Use closeOffcanvas to ensure state is managed correctly
        className="bg-light d-lg-none dashboard-offcanvas" // Added dashboard-offcanvas class
        style={{ zIndex: 1040, width: '80vw' }} // Inline style for 80% width
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id={`offcanvasNavbarLabel-expand-lg`} className="dashboard-offcanvas-title">
            Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          <hr className="dashboard-offcanvas-divider mt-0" />

          {currentUser && (
            <>
              <Button
                onClick={() => setOpenAccountDetails(!openAccountDetails)}
                aria-controls="account-details-collapse-dashboard"
                aria-expanded={openAccountDetails}
                variant="link"
                className="dashboard-offcanvas-account-toggle text-decoration-none text-dark w-100 d-flex align-items-center p-3"
              >
                {currentUser.profileImageUrl ? (
                  <div className="dashboard-offcanvas-profile-image-container me-2">
                    <Image
                      src={currentUser.profileImageUrl}
                      roundedCircle
                      className="dashboard-offcanvas-profile-image"
                      alt="Profile"
                    />
                  </div>
                ) : (
                  <PersonCircle size={30} className="text-secondary dashboard-offcanvas-profile-icon me-2" />
                )}
                <div className="flex-grow-1 text-start">
                  <div className="dashboard-offcanvas-full-name">{currentUser.username || 'User'}</div>
                  <div className="dashboard-offcanvas-email text-muted">{currentUser.email}</div>
                </div>
                <FontAwesomeIcon icon={openAccountDetails ? faChevronUp : faChevronDown} className="ms-2" />
              </Button>

              <Collapse in={openAccountDetails}>
                <div id="account-details-collapse-dashboard" className="dashboard-offcanvas-account-details p-3 pt-0">
                  <div className="dashboard-offcanvas-balance-section mb-2">
                    <div className="text-uppercase text-muted dashboard-offcanvas-section-title">Main Account Balance</div>
                    <div className="d-flex align-items-baseline">
                      <div className="dashboard-offcanvas-total-balance">
                        {formatCurrency(currentUser.balance ?? 0).split(' ')[0]} {/* Use currentUser.balance */}
                      </div>
                      <div className="dashboard-offcanvas-currency ms-1">USD</div>
                    </div>
                  </div>
                  <Nav className="flex-column">
                    <Nav.Link as={Link} to="withdrawal" className="dashboard-offcanvas-link" onClick={closeOffcanvas}>
                      <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> Withdraw Funds
                    </Nav.Link>
                    <Nav.Link as={Link} to="deposit" className="dashboard-offcanvas-link" onClick={closeOffcanvas}> {/* Assuming a deposit page */}
                      <FontAwesomeIcon icon={faWallet} className="me-2" /> Deposit Funds
                    </Nav.Link>
                  </Nav>
                </div>
              </Collapse>
              <hr className="dashboard-offcanvas-divider" />

              <Nav className="flex-column p-3 pt-0">
                <Nav.Link as={Link} to="profile" className="dashboard-offcanvas-link" onClick={closeOffcanvas}>
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" /> View Profile
                </Nav.Link>
                <Nav.Link as={Link} to="settings" className="dashboard-offcanvas-link" onClick={closeOffcanvas}>
                  <FontAwesomeIcon icon={faCog} className="me-2" /> Account Setting
                </Nav.Link>
                <Nav.Link as={Link} to="activity" className="dashboard-offcanvas-link" onClick={closeOffcanvas}> {/* Assuming a login activity page */}
                  <FontAwesomeIcon icon={faHeartbeat} className="me-2" /> Login Activity
                </Nav.Link>
              </Nav>
              <hr className="dashboard-offcanvas-divider" />
            </>
          )}

          {/* Main Navigation Links */}
          <Nav className="flex-column p-3 pt-0 flex-grow-1">
            {renderMainOffcanvasLinks(closeOffcanvas)}
          </Nav>

          {/* Logout Link at the bottom */}
          {currentUser && (
            <div className="mt-auto p-3 border-top"> {/* Use border-top instead of hr for cleaner look */}
              <Nav.Link
                onClick={() => {
                  handleLogout();
                  closeOffcanvas();
                }}
                className="dashboard-offcanvas-link text-danger"
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
              </Nav.Link>
            </div>
          )}
        </Offcanvas.Body>
      </Navbar.Offcanvas>

      {/* Desktop Sidebar (rendered directly in DashboardNav) */}
      <div
        className={`d-none d-lg-flex flex-column vh-100 p-3 bg-light shadow desktop-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
        style={{
          width: isSidebarOpen ? '250px' : '0',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1030, // Slightly lower z-index than top navbar
          overflowX: 'hidden',
          transition: 'width 0.3s ease-in-out',
          padding: isSidebarOpen ? '1rem' : '0', // Adjust padding based on state
          borderRight: isSidebarOpen ? '1px solid rgba(0,0,0,.1)' : 'none', // Optional border
        }}
      >
        {/* Content inside the sidebar - only visible when open */}
        <div style={{ display: isSidebarOpen ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}> {/* Use flex column for layout */}
          <Link to="." className="navbar-brand mb-4 mt-2 text-center text-dark d-block">
            {/* Replace with your actual logo/brand */}
             Quotra
          </Link>
          <Nav className="flex-column nav-pills flex-grow-1"> {/* flex-grow-1 to push logout to bottom */}
            {renderDesktopSidebarLinks()}
          </Nav>
          {currentUser && (
             <div className="mt-auto text-center pb-2 border-top pt-2"> {/* Push to bottom, add border top */}
                <small className="text-muted d-block mb-1">User: {currentUser.email}</small> {/* Display email */}
                <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Logout <BoxArrowRight className="ms-1" /></Button> {/* Added icon */}
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardNav;
