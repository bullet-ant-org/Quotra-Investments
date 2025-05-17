import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import black from '../assets/logo-no-background1.png'; // Adjust the path and filename as needed
import { Link } from 'react-router-dom';

const NavbarComponent = () => {
  return (
    <>
      <Navbar expand="sm" className=" custom-shadow sticky-top"> {/* Changed background to white */}
        <Container fluid>
          <Navbar.Brand><img src={black} alt="Example" height={30}/></Navbar.Brand>
          {/* Toggler button for Offcanvas */}
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              {/* Navigation Links */}
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link href="#home">Home</Nav.Link>
                {/* Use Link component for internal navigation */}
                <Nav.Link as={Link} to="/support">Support</Nav.Link> {/* Example for Support */}
                <Nav.Link as={Link} to="/pricing">Pricing</Nav.Link> {/* Example for Pricing */}
                <NavDropdown title="Account" id="offcanvasNavbarDropdown" align={"end"}>
                  {/* Use the 'as' prop here */}
                  <NavDropdown.Item as={Link} to={'/login'}>
                    Login
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
