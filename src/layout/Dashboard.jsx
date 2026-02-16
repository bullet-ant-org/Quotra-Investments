import React, { useState, useEffect } from 'react'; // Added useEffect
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'; // Added useNavigate, useLocation
import { Nav, Button, Collapse } from 'react-bootstrap'; // Removed Image, added Collapse
import DashboardNav from './DashboardNav'; // Ensure DashboardNav is correctly using profileImageUrl from user object
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCircle, faCog, faHeartbeat, faSignOutAlt, faTachometerAlt, 
  faExchangeAlt, faChartLine, faTags, faChevronDown, faChevronUp, 
  faWallet, faMoneyBillWave, faDoorOpen, faHandHoldingUsd,
} from '@fortawesome/free-solid-svg-icons';
import { PersonCircle } from 'react-bootstrap-icons';

const DesktopSidebar = ({ isOpen, currentUser, onLogout, openAccountDetails, setOpenAccountDetails }) => {
  const navigate = useNavigate(); // For navigation from links if needed
  const location = useLocation();

  // Close account details on route change for desktop sidebar as well
  useEffect(() => {
    // setOpenAccountDetails(false); // Optionally close account details on route change
  }, [location, setOpenAccountDetails]);


  const mainDashboardNavLinks = [
    { to: '.', text: 'Dashboard', icon: faTachometerAlt },
    { to: 'transactions', text: 'Transactions', icon: faExchangeAlt },
    { to: 'investments', text: 'Investment', icon: faChartLine },
    { to: 'pricing', text: 'Pricing Plans', icon: faTags },
    { to: 'loan-types', text: 'Apply for Loan', icon: faHandHoldingUsd }, // Link to new Loan Types page
    { to: 'profile', text: 'My Profile', icon: faUserCircle },
  ];

  const renderMainDashboardNavLinks = (onClickHandler = () => {}) =>
    mainDashboardNavLinks.map((link) => (
      <Nav.Link
        key={link.text}
        as={NavLink}
        to={link.to}
        onClick={onClickHandler}
        className={({ isActive }) => `dashboard-nav-link ${isActive ? 'active-dashboard-link' : ''} text-dark-100`}
        end={link.to === '.'}
      >
        <FontAwesomeIcon icon={link.icon} className="me-2 fa-fw" />
        {link.text}
      </Nav.Link>
    ));
  
  const renderAccountSubLinks = (onClickHandler = () => {}) => (
    <>
      <Nav.Link as={Link} to="profile" className="dashboard-offcanvas-link" onClick={onClickHandler}>
        <FontAwesomeIcon icon={faUserCircle} className="me-2 fa-fw" /> View Profile
      </Nav.Link>
      <Nav.Link as={Link} to="settings" className="dashboard-offcanvas-link" onClick={onClickHandler}>
        <FontAwesomeIcon icon={faCog} className="me-2 fa-fw" /> Account Setting
      </Nav.Link>
      <Nav.Link as={Link} to="activity" className="dashboard-offcanvas-link" onClick={onClickHandler}>
        <FontAwesomeIcon icon={faHeartbeat} className="me-2 fa-fw" /> Login Activity
      </Nav.Link>
    </>
  );

  const renderProfileToggleAndDetails = (closeMenuHandler = () => {}) => (
    currentUser && (
      <>
        <Button
          onClick={() => setOpenAccountDetails(!openAccountDetails)}
          aria-controls={`account-details-collapse-desktop`}
          aria-expanded={openAccountDetails}
          variant="link"
          className={`dashboard-account-toggle text-decoration-none text-dark w-100 d-flex align-items-center p-3`}
        >
          {/* Removed profile image and icon */}
          <div className="flex-grow-1 text-start">
            <div className="dashboard-offcanvas-full-name">{currentUser.username || 'User'}</div>
            <div className="dashboard-offcanvas-email text-muted">{currentUser.email}</div>
          </div>
          <FontAwesomeIcon icon={openAccountDetails ? faChevronUp : faChevronDown} className="ms-2" />
        </Button>

        <Collapse in={openAccountDetails}>
          <div id={`account-details-collapse-desktop`} className="dashboard-offcanvas-account-details p-3 pt-2">
            <div className="dashboard-offcanvas-balance-section mb-2">
              <div className="text-uppercase text-muted dashboard-offcanvas-section-title">Main Account Balance</div>
              <div className="d-flex align-items-baseline">
                <div className="dashboard-offcanvas-total-balance">
                  {(currentUser.balance ?? 0).toFixed(2)}
                </div>
                <div className="dashboard-offcanvas-currency ms-1">USD</div>
              </div>
            </div>
            {/* Removed profits section */}
            <Nav className="flex-column">
              <Nav.Link as={Link} to="withdrawal" className="dashboard-offcanvas-link" onClick={closeMenuHandler}>
                <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 fa-fw" /> Withdraw Funds
              </Nav.Link>
              <Nav.Link as={Link} to="deposit" className="dashboard-offcanvas-link" onClick={closeMenuHandler}>
                <FontAwesomeIcon icon={faWallet} className="me-2 fa-fw" /> Deposit Funds
              </Nav.Link>
            </Nav>
          </div>
        </Collapse>
      </>
    )
  );

  return (
    <div
      className={`d-none d-lg-flex flex-column vh-100 bg-light shadow text-muted desktop-sidebar ${isOpen ? 'open' : 'closed'}`}
      style={{
        width: isOpen ? '20vw' : '0px', // Desktop sidebar width as 20vw
        minWidth: isOpen ? '200px' : '0px', // Optional: minimum width for 20vw
        position: 'fixed',
        top: '0px', // Below the top navbar
        height: 'calc(100vh - 56px)', // Full height minus top navbar
        left: 0,
        zIndex: 100000,
        overflowX: 'hidden',
        overflowY: 'auto',
        transition: 'width 0.3s ease-in-out, min-width 0.3s ease-in-out, padding 0.3s ease-in-out',
        padding: '0', // Padding handled by internal content
        borderRight: isOpen ? '1px solid rgba(0,0,0,.1)' : 'none',
      }}
    >
      <div style={{ display: isOpen ? 'flex' : 'none', flexDirection: 'column', height: '100%', width: '100%' }}>
        {/* Desktop Sidebar Header/Brand */}
        <div className="p-3 border-bottom">
          <Link to="." className="navbar-brand text-dark d-block text-center fw-bold">
            Quotra {/* Or your actual brand/logo */}
          </Link>
        </div>
        <hr className="dashboard-nav-divider mt-0" />
        
        {renderProfileToggleAndDetails(() => {})} {/* Empty onClick for desktop */}
        
        {currentUser && <hr className="dashboard-nav-divider" />}
        
        {currentUser && (
          <Nav className="flex-column p-3 pt-0 text-muted">
            {renderAccountSubLinks(() => {})} {/* Empty onClick for desktop */}
          </Nav>
        )}
        
        {currentUser && <hr className="dashboard-nav-divider" />}

        <Nav className="flex-column p-3 pt-0 flex-grow-1 text-muted">
          {renderMainDashboardNavLinks(() => {})} {/* Empty onClick for desktop */}
        </Nav>

        {currentUser && (
          <div className={`mt-auto p-3 border-top`}>
            <Nav.Link
              onClick={onLogout}
              className="dashboard-offcanvas-link text-danger"
              style={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faDoorOpen} className="me-2 fa-fw" /> Logout
            </Nav.Link>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [openAccountDetailsInSidebar, setOpenAccountDetailsInSidebar] = useState(false); // State for desktop sidebar's account collapse
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = () => {
      const storedUserString = localStorage.getItem('loggedInUser');
      const user = storedUserString ? JSON.parse(storedUserString) : null;
      setCurrentUser(user);
      if (!user) { // If no user, redirect to login
        navigate('/login');
      }
    };
    fetchUser();
    window.addEventListener('authChange', fetchUser);
    return () => window.removeEventListener('authChange', fetchUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('authChange'));
    navigate('/login');
  };

  // If currentUser is null (e.g., during initial load or after logout before redirect),
  // you might want to show a loader or nothing to prevent errors.
  if (!currentUser && !localStorage.getItem('loggedInUser')) { // Check localStorage too for initial redirect case
    // This check helps prevent rendering the layout if the user should be redirected.
    // The useEffect above will handle the redirect.
    return null; // Or a loading spinner
  }

  return (
    <div className={`dashboard-container ${isDesktopSidebarOpen ? 'sidebar-open' : ''}`}>
      <DashboardNav
        isSidebarOpen={isDesktopSidebarOpen}
        toggleSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
      />

      <DesktopSidebar
        isOpen={isDesktopSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
        openAccountDetails={openAccountDetailsInSidebar}
        setOpenAccountDetails={setOpenAccountDetailsInSidebar}
      />
      
      <main className="content-wrapper bg-white pe-0 pe-lg-3 ms-0 ms-lg-3"><Outlet /></main>
    </div>
  );
};

export default DashboardLayout;
