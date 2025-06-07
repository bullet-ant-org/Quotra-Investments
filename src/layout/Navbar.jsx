import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import black from '../assets/logo-no-background1.png'; // Adjust the path and filename as needed
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faQuestionCircle, faDollarSign, faUser, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

// Suggestion: Create a Navbar.css file and import it, or add the styles below to your src/index.css

const NavbarComponent = () => {
  return (
    <>
      <Navbar expand="sm" className="custom-shadow sticky-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            <img src={black} alt="Quotra Logo" height={30}/>
          </Navbar.Brand>
          {/* Toggler button for Offcanvas */}
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            className="offcanvas-custom" // Custom class for width and styling context
          >
            <Offcanvas.Header closeButton className="offcanvas-custom-header">
              <Offcanvas.Title id="offcanvasNavbarLabel" className="offcanvas-custom-title">
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="offcanvas-custom-body">
              {/* Navigation Links */}
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link as={Link} to="/" className="offcanvas-nav-link">
                  <FontAwesomeIcon icon={faHome} className="me-2" /> Home
                </Nav.Link>
                {/* Use Link component for internal navigation */}
                <Nav.Link as={Link} to="/about" className="offcanvas-nav-link">
                  <FontAwesomeIcon icon={faQuestionCircle} className="me-2" /> About Us
                </Nav.Link>
                <Nav.Link as={Link} to="/services" className="offcanvas-nav-link">
                  <FontAwesomeIcon icon={faDollarSign} className="me-2" /> Services
                </Nav.Link>
                <NavDropdown 
                  title={
                    <>
                      <FontAwesomeIcon icon={faUser} className="me-2" /> Account
                    </>
                  } 
                  id="offcanvasNavbarDropdown" 
                  align="end"
                  className="offcanvas-nav-link" // Apply to dropdown toggle as well
                >
                  {/* Use the 'as' prop here */}
                  <NavDropdown.Item as={Link} to={'/login'} className="offcanvas-dropdown-item">
                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarComponent;
