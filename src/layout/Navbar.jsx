import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import black from '../assets/logo-no-background1.png'; // Adjust the path and filename as needed
import { Link } from 'react-router-dom';
import Nonee1 from '../assets/nonee1.png'; // Adjust the path and filename as needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faQuestionCircle, faDollarSign, faUser, faSignInAlt } from '@fortawesome/free-solid-svg-icons';



const NavbarComponent = () => {
  return (
    <>
      <Navbar expand="sm" className="custom-shadow sticky-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            <img src={black} alt="Quotra Logo" height={30}/>
          </Navbar.Brand>
          {/* Toggler button for Offcanvas */}
          <Navbar.Toggle aria-controls="offcanvasNavbar" className="border-0 text-white">
            <span className="material-symbols-outlined text-black icon">
              menu_open
            </span>
          </Navbar.Toggle>
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
            {/* Make Offcanvas.Body a flex container to allow the new section to grow */}
            <Offcanvas.Body className="offcanvas-custom-body d-flex flex-column">
              {/* Navigation Links */}
              <Nav className="justify-content-end pe-3"> {/* Removed flex-grow-1 to allow the container below to fill space */}
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

              {/* New Container added below the Nav */}
              <Container fluid className="bg-primary rounded-5 p-3 mt-3 d-sm-none" style={{ flexGrow: 1 }}>
                {/* Content for this new container will be added by you later */}
                <div className="row justify-content-center">
          
          <div className="col-md-5 text-center">
            <img src={Nonee1} alt="" className="image-fluid text-center" height={200}/>
          </div>
          <div className="col-md-5 text-center text-md-start">
                        
              <p className='text-light pt-2'>Your Future, Our Responsibility</p>
              <p className='text-light'>Join Us today for a Better and secured Financial future</p>
              

          </div>
        </div>
                {/* You can add a placeholder text if needed, e.g., <p className="text-white">Your new section here</p> */}
              </Container>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarComponent;
