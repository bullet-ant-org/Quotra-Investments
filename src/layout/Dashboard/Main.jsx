// src/layout/Dashboard/Main.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import { format, parseISO, addDays, differenceInMilliseconds, isBefore } from 'date-fns'; // For formatting dates and calculations
import { PersonCircle } from 'react-bootstrap-icons';
// import DashboardNav from './DashboardNav'; // DashboardNav is part of DashboardLayout

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  // Removed the 'k' formatting for simplicity and consistency with other currency displays
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const Dashboard = ({ userId, onUserDataUpdate }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for dynamic investment tracking
  const [timeLeftFormatted, setTimeLeftFormatted] = useState('');
  const [dynamicallyCalculatedProfit, setDynamicallyCalculatedProfit] = useState(0);
  const [currentTotalInvestmentValue, setCurrentTotalInvestmentValue] = useState(0);

  const navigate = useNavigate();

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      navigate('/login');
      setIsLoading(false); // Stop loading if no userId
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
        }
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data);
      if (onUserDataUpdate) {
        onUserDataUpdate(data); // Callback to update parent if needed
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error fetching user data for dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigate, onUserDataUpdate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // useEffect for investment countdown and profit calculation
  useEffect(() => {
    if (userData && (userData.investmentStatus === 'active' || userData.investmentStatus === 'completed') &&
        userData.tradeStartTime && userData.tradeDurationDays > 0 &&
        typeof userData.currentInvestmentAmount === 'number' &&
        typeof userData.profitPotential === 'number') {

      const startTime = parseISO(userData.tradeStartTime);
      const endTime = addDays(startTime, userData.tradeDurationDays);
      const initialInvestment = userData.currentInvestmentAmount;
      const totalPotentialProfit = initialInvestment * (userData.profitPotential / 100);
      const totalDurationMs = differenceInMilliseconds(endTime, startTime);

      if (totalDurationMs <= 0) { // Should not happen if tradeDurationDays > 0
        setTimeLeftFormatted('Invalid duration');
        setDynamicallyCalculatedProfit(userData.accruedProfit || 0); // Fallback to server value
        setCurrentTotalInvestmentValue(initialInvestment + (userData.accruedProfit || 0));
        return;
      }

      const calculateValues = () => {
        const now = new Date();
        if (isBefore(now, endTime)) { // Investment is active
          const elapsedMs = differenceInMilliseconds(now, startTime);
          const progress = Math.min(1, Math.max(0, elapsedMs / totalDurationMs));
          const currentProfit = totalPotentialProfit * progress;

          setDynamicallyCalculatedProfit(currentProfit);
          setCurrentTotalInvestmentValue(initialInvestment + currentProfit);

          const remainingMs = differenceInMilliseconds(endTime, now);
          
          const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
          setTimeLeftFormatted(`${days}d ${hours}h ${minutes}m ${seconds}s`);

        } else { // Investment completed
          setTimeLeftFormatted('Completed');
          setDynamicallyCalculatedProfit(totalPotentialProfit); // Full potential profit
          setCurrentTotalInvestmentValue(initialInvestment + totalPotentialProfit);
          if (intervalId) clearInterval(intervalId);
        }
      };

      calculateValues(); // Initial calculation
      const intervalId = setInterval(calculateValues, 1000);

      return () => clearInterval(intervalId);
    } else if (userData && userData.investmentStatus === 'completed' && userData.tradeDurationDays > 0) {
        // If completed and had a duration, calculate final profit (could also trust server's accruedProfit)
        const initialInvestment = userData.currentInvestmentAmount;
        const totalPotentialProfit = initialInvestment * (userData.profitPotential / 100);
        setTimeLeftFormatted('Completed');
        setDynamicallyCalculatedProfit(totalPotentialProfit);
        setCurrentTotalInvestmentValue(initialInvestment + totalPotentialProfit);
    } else {
      // Reset if no active/valid investment for countdown
      setTimeLeftFormatted('');
      setDynamicallyCalculatedProfit(userData?.accruedProfit || 0);
      setCurrentTotalInvestmentValue((userData?.currentInvestmentAmount || 0) + (userData?.accruedProfit || 0));
    }
  }, [
    userData?.investmentStatus,
    userData?.tradeStartTime,
    userData?.tradeDurationDays,
    userData?.currentInvestmentAmount,
    userData?.profitPotential,
    userData?.accruedProfit // Added as a fallback
  ]);


  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !userData) { // Show error only if no user data could be loaded
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  if (!userData && !isLoading) {
     return (
        <Container className="text-center mt-5">
            <Alert variant="info">No user data available. Please try logging in again.</Alert>
        </Container>
     );
  }


  return (
    <Container className="mt-4">
      {/* Display error even if some stale userData is present */}
      {error && <Alert variant="warning" className="mb-3">Notice: {error} (Displaying last known data if available)</Alert>}

      {userData && (
        <>
          

          {userData.investmentStatus === 'completed' || userData.investmentStatus === 'active' ? (
            <Card className="mb-4">
              <Card.Header as="h5">Current Investment Details</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Plan Name:</strong> {userData.currentPlanName || 'N/A'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Investment Amount:</strong> {formatCurrency(userData.currentInvestmentAmount ?? 0)}
                  </ListGroup.Item>
                  {timeLeftFormatted && (
                    <ListGroup.Item>
                      <strong>Time Remaining:</strong> {timeLeftFormatted}
                    </ListGroup.Item>
                  )}
                  {userData.tradeStartTime && (
                    <ListGroup.Item>
                      <strong>Trade Start Date:</strong> {format(parseISO(userData.tradeStartTime), 'MMMM dd, yyyy HH:mm:ss')}
                    </ListGroup.Item>
                  )}
                  {userData.tradeDurationDays != null && ( // Check for null or undefined
                    <ListGroup.Item>
                      <strong>Trade Duration:</strong> {userData.tradeDurationDays} days
                    </ListGroup.Item>
                  )}
                   {userData.profitPotential != null && (
                    <ListGroup.Item>
                      <strong>Profit Potential:</strong> {userData.profitPotential}%
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item>
                    <strong>Current Accrued Profit:</strong> {formatCurrency(dynamicallyCalculatedProfit)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Current Investment Value:</strong> {formatCurrency(currentTotalInvestmentValue)}
                  </ListGroup.Item>
                   <ListGroup.Item>
                    <strong>Investment Status:</strong> <span className={`badge bg-${userData.investmentStatus === 'active' ? 'success' : 'primary'}`}>{userData.investmentStatus.replace(/_/g, ' ').toUpperCase()}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          ) : userData.investmentStatus === 'pending_confirmation' ? (
            <Card className="mb-4">
              <Card.Header as="h5">Pending Investment</Card.Header>
              <Card.Body>
                <Alert variant="warning">
                  Your investment is pending admin confirmation.
                </Alert>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Plan Name:</strong> {userData.pendingPlanName || 'N/A'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Investment Amount:</strong> {formatCurrency(userData.pendingInvestmentAmount ?? 0)}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          ) : (
            <Row className="justify-content-center mt-4">
              <Col md={8} lg={6}>
                <Card className="text-center shadow-sm border-0 rounded-3 p-4">
                  <Card.Body>
                    <Card.Title as="h4" className="mb-3">No Active Investments</Card.Title>
                    <Card.Text className="fs-5 mb-4">
                      You currently do not have any active investments. Explore our plans to get started.
                    </Card.Text>
                    <Button as={Link} to="/dashboard/pricing" variant="primary" size="lg">
                      View Investment Plans
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};


const Main = () => {
    // In a real app, userId might come from context or a global state after login
    const userId = localStorage.getItem('userId'); // Ensure 'userId' is set at login

    // Example of how onUserDataUpdate could be used if DashboardLayout needs user data
    // const [layoutUserData, setLayoutUserData] = useState(null);
    // const handleUserDataUpdateForLayout = (data) => {
    //   setLayoutUserData(data);
    // };

    return <Dashboard userId={userId} /* onUserDataUpdate={handleUserDataUpdateForLayout} */ />;
};

export default Main;
