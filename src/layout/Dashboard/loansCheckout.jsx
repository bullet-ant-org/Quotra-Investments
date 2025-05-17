// src/layout/Dashboard/LoansCheckout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const LoansCheckout = () => {
  const [applicationFee, setApplicationFee] = useState(null);
  const [loanDetails, setLoanDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.loan) {
      setLoanDetails(location.state.loan);
    } else {
      setError('Loan details not found. Please select a loan to apply for.');
      setIsLoading(false);
      // Optionally navigate back or show a more prominent error
      // navigate('/dashboard/loans');
      return;
    }

    const fetchAdminSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/adminSettings/globalAdminSettings`);
        if (!response.ok) {
          throw new Error('Failed to fetch application fee settings.');
        }
        const settings = await response.json();
        if (settings && typeof settings.loanApplicationFee === 'number') {
          setApplicationFee(settings.loanApplicationFee);
        } else {
          throw new Error('Loan application fee is not configured by the admin.');
        }
      } catch (err) {
        setError(err.message || 'Could not load application fee.');
        console.error("Error fetching admin settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminSettings();
  }, [location.state]);

  const handleProceedToPayment = () => {
    if (applicationFee === null || !loanDetails) {
      setError("Cannot proceed to payment. Application fee or loan details are missing.");
      return;
    }
    navigate('/dashboard/checkout', {
      state: {
        amount: applicationFee,
        type: 'loan_application', // To identify the payment type on CheckoutPage
        itemName: `Application Fee for ${loanDetails.name}`, // Descriptive name
        loanId: loanDetails.id, // Pass loan ID for reference
        loanName: loanDetails.name, // Pass loan name for reference
      },
    });
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading checkout details...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              Loan Application Checkout
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              {loanDetails && (
                <div className="mb-4">
                  <h5>Applying for Loan:</h5>
                  <p className="fs-5"><strong>{loanDetails.name}</strong></p>
                  {loanDetails.interestRate && <p className="mb-1"><small>Interest Rate: {loanDetails.interestRate}</small></p>}
                  {loanDetails.term && <p className="mb-1"><small>Term: {loanDetails.term}</small></p>}
                </div>
              )}

              {applicationFee !== null && !error && (
                <div className="mb-4">
                  <h5>Application Fee:</h5>
                  <p className="fs-3 fw-bold text-success">
                    ${applicationFee.toFixed(2)}
                  </p>
                  <p className="text-muted">
                    A one-time non-refundable fee is required to process your loan application.
                  </p>
                </div>
              )}

              {!error && applicationFee !== null && loanDetails && (
                <div className="d-grid">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Pay Application Fee
                  </Button>
                </div>
              )}
              {(!loanDetails || applicationFee === null) && !isLoading && !error && (
                <Alert variant="warning">
                  Checkout details could not be fully loaded. Please try again or contact support.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoansCheckout;
