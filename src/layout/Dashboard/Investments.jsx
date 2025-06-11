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

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.username) {
      setUserName(loggedInUser.username);
    }

    const fetchData = async () => {
      if (!userId) {
        setError("User ID not found. Cannot fetch investments.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all asset orders and all assets
        const [ordersRes, assetsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assetOrders?userId=${userId}`),
          fetch(`${API_BASE_URL}/assets`)
        ]);
        if (!ordersRes.ok) throw new Error('Failed to fetch investments');
        if (!assetsRes.ok) throw new Error('Failed to fetch assets');
        const orders = await ordersRes.json();
        const assets = await assetsRes.json();

        // Map assetId to asset for quick lookup
        const assetMap = {};
        assets.forEach(asset => {
          assetMap[asset.id] = asset;
        });

        // Enrich each investment order
        const enriched = orders.map(order => {
          const asset = assetMap[order.assetId] || {};
          // Parse priceRange as number (use min if range)
          let priceRange = 0;
          if (typeof asset.priceRange === 'string') {
            priceRange = parseFloat(asset.priceRange.split('-')[0]);
          } else if (typeof asset.priceRange === 'number') {
            priceRange = asset.priceRange;
          }
          // Trade duration days
          let tradeDurationDays = Number(asset.tradeDurationDays) || 1;
          // Dates
          const start = parseISO(order.orderDate);
          const now = new Date();
          let elapsedDays = differenceInDays(now, start);
          if (elapsedDays < 0) elapsedDays = 0;
          if (elapsedDays > tradeDurationDays) elapsedDays = tradeDurationDays;
          // Profit calculation
          let profitPotential = Number(asset.profitPotential) || 0;
          let totalProfit = priceRange * (profitPotential / 100);
          let dailyProfit = totalProfit / tradeDurationDays;
          let accruedProfit = +(dailyProfit * elapsedDays).toFixed(2);
          if (accruedProfit > totalProfit) accruedProfit = totalProfit;
          // Time left logic
          let daysLeft = tradeDurationDays - elapsedDays;
          let timeLeft = daysLeft <= 0 ? 'Completed' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;

          return {
            ...order,
            assetName: asset.name || 'N/A',
            invested: priceRange,
            timeLeft,
            accruedProfit,
            totalProfit,
            tradeDurationDays,
            profitPotential,
            priceRange,
          };
        });

        // After enrichment:
        enriched.forEach(async (investment) => {
          if (investment.timeLeft === 'Completed' && !investment.payoutProcessed) {
            // Calculate profit
            const profit = investment.invested * investment.profitPotential;

            // 1. Update user balance
            const userRes = await fetch(`${API_BASE_URL}/users/${userId}`);
            const user = await userRes.json();
            const newBalance = (user.balance || 0) + profit;
            await fetch(`${API_BASE_URL}/users/${userId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ balance: newBalance })
            });

            // 2. Add a payout transaction (to assetOrders or transactions endpoint)
            await fetch(`${API_BASE_URL}/transactions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                type: 'investment_payout',
                amount: profit,
                date: new Date().toISOString(),
                status: 'completed',
                details: `Profit payout for investment in ${investment.assetName}`
              })
            });

            // 3. Optionally, mark this investment as payoutProcessed to avoid duplicate payouts
            // (You can PATCH the assetOrder or keep a local flag)
            await fetch(`${API_BASE_URL}/assetOrders/${investment.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payoutProcessed: true })
            });
          }
        });

        setInvestments(
          enriched
            .filter(inv => inv.timeLeft !== 'Completed')
            .sort((a, b) => (b.timeLeft === 'Active' ? 1 : -1))
        );
      } catch (err) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) return <Container className="text-center mt-5"><Spinner animation="border" /><p>Loading investments...</p></Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container fluid className="p-4">
      <h5 className="mb-2 fw-bold">Welcome, {userName}!</h5>
      <p className="lead mb-4">Track your investments.</p>
      <Row>
        {investments.length > 0 ? (
          investments.map(investment => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))
        ) : (
          <Col>
            <Alert variant="info">You currently have no active or completed investments to display.</Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Investments;