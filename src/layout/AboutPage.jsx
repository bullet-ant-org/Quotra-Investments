import React from 'react';
import { Container, Row, Col, Image, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faUsers, faLightbulb, faShieldAlt, faHandshake, faStar, faArrowRight, faChartLine } from '@fortawesome/free-solid-svg-icons'; // Added faChartLine
import { Link } from 'react-router-dom';
import NavbarComponent from './Navbar'; // Assuming your Navbar is in the same directory or adjust path
import Footer from './Footer';       // Assuming your Footer is in the same directory or adjust path
import companyVisionImage from '../assets/nonee1.png'; // Import the image
import companyVisionImage1 from '../assets/baggy.png';

// Placeholder image URLs - replace these with your actual images
const user1 = 'https://overlandexp.com/wp-content/uploads/2016/05/young-white-man-in-suit-300x224.jpg';
const user2 = 'https://img.freepik.com/free-photo/medium-shot-woman-posing-indoors_23-2149915935.jpg?semt=ais_hybrid&w=740'; // Placeholder for team member images
const user3 = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR04EtDzhAC9AaLcHnD-NvgAK2P5ihf_JkbTQ&s';
const user4 = 'https://media.istockphoto.com/id/153677566/photo/attractive-female-white-collar-worker.jpg?s=612x612&w=0&k=20&c=SiG-8cvj7VFs8vI9KrdFAUTynWv1gzEXlpTcLPeMhks=';

const ValueCard = ({ icon, title, text, iconColor = "#0d6efd" }) => (
  <Col md={6} lg={3} className="mb-4 d-flex align-items-stretch">
    <Card className="text-center shadow-sm border-0 p-4 value-card">
      <FontAwesomeIcon icon={icon} size="3x" className="mb-3" style={{ color: iconColor }} />
      <Card.Title as="h5" className="fw-bold mb-2" style={{color: "#0d6efd"}}>{title}</Card.Title>
      <Card.Text className="text-muted small">
        {text}
      </Card.Text>
    </Card>
  </Col>
);

const TeamMemberCard = ({ name, title, imageSrc }) => (
  <Col md={6} lg={3} className="mb-4 text-center team-member-card">
    <Image src={imageSrc} roundedCircle className="mb-3 shadow" style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #0d6efd' }} />
    <h5 className="fw-bold mb-1">{name}</h5>
    <p className="text-muted">{title}</p>
  </Col>
);

const AboutPage = () => {
  const headerStyle = {
    backgroundImage: `linear-gradient(rgba(13, 110, 253, 0.6), rgba(0, 86, 179, 0.7)), url(${companyVisionImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    padding: '80px 0',
    textAlign: 'center',
  };

  return (
    <>
      <NavbarComponent />

      {/* Header Section */}
      <div style={headerStyle} className="about-header">
        <Container>
          <h1 className="display-2 fw-bolder animated-text-fill">About Quotra Investments</h1>
          <p className="lead fs-4" style={{ animation: 'fadeInUp 1s ease-out 0.5s forwards', opacity: 0 }}>
            Pioneering Your Path to Financial Prosperity and Security.
          </p>
        </Container>
      </div>

      {/* Our Story/Mission Section */}
      <Container className="my-5 py-5">
        <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0">
            <Image src={companyVisionImage1} rounded fluid className=" about-story-image" style={{ maxHeight: '350px', objectFit: 'cover', width: '100%' }} />
          </Col>
          <Col lg={6}>
            <h2 className="fw-bold mb-3 section-title-left-blue">Our Mission: Your Financial Elevation</h2>
            <p className="text-muted lead mb-3">
              At Quotra Investments, we were founded on the principle that everyone deserves access to expert financial guidance and opportunities for growth. We are more than just a hedge fund or a loan provider; we are your dedicated partners in navigating the complexities of the financial world.
            </p>
            <p className="text-muted">
              Our journey began with a vision to demystify investments and make funding accessible. Today, we blend innovative technology with seasoned expertise to offer a suite of services designed to empower your financial decisions, whether you're looking to grow your wealth through strategic investments or secure flexible funding for your aspirations. We believe in building lasting relationships based on trust, transparency, and a shared vision for success.
            </p>
            <Button as={Link} to="/services" variant="primary" className="mt-3" style={{ borderRadius: '50px', padding: '10px 30px' }}>
              Explore Our Services <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Our Values Section */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold section-title-center-blue">Our Core Values</h2>
              <p className="text-muted fs-5">The principles that guide every decision we make.</p>
            </Col>
          </Row>
          <Row>
            <ValueCard icon={faShieldAlt} title="Integrity First" text="Upholding the highest ethical standards in all our interactions and operations." />
            <ValueCard icon={faLightbulb} title="Client-Centric Innovation" text="Continuously evolving our services to meet your unique needs with cutting-edge solutions." iconColor="#ffc107" />
            <ValueCard icon={faUsers} title="Collaborative Partnership" text="Working hand-in-hand with you, fostering transparency and mutual understanding." />
            <ValueCard icon={faStar} title="Excellence & Expertise" text="Leveraging deep market knowledge and a commitment to delivering outstanding results." iconColor="#198754"/>
          </Row>
        </Container>
      </section>

      {/* Meet Our Team Section (Placeholders) */}
      <Container className="my-5 py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold section-title-center-blue">Meet The Quotra Team</h2>
            <p className="text-muted fs-5">The dedicated professionals behind your financial success.</p>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <TeamMemberCard name="Alex Johnson" title="Chief Investment Strategist" imageSrc={user1} />
          <TeamMemberCard name="Maria Garcia" title="Head of Loan Origination" imageSrc={user2} />
          <TeamMemberCard name="Samuel Lee" title="Senior Risk Analyst" imageSrc={user3} />
          <TeamMemberCard name="Priya Sharma" title="Client Relations Director" imageSrc={user4} />
        </Row>
         <Row className="mt-4 text-center">
            <Col>
                <p className="text-muted"><em>Our full team comprises diverse experts committed to your financial well-being.</em></p>
            </Col>
        </Row>
      </Container>

      {/* Why Choose Quotra Section */}
      <section className="py-5" style={{ backgroundColor: '#0d6efd', color: 'white' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">Why Partner with Quotra Investments?</h2>
              <p className="fs-5" style={{opacity: 0.9}}>Discover the Quotra difference.</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4 text-center">
              <FontAwesomeIcon icon={faBullseye} size="3x" className="mb-3" />
              <h4 className="fw-semibold">Tailored Strategies</h4>
              <p style={{opacity: 0.85}}>Custom financial plans and investment portfolios designed around your specific objectives and risk appetite.</p>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <FontAwesomeIcon icon={faHandshake} size="3x" className="mb-3" />
              <h4 className="fw-semibold">Transparent Operations</h4>
              <p style={{opacity: 0.85}}>Clear, honest communication and straightforward processes, so you're always informed and confident.</p>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-3" />
              <h4 className="fw-semibold">Proven Expertise</h4>
              <p style={{opacity: 0.85}}>A team of seasoned financial professionals dedicated to navigating market dynamics for your benefit.</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <Container className="text-center my-5 py-5">
        <h2 className="fw-bold mb-3">Ready to Elevate Your Financial Future?</h2>
        <p className="text-muted fs-5 mb-4">
          Let Quotra Investments be your trusted partner. Contact us today for a personalized consultation.
        </p>
        <Button as={Link} to="/login" variant="primary" size="lg" style={{ borderRadius: '50px', padding: '15px 40px', backgroundColor: '#0d6efd' }}>
          Get Started Today
        </Button>
      </Container>

    </>
  );
};

export default AboutPage;