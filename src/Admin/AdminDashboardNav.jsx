// src/Admin/AdminDashboardNav.jsx
import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Offcanvas, Button, Image, NavDropdown, Collapse, Spinner } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PersonCircle } from 'react-bootstrap-icons'; // Bootstrap icon for placeholder if FA fails or isn't preferred

// Import Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, // Dashboard/Admin Icon
  faUserCircle, // User Profile Icon
  faCog, // Settings Icon
  faHeartbeat, // Activity Icon
  faSignOutAlt, // Logout Icon
  faExchangeAlt, // Transactions Icon (General)
  faListAlt, // Transactions Icon (List)
  faChevronDown, // Dropdown/Collapse Down
  faChevronUp, // Dropdown/Collapse Up
  faCreditCard, // Deposit/Payment Icon
  faGem, // Bonus Icon
  faPlusSquare, // Add/Deposit Icon
  faHandshake, // Commission Icon
  faFolderOpen, // Manage Assets Icon
  faFileInvoiceDollar, // Manage Loans Icon
  faArrowAltCircleDown, // Deposit Requests Icon
  faArrowAltCircleUp, // Withdrawal Requests Icon
  faBars // Menu Icon
} from '@fortawesome/free-solid-svg-icons'; // Using solid icons as in DashboardNav example

// If you specifically want line icons (far), you'd import from '@fortawesome/free-regular-svg-icons'
// import { faChartBar as farChartBar, faListAlt as farListAlt, ... } from '@fortawesome/free-regular-svg-icons';
// And use them like <FontAwesomeIcon icon={farChartBar} />

import { API_BASE_URL } from '../utils/api'; // Import your API_BASE_URL

const SidebarContent = ({
  currentUser,
  handleLogout,
  totalUsers,
  totalDeposits,
  onNavLinkClick,
}) => {
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const commonNavLinkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center sidebar-link py-2 ${isActive ? 'active-dashboard-link' : 'text-dark'}`;

  return (
    <div className="d-flex flex-column h-100">
      <Link to="/admin" className="navbar-brand mb-2 mt-2 text-primary fw-bold d-block fs-4 px-3" onClick={onNavLinkClick}>
        <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />Quotra Admin
      </Link>
      <hr className="sidebar-divider mx-3 mt-0 mb-2" />

      {/* User Info Accordion */}
      <div className="user-info-section px-2 mb-2">
        <Button
          onClick={() => setIsUserInfoOpen(!isUserInfoOpen)}
          aria-controls="user-info-collapse"
          aria-expanded={isUserInfoOpen}
          variant="link"
          className="dashboard-offcanvas-account-toggle text-decoration-none text-dark w-100 d-flex align-items-center p-3 py-2"
        >
          {/* Removed profile image */}
          <div className="flex-grow-1 text-start">
            <div className="dashboard-offcanvas-full-name fw-bold text-primary">{currentUser?.username || 'Admin User'}</div>
            <div className="dashboard-offcanvas-email text-muted small">{currentUser?.email}</div>
          </div>
          <FontAwesomeIcon icon={isUserInfoOpen ? faChevronUp : faChevronDown} className="ms-2 text-secondary" />
        </Button>
        <Collapse in={isUserInfoOpen}>
          <div id="user-info-collapse" className="mt-2 ps-2">
            <div className="mb-2">
              <small className="text-muted d-block">Total Users:</small>
              <span className="fw-bold">{totalUsers === null ? <Spinner size="sm" animation="border" /> : totalUsers}</span>
            </div>
            <div className="mb-2">
              <small className="text-muted d-block">Total Deposits:</small>
              <span className="fw-bold">{totalDeposits === null ? <Spinner size="sm" animation="border" /> : totalDeposits}</span>
            </div>
            <Nav.Link as={NavLink} to="/admin/transactions" onClick={onNavLinkClick} className={commonNavLinkClass}>
              <FontAwesomeIcon icon={faListAlt} className="me-2" fixedWidth />Transactions
            </Nav.Link>
          </div>
        </Collapse>
      </div>

      {/* Main Navigation Links */}
      <Nav className="flex-column nav-pills px-3 flex-grow-1">
        <div className="mb-1">
          <Button
            onClick={() => setIsDepositOpen(!isDepositOpen)}
            aria-controls="deposit-links-collapse"
            aria-expanded={isDepositOpen}
            variant="link"
            className={`nav-link d-flex align-items-center sidebar-link py-3 w-100 ${isDepositOpen ? 'text-primary' : 'text-dark'}`}
          >
            <FontAwesomeIcon icon={faCreditCard} className="me-2" fixedWidth />Deposit
            <FontAwesomeIcon icon={isDepositOpen ? faChevronUp : faChevronDown} className="ms-auto text-secondary" />
          </Button>
          <Collapse in={isDepositOpen}>
            <div id="deposit-links-collapse" className="ps-3">
              <Nav.Link as={NavLink} to="/admin/add-bonus" onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faGem} className="me-2" fixedWidth />Add Bonus</Nav.Link>
              <Nav.Link as={NavLink} to="/admin/create-deposit" onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faPlusSquare} className="me-2" fixedWidth />Create Deposit</Nav.Link>
            </div>
          </Collapse>
        </div>
        {/* Other main links */}
        <Nav.Link as={NavLink} to="/admin/users" onClick={onNavLinkClick} className={commonNavLinkClass}>
          <FontAwesomeIcon icon={faUserCircle} className="me-2" fixedWidth />Users
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/admintransactions" end onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faListAlt} className="me-2" fixedWidth />Transactions</Nav.Link>
        <Nav.Link as={NavLink} to="/admin/pricing-admin" onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faFolderOpen} className="me-2" fixedWidth />Assets Management</Nav.Link>
        <Nav.Link as={NavLink} to="/admin/loan-types-admin" onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faExchangeAlt} className="me-2" fixedWidth />Loans Management</Nav.Link>
        <Nav.Link as={NavLink} to="/admin/settings" onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faCog} className="me-2" fixedWidth />Site Settings</Nav.Link>
        <Nav.Link as={NavLink} to="/admin/deposit-requests" onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faArrowAltCircleDown} className="me-2" fixedWidth />Deposit Requests</Nav.Link>
        <Nav.Link as={NavLink} to="/admin/withdrawal-requests" onClick={onNavLinkClick} className={commonNavLinkClass}><FontAwesomeIcon icon={faArrowAltCircleUp} className="me-2" fixedWidth />Withdrawal Requests</Nav.Link>
      </Nav>

      {/* Logout at the bottom */}
      <div className="mt-auto p-3 border-top">
        {currentUser?.email && (
          <small className="text-muted d-block mb-1" style={{ fontSize: '0.8em' }}>Admin: {currentUser.email}</small>
        )}
        <Button variant="outline-danger" size="sm" onClick={handleLogout} className="w-100">
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />Logout
        </Button>
      </div>
    </div>
  );
};

const AdminDashboardNav = ({ isSidebarOpen, toggleSidebar }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalDeposits, setTotalDeposits] = useState(null);
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
          if (response.status === 401) navigate('/login');
          throw new Error('Failed to fetch user data for admin check');
        }

        const userData = await response.json();
        if (userData && userData.role === 'admin') {
          setCurrentUser(userData);
        } else {
          navigate('/login');
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Fetch total users and total deposits from endpoints
  useEffect(() => {
    const fetchAggregates = async () => {
      try {
        // Fetch total users
        const usersRes = await fetch(`${API_BASE_URL}/users`);
        let usersCount = null;
        if (usersRes.ok) {
          const users = await usersRes.json();
          usersCount = Array.isArray(users) ? users.length : 0;
        }

        // Fetch total deposits (count of depositRequests)
        const depositsRes = await fetch(`${API_BASE_URL}/depositRequests`);
        let depositsCount = null;
        if (depositsRes.ok) {
          const deposits = await depositsRes.json();
          depositsCount = Array.isArray(deposits) ? deposits.length : 0;
        }

        setTotalUsers(usersCount);
        setTotalDeposits(depositsCount);
      } catch (err) {
        setTotalUsers('N/A');
        setTotalDeposits('N/A');
      }
    };
    if (currentUser) fetchAggregates();
  }, [currentUser]);

  const handleOffcanvasToggle = () => setShowOffcanvas(!showOffcanvas);
  const closeOffcanvas = () => setShowOffcanvas(false);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('authChange'));
    navigate('/login');
  };

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const potentialNavDropdownSrc = currentUser?.profileImageUrl || currentUser?.profilePictureUrl;
  const displayNavDropdownProfileSrc = potentialNavDropdownSrc === "" ? null : potentialNavDropdownSrc;

  return (
    <>
      {/* Top Navbar */}
      <Navbar bg="light" variant="light" expand="lg" className="fixed-top shadow main-navbar" style={{ zIndex: 10 }}>
        <Container fluid>
          <Button
            variant="outline-secondary"
            className="d-lg-none me-2"
            onClick={handleOffcanvasToggle}
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>
          <Button
            variant="outline-secondary"
            className="d-none d-lg-inline-block me-3"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>

          <Nav className="ms-auto align-items-center">
            {currentUser ? (
              <NavDropdown
                title={
                  displayNavDropdownProfileSrc ? (
                    <Image src={displayNavDropdownProfileSrc} roundedCircle style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                  ) : (
                    <PersonCircle size={30} className="text-secondary profile-icon-placeholder" />
                  )
                }
                id="basic-nav-dropdown-admin"
                align="end"
              >
                 <NavDropdown.Header>
                    <div className="fw-bold">{currentUser.username || 'Admin User'}</div>
                    <div className="text-muted small">{currentUser.email}</div>
                 </NavDropdown.Header>
                 <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/settings">
                  <FontAwesomeIcon icon={faCog} className="me-2" fixedWidth />Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" fixedWidth />Logout
                </NavDropdown.Item>
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
        id={`offcanvasNavbar-expand-lg-admin`}
        aria-labelledby={`offcanvasNavbarLabel-expand-lg-admin`}
        placement="start"
        show={showOffcanvas}
        onHide={handleOffcanvasToggle}
        className="bg-light d-lg-none shadow-sm"
        style={{ zIndex: 100000, width: '80vw' }}
      >
        <Offcanvas.Header closeButton>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          <SidebarContent
            currentUser={currentUser}
            handleLogout={handleLogout}
            totalUsers={totalUsers}
            totalDeposits={totalDeposits}
            onNavLinkClick={closeOffcanvas}
          />
        </Offcanvas.Body>
      </Navbar.Offcanvas>

      {/* Desktop Sidebar */}
      <div
        className={`d-none d-lg-flex flex-column vh-100 bg-light shadow-sm desktop-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
        style={{
          width: isSidebarOpen ? '280px' : '0',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1030,
          overflowX: 'hidden',
          overflowY: 'auto',
          transition: 'width 0.3s ease-in-out, padding 0.3s ease-in-out',
          paddingTop: '1rem',
          paddingLeft: isSidebarOpen ? '0.5rem' : '0',
          paddingRight: isSidebarOpen ? '0.5rem' : '0',
          borderRight: isSidebarOpen ? '1px solid #dee2e6' : 'none'
        }}
      >
        {isSidebarOpen && (
          <SidebarContent
            currentUser={currentUser}
            handleLogout={handleLogout}
            totalUsers={totalUsers}
            totalDeposits={totalDeposits}
            onNavLinkClick={() => {}}
          />
        )}
      </div>
    </>
  );
};

export default AdminDashboardNav;
