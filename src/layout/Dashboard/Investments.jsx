import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { addDays, isBefore, parseISO, differenceInDays } from 'date-fns';
import { API_BASE_URL } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons'; // Import the gear icon

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const InvestmentCard = ({ investment }) => (
  <Col xs={12} md={6} lg={4} className="mb-4">
    <Card className="h-100 shadow-lg border-0" style={{ borderRadius: '1.5rem', background: '#fff' }}>
      {/* Background Gear Icon */}
      <FontAwesomeIcon
        icon={faCog}
        className="rotating-gear-icon" // Added a class for CSS targeting
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '10rem', // Extraordinarily big
          color: 'rgba(0, 0, 0, 0.1)', // Light gray with low opacity, adjust as needed
          opacity: 0.3, // 30% opacity
          zIndex: 0, // Behind other content
        }}
      />
      <Card.Body className="d-flex flex-column" style={{ position: 'relative', zIndex: 1 }}> {/* Ensure card body content is above the icon */}
        <div className="text-end mb-2" style={{ position: 'relative', zIndex: 1 }}>
          <span className="text-primary fw-bold">{investment.assetName}</span>
        </div>
        <Card.Text className="mb-1" style={{ position: 'relative', zIndex: 1 }}>
          <strong>Invested:</strong> {formatCurrency(investment.invested)}
        </Card.Text>
        <hr className="my-2" style={{ position: 'relative', zIndex: 1 }}/>
        <Card.Text className="mb-1" style={{ position: 'relative', zIndex: 1 }}>
          <strong>Time Left:</strong> {investment.timeLeft}
        </Card.Text>
        <Card.Text className="mb-1" style={{ position: 'relative', zIndex: 1 }}>
          <strong>Accrued Profit:</strong> {formatCurrency(investment.accruedProfit)}
        </Card.Text>
        <div className="mt-auto text-end" style={{ position: 'relative', zIndex: 1 }}>
          <small className={`fw-bold text-${investment.timeLeft === 'Completed' ? 'success' : 'info'}`}>
            {investment.timeLeft === 'Completed' ? 'Completed' : 'Active'}
          </small>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const Investments = () => {

  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('User');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.username) {
      setUserName(loggedInUser.username);
    }

    const fetchData = async () => {
      if (!userId || !token) {
        setError("User not authenticated. Cannot fetch investments.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        // Fetch only the current user's investments from the backend
        const res = await fetch(`${API_BASE_URL}/assetOrders?userId=${userId}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch investments');
        const data = await res.json();
        setInvestments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  if (isLoading) return <Container className="text-center mt-5"><Spinner animation="border" /><p>Loading investments...</p></Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container fluid className="p-4">
      <h5 className="mb-2 fw-bold">Welcome, {userName}!</h5>
      <p className="lead mb-4">Track your investments.</p>
      <Row>
        {investments.length > 0 ? (
          investments.map(investment => (
            <InvestmentCard key={investment.id || investment._id} investment={investment} />
          ))
        ) : (
          <Col>
            <Alert variant="info">You currently have no investments to display.</Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Investments;