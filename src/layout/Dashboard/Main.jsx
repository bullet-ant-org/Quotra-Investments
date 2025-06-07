// src/layout/Dashboard/Main.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Import API_BASE_URL

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const Dashboard = ({ userId }) => { // Accept userId prop
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID not available.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch user data, deposit requests, and withdrawal requests in parallel
        const [userRes, depositRequestsRes, withdrawalRequestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${userId}`),
          fetch(`${API_BASE_URL}/depositRequests?userId=${userId}&status=confirmed`), // Filter by userId and status
          fetch(`${API_BASE_URL}/withdrawalRequests?userId=${userId}&status=confirmed`) // Filter by userId and status
        ]);

        if (!userRes.ok) {
          throw new Error(`Failed to fetch user data: ${userRes.statusText}`);
        }
        const userData = await userRes.json();

        let totalConfirmedDeposits = 0;
        let lastDepositAmount = 0;
        if (depositRequestsRes.ok) {
          const deposits = await depositRequestsRes.json();
          if (deposits.length > 0) {
            // Sort by date to find the most recent
            deposits.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
            lastDepositAmount = parseFloat(deposits[0].amount) || 0;
            totalConfirmedDeposits = deposits.reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);
          }
        } else {
          console.warn("Failed to fetch deposit requests or no confirmed deposits found.");
        }

        let totalConfirmedWithdrawals = 0;
        let lastWithdrawalAmount = 0;
        if (withdrawalRequestsRes.ok) {
          const withdrawals = await withdrawalRequestsRes.json();
          if (withdrawals.length > 0) {
            // Sort by date to find the most recent
            withdrawals.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
            lastWithdrawalAmount = parseFloat(withdrawals[0].amount) || 0;
            totalConfirmedWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + (parseFloat(withdrawal.amount) || 0), 0);
          }
        } else {
          console.warn("Failed to fetch withdrawal requests or no confirmed withdrawals found.");
        }

        // Map fetched data to the state structure
        setUserData({
          fullName: userData.username || 'User',
          clientWalletAddress: userData.withdrawalAccount || null,
          availableBalance: userData.balance || 0,
          allTimeAvailableBalance: userData.totalIncome || 0, // This might need adjustment based on your logic
          totalDeposit: totalConfirmedDeposits, // Sum of confirmed deposits
          lastDeposit: lastDepositAmount,       // Amount of the last confirmed deposit
          totalWithdraw: totalConfirmedWithdrawals, // Sum of confirmed withdrawals
          lastWithdrawal: lastWithdrawalAmount,   // Amount of the last confirmed withdrawal
        });

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]); // Re-run effect if userId changes

  const cardData = [
    {
      title: 'Available Balance',
      value: userData?.availableBalance ?? 0,
      // 'allTimeValue' for balance might be the same as current or a different metric like 'total earnings'
      // For now, let's use a placeholder or a different interpretation if available
      allTimeValue: userData?.allTimeAvailableBalance ?? 0, // Or perhaps total earnings if that's what it means
      borderColor: 'primary',
    },
    {
      title: 'Total Deposit',
      value: userData?.lastDeposit ?? 0, // Display last deposit amount as the main value
      allTimeValue: userData?.totalDeposit ?? 0, // Display sum of all deposits as "All Time"
      borderColor: 'success',
      isDeposit: true, // Flag to potentially style or handle differently
    },
    {
      title: 'Total Withdraw',
      value: userData?.lastWithdrawal ?? 0, // Display last withdrawal amount as the main value
      allTimeValue: userData?.totalWithdraw ?? 0, // Display sum of all withdrawals as "All Time"
      borderColor: 'danger',
      isWithdrawal: true, // Flag
    },
  ];

  const handleWithdrawClick = () => { // This function definition was immediately after the extra brace
    // Placeholder for withdrawal logic
    // You'll likely need to navigate or trigger a modal/component for withdrawal
    console.log('Withdraw clicked');
    // Example: navigate('/withdraw'); // You would need to import useNavigate for this
  };
  const renderCards = () =>
    cardData.map((card, index) => (
      <Col key={index} md={4}>
        <Card className={`h-100`}>
          <Card.Body>
            <Card.Title>{card.title}</Card.Title>
            {/* For Deposit/Withdrawal, the main value is 'Last', and 'All Time' is the total */}
            <Card.Text className="fw-bold fs-4">
              {card.isDeposit || card.isWithdrawal ? `Last: ${formatCurrency(card.value || 0)}` : formatCurrency(card.value || 0)}
            </Card.Text>
            <small>All Time: {formatCurrency(card.allTimeValue || 0)}</small>
          </Card.Body>
        </Card>
      </Col>
    ));

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  // You might want more robust error/no data handling here
  if (error) {
      return (
          <Container className="text-center mt-5">
              <Alert variant="danger">{error}</Alert>
          </Container>
      );
  }

  if (!userData) {
       return (
          <Container className="text-center mt-5">
              <Alert variant="info">No user data available.</Alert>
          </Container>
       );
    }


  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h2 className="text-secondary">Welcome!</h2>
          <h2>{userData?.fullName || "Loading User..."}</h2>
          <p>Here is a summary of your account. Have fun!</p>
        </Col>
        <Col md={4} className="text-end">
          <Button as={Link} to="/dashboard/pricing" variant="primary" className="me-2">
            Invest & Earn
          </Button>
          <Button as={Link} to="/dashboard/deposit" variant="success" className="me-2">
            Deposit
          </Button>
          
        </Col>
      </Row>

      {/* Wallet Address Section */}
      <Alert variant="info" className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        {userData?.clientWalletAddress ? (
          <div className="d-flex flex-column flex-md-row align-items-md-center w-100" style={{ gap: '1rem' }}>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <span className="fw-bold">Wallet Address:</span>
              <span className="ms-2">{userData.clientWalletAddress}</span>
            </div>
            <Button
              as={Link}
              to="/dashboard/withdrawal"
              variant="warning"
              className="mt-2 mt-md-0 "
              style={{ whiteSpace: 'nowrap', flexShrink: 0}}
            >
              Withdraw
            </Button>
          </div>
        ) : (
          <span>Add a wallet address to protect your funds further.</span>
        )}
      </Alert>

      {/* Statistics Cards Section */}
      <Row className="mb-4">
        {userData && renderCards()} {/* Only render cards if userData is available */}
      </Row>

      {/* You can add other sections here based on user data, e.g., active investments */}
      {/* Example: */}
      {/* {userData?.activeInvestment && (
          <Card className="mb-4">
              <Card.Header>Active Investment</Card.Header>
              <Card.Body>
                  <p>Plan: {userData.activeInvestment.planName}</p>
                  <p>Amount: {formatCurrency(userData.activeInvestment.amount)}</p>
                  // Add more details as needed
              </Card.Body>
          </Card>
      )} */}

    </Container>
  );

}

// The Main component is typically used to wrap the Dashboard and pass props like userId
// In a real app, userId would likely come from authentication context
const Main = () => {
    // Example: Get userId from localStorage (replace with secure method)
    const userId = localStorage.getItem('userId');

    // You might pass userId and other props to the Dashboard component
    return <Dashboard userId={userId} />;
};

export default Main;
