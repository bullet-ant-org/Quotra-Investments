// src/layout/Dashboard/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const cardStyle = {
  background: '#fff',
  border: 'none',
  boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
  borderRadius: '1.5rem',
  padding: '2rem 1.5rem',
};
const buttonStyle = {
  height: '3.2rem',
  fontSize: '1.1rem',
  borderRadius: '0.5rem'
};

const CheckoutPage = () => {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [itemDetails, setItemDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { planId: planIdFromParams } = useParams();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data
        const userRes = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!userRes.ok) throw new Error('Failed to fetch user data.');
        const user = await userRes.json();
        setUserData(user);

        // Fetch asset details
        const planRes = await fetch(`${API_BASE_URL}/assets/${planIdFromParams}`);
        if (!planRes.ok) throw new Error('Failed to fetch asset details.');
        const asset = await planRes.json();

        let amountToPay = 0;
        if (typeof asset.priceRange === 'number') {
          amountToPay = asset.priceRange;
        } else if (typeof asset.priceRange === 'string') {
          const min = asset.priceRange.split('-')[0];
          const parsedAmount = parseFloat(min.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(parsedAmount)) amountToPay = parsedAmount;
        }

        setPaymentAmount(amountToPay);
        setItemDetails(asset);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, planIdFromParams]);

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    setError('');
    setSuccess('');

    if (!userData || !userData.id) {
      setError("User data not loaded. Cannot confirm payment.");
      setIsConfirming(false);
      return;
    }

    if (userData.balance < paymentAmount) {
      setError('Insufficient balance for this investment.');
      setIsConfirming(false);
      return;
    }

    const newBalance = userData.balance - paymentAmount;
    const order = {
      orderId: `ord_${Math.random().toString(36).substr(2, 6)}`,
      userId: userData.id,
      assetId: itemDetails.id,
      orderDate: new Date().toISOString(),
      status: 'approved',
      priceAtOrder: paymentAmount,
      invitedByUserId: null,
      editorDiscountApplied: false
    };

    try {
      // Update user balance
      await fetch(`${API_BASE_URL}/users/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
      });

      // Create asset order
      await fetch(`${API_BASE_URL}/assetOrders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      setSuccess('Investment successful!');
      setUserData({ ...userData, balance: newBalance });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('Failed to process investment.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading checkout information...</p>
      </Container>
    );
  }

  return (
    <Container className="p-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card style={cardStyle}>
            <Card.Body>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              {success && <Alert variant="success" className="mb-3">{success}</Alert>}

              <div className="mb-4">
                <h4 className="fw-bold mb-2">{itemDetails.name || 'Asset Details'}</h4>
                <div className="mb-2">
                  <strong>Minimum Investment:</strong> ${paymentAmount ? paymentAmount.toFixed(2) : '0.00'}
                </div>
                {itemDetails.profitPotential && (
                  <div className="mb-2">
                    <strong>Profit Potential:</strong> {itemDetails.profitPotential}
                  </div>
                )}
                {itemDetails.period && (
                  <div className="mb-2">
                    <strong>Period:</strong> {itemDetails.period}
                  </div>
                )}
                {itemDetails.features && Array.isArray(itemDetails.features) && itemDetails.features.length > 0 && (
                  <div className="mb-2">
                    <strong>Features:</strong>
                    <ul className="mb-0">
                      {itemDetails.features.map((f, idx) => (
                        <li key={idx}>{f.text}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3">
                  <strong>Your Balance:</strong> ${userData?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <Alert variant="info" className="text-center mb-4">
                Do you want to purchase this asset?
              </Alert>

              <div className="d-grid">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleConfirmPayment}
                  disabled={isConfirming || !userData || error}
                  style={buttonStyle}
                >
                  {isConfirming ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}Processing...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
