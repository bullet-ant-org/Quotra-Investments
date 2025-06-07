import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faPiggyBank, faShieldAlt, faHandHoldingUsd, faBalanceScale, faLightbulb, faRocket, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import NavbarComponent from './Navbar'; // Assuming your Navbar is in the same directory or adjust path
import Footer from './Footer';       // Assuming your Footer is in the same directory or adjust path

const ServiceCard = ({ icon, title, description, animationClass, iconColor = '#0d6efd' }) => (
  <Col md={6} lg={4} className="mb-4 d-flex align-items-stretch">
    <Card className="text-center shadow-lg border-0 service-card-hover" style={{ borderRadius: '15px', overflow: 'hidden' }}>
      <Card.Body className="d-flex flex-column p-4">
        <div className={`service-icon-container mb-3 ${animationClass}`}>
          <FontAwesomeIcon icon={icon} size="4x" style={{ color: iconColor }} />
        </div>
        <Card.Title as="h4" className="mb-3 fw-bold" style={{ color: '#0d6efd' }}>{title}</Card.Title>
        <Card.Text className="text-muted flex-grow-1">{description}</Card.Text>
        <Button variant="outline-primary" as={Link} to="/contact" className="mt-auto align-self-center" style={{ borderRadius: '50px', padding: '10px 25px' }}>
          Learn More
        </Button>
      </Card.Body>
    </Card>
  </Col>
);

const ServicesPage = () => {
  const investmentServices = [
    {
      icon: faChartLine,
      title: 'Strategic Portfolio Management',
      description: 'At Quotra Investments, we leverage cutting-edge analytics and market insights to build and manage diversified portfolios. Our goal is to maximize your returns while mitigating risks, ensuring your financial growth is steady and secure. Experience the magic of strategic asset allocation tailored to your unique goals.',
      animationClass: 'icon-float',
    },
    {
      icon: faPiggyBank,
      title: 'Wealth Creation & Preservation',
      description: 'Unlock your potential for wealth with Quotra. We offer bespoke investment strategies designed for long-term capital appreciation and preservation. Our experts guide you through market complexities, turning opportunities into tangible assets. Let us help you build a legacy.',
      animationClass: 'icon-pulse',
      iconColor: '#17a2b8' // A different shade of blue/teal
    },
    {
      icon: faShieldAlt,
      title: 'Risk-Adjusted Returns',
      description: 'Navigating the financial markets requires a keen understanding of risk. Quotra Investments specializes in sophisticated risk management techniques, ensuring your investments are not only profitable but also resilient. Invest with confidence, knowing your future is protected.',
      animationClass: 'icon-rotate',
    },
  ];

  const loanServices = [
    {
      icon: faHandHoldingUsd,
      title: 'Flexible Personal Loans',
      description: 'Need funds for a personal project, emergency, or a significant purchase? Quotra Investments offers flexible personal loans with competitive interest rates and repayment terms designed to fit your life. Get the financial boost you need, when you need it.',
      animationClass: 'icon-bounce',
      iconColor: '#28a745' // Green for loans
    },
    {
      icon: faBalanceScale,
      title: 'Business & Startup Funding',
      description: 'Fuel your entrepreneurial dreams with our tailored business loan solutions. Whether you\'re a startup looking for seed capital or an established business aiming to expand, Quotra provides the financial leverage to propel your venture to new heights. Let\'s build success together.',
      animationClass: 'icon-sway',
    },
    {
      icon: faLightbulb,
      title: 'Innovative Loan Products',
      description: 'We believe in financial empowerment. Quotra Investments continuously innovates to bring you loan products that are transparent, accessible, and aligned with your aspirations. Discover a new world of financial possibilities with our client-centric approach.',
      animationClass: 'icon-float',
      iconColor: '#ffc107' // Yellow for innovation
    },
  ];

  const pageHeaderStyle = {
    padding: '60px 0',
    background: `linear-gradient(135deg, rgba(13,110,253,0.8) 0%, rgba(0,86,179,0.9) 100%), url('https://via.placeholder.com/1920x400.png?text=Abstract+Financial+Background')`, // Placeholder for a dynamic background
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    textAlign: 'center',
    marginBottom: '50px',
  };

  return (
    <>
      <NavbarComponent />
      <div style={pageHeaderStyle}>
        <Container>
          <h1 className="display-3 fw-bold">Our Services</h1>
          <p className="lead fs-4">
            Quotra Investments: Empowering Your Financial Journey with Expertise and Innovation.
          </p>
        </Container>
      </div>

      <Container className="my-5">
        {/* Investment Services Section */}
        <Row className="mb-5">
          <Col xs={12} className="text-center mb-4">
            <h2 className="fw-bold section-title-underline">
              <FontAwesomeIcon icon={faRocket} className="me-2 text-primary" />
              Hedge Fund & Investment Services
            </h2>
            <p className="text-muted fs-5">
              Unlock the potential of global markets with our expert investment strategies.
            </p>
          </Col>
        </Row>
        <Row>
          {investmentServices.map((service, index) => (
            <ServiceCard key={`invest-${index}`} {...service} />
          ))}
        </Row>

        {/* Loan Services Section */}
        <Row className="mt-5 pt-4 mb-5">
          <Col xs={12} className="text-center mb-4">
            <h2 className="fw-bold section-title-underline">
              <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
              Flexible Loan Solutions
            </h2>
            <p className="text-muted fs-5">
              Access the funds you need with our transparent and supportive loan services.
            </p>
          </Col>
        </Row>
        <Row>
          {loanServices.map((service, index) => (
            <ServiceCard key={`loan-${index}`} {...service} />
          ))}
        </Row>
      </Container>
    </>
  );
};

export default ServicesPage;
