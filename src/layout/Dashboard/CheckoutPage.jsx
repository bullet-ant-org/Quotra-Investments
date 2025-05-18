// src/layout/Dashboard/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { Container, Card, Button, Spinner, Alert, Image, Row, Col } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const CheckoutPage = () => {
  const [adminWalletAddress, setAdminWalletAddress] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentType, setPaymentType] = useState(''); // 'investment' or 'loan_application'
  const [itemName, setItemName] = useState(''); // e.g., 'Investment in Gold Plan' or 'Loan Application Fee'
  const [itemDetails, setItemDetails] = useState({}); // To store planId, planName for investments or loanId, loanName for loans
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { planId: planIdFromParams } = useParams(); // Get planId from URL params

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    let paymentDetailsSet = false;

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const userRes = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!userRes.ok) throw new Error('Failed to fetch user data.');
        const data = await userRes.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    // Fetch admin settings (wallet address)
    const fetchAdminSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/adminSettings/globalAdminSettings`);
        if (!response.ok) {
          throw new Error('Failed to fetch admin wallet address.');
        }
        const settings = await response.json();
        setAdminWalletAddress(settings.checkoutWalletAddress || 'Admin wallet not set');
      } catch (err) {
        setError(err.message || 'Could not load admin wallet address.');
        setAdminWalletAddress('Error loading wallet address');
      }
    };

    const loadPaymentDetails = async () => {
      if (location.state && location.state.amount !== undefined) {
        setPaymentAmount(location.state.amount);
        setPaymentType(location.state.type || 'unknown');
        setItemName(location.state.itemName || 'Unknown Item');
        setItemDetails({
          planId: location.state.planId,
          planName: location.state.planName,
          loanId: location.state.loanId,
          loanName: location.state.loanName,
        });
        paymentDetailsSet = true;
      } else if (planIdFromParams) {
        // Fetch plan details using planIdFromParams
        try {
          const planRes = await fetch(`${API_BASE_URL}/assets/${planIdFromParams}`);
          if (!planRes.ok) throw new Error('Failed to fetch plan details for checkout.');
          const planData = await planRes.json();
          
          // Assuming planData.priceRange is a number or can be parsed to one.
          // This might need adjustment based on your actual data structure for price.
          // For simplicity, let's assume priceRange is the amount.
          // If priceRange is like "$100 - $500", you'll need a way to select or input an amount.
          // Or, add a fixed 'amount' field to your asset objects.
          let amountToPay = 0;
          if (typeof planData.priceRange === 'number') {
            amountToPay = planData.priceRange;
          } else if (typeof planData.priceRange === 'string') {
            // Attempt to parse a simple numeric string, e.g., "100"
            const parsedAmount = parseFloat(planData.priceRange.replace(/[^0-9.-]+/g,""));
            if (!isNaN(parsedAmount)) amountToPay = parsedAmount;
            else console.warn("Could not parse priceRange to a number:", planData.priceRange);
          }
          
          setPaymentAmount(amountToPay);
          setPaymentType('investment');
          setItemName(`Investment in ${planData.name || 'Selected Plan'}`);
          setItemDetails({ planId: planData.id, planName: planData.name });
          paymentDetailsSet = true;
        } catch (err) {
          setError(err.message || 'Could not load plan details for checkout.');
        }
      }

      if (!paymentDetailsSet && !planIdFromParams) {
         setError('Checkout details not found. Please select an item or enter an amount.');
      }
    };

    const initializePage = async () => {
      await fetchUserData(); // Fetch user first
      await loadPaymentDetails(); // Then load payment/plan details
      await fetchAdminSettings(); // Then admin settings
      setIsLoading(false); // Set loading to false after all fetches
    };

    initializePage();

  }, [location.state, navigate, planIdFromParams]);


  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    setError(null);

    if (!userData || !userData.id) {
      setError("User data not loaded. Cannot confirm payment.");
      setIsConfirming(false);
      return;
    }

    let updatePayload = {};

    if (paymentType === 'investment') {
      updatePayload = {
        investmentStatus: 'pending_confirmation',
        pendingPlanId: itemDetails.planId,
        pendingPlanName: itemDetails.planName,
        pendingInvestmentAmount: paymentAmount,
        // Optionally, clear current investment if this is a new one
        // currentPlanId: null,
        // currentInvestmentAmount: 0,
        // tradeStartTime: null,
        // accruedProfit: 0,
      };
    } else if (paymentType === 'loan_application') {
      updatePayload = {
        // Add a structure to user data for loan applications
        // This is a simple way; a separate /loanApplications collection would be more robust
        activeLoanApplication: {
          loanId: itemDetails.loanId,
          loanName: itemDetails.loanName,
          applicationFee: paymentAmount,
          status: 'pending_review', // Admin needs to review this
          applicationDate: new Date().toISOString(),
          feePaid: true,
        },
        // Optionally, you might want to log this in a transaction history if you have one
      };
    } else {
      setError("Invalid payment type. Cannot confirm.");
      setIsConfirming(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to update user status after payment confirmation.`);
      }

      alert(`Your payment for "${itemName}" has been marked as confirmed and is pending admin approval/review.`);
      navigate('/dashboard'); // Redirect to dashboard or a success page
    } catch (err) {
      setError(err.message || 'An error occurred while confirming payment.');
      console.error("Payment confirmation error:", err);
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
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="shadow-lg">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              Complete Your Payment
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

              <div className="text-center mb-4">
                <p className="fs-5">You are paying for:</p>
                <h3 className="text-info">{itemName || 'N/A'}</h3>
                <p className="display-6 fw-bold text-success">
                  Amount: ${paymentAmount ? paymentAmount.toFixed(2) : '0.00'}
                </p>
              </div>

              <Card className="mb-4 bg-light border">
                <Card.Body>
                  <Card.Title className="text-center mb-3">Payment Instructions</Card.Title>
                  <p className="text-center">
                    Please send the exact amount to the following wallet address:
                  </p>
                  <p className="text-center lead fw-bold text-break bg-white p-3 rounded border text-dark">
                    {adminWalletAddress || 'Loading wallet address...'}
                  </p>
                  <Alert variant="warning" className="mt-2 text-center small">
                    <i className="fas fa-exclamation-triangle me-1"></i><strong>Important:</strong> This is a USDT (TRC20) wallet. Any transfer to another blockchain cannot be processed.
                  </Alert>
                  <Alert variant="info" className="mt-3 text-center">
                    After making the payment, click the "Confirm Payment" button below.
                    Your transaction will be verified by an admin.
                  </Alert>
                </Card.Body>
              </Card>

              <div className="d-grid">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleConfirmPayment}
                  disabled={isConfirming || !userData || error || !adminWalletAddress || adminWalletAddress === 'Error loading wallet address' || adminWalletAddress === 'Admin wallet not set'}
                >
                  {isConfirming ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}Confirming...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted text-center small py-3">
              Please ensure all details are correct before confirming. Payments are typically processed within 24 hours.
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
