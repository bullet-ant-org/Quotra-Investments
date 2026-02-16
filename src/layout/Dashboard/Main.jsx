// src/layout/Dashboard/Main.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faArrowUp, faArrowDown, faCoins, faChartLine, faPiggyBank } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../utils/api'; // Import API_BASE_URL

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not authenticated. Please log in.');
        setIsLoading(false);
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not available.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      try {
        // Fetch user data, deposit requests, and withdrawal requests in parallel
        const [userRes, depositRequestsRes, withdrawalRequestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/profile`, { headers }),
          fetch(`${API_BASE_URL}/depositRequests?status=confirmed`, { headers }),
          fetch(`${API_BASE_URL}/withdrawalRequests?status=confirmed`, { headers })
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
          fullName: userData.fullName || userData.username || 'User',
          clientWalletAddress: userData.withdrawalAccount || null,
          availableBalance: userData.balance || 0,
          allTimeAvailableBalance: userData.balance || 0, // Using balance as totalIncome is not available
          totalDeposit: totalConfirmedDeposits,
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
  }, []); // Run once on mount

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

  const renderCards = () =>
    cardData.map((card, index) => (
      <Col key={index} md={4} className='mb-3 mb-lg-0'>
        <Card className={`h-100 home-cards`}>
          <Card.Body>
            <Card.Title>{card.title}</Card.Title>
            {/* For Deposit/Withdrawal, the main value is 'Last', and 'All Time' is the total */}
            <Card.Text className="fw-bold fs-2">
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
          <Button as={Link} to="/dashboard/pricing" className="me-2 totobutton">
            Invest & Earn
          </Button>
          <Button as={Link} to="/dashboard/deposit" className="me-2 button-green">
            Deposit
          </Button>
          
        </Col>
      </Row>

      

      {/* Statistics Cards Section */}
      <Row className="mb-4">
        {userData && renderCards()} {/* Only render cards if userData is available */}
      </Row>



    </Container>
  );

}

export default Dashboard;
