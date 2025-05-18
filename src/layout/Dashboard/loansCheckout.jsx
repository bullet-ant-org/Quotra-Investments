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
      // Set application fee from the passed loan object
      if (typeof location.state.loan.applicationFee === 'number') {
        setApplicationFee(location.state.loan.applicationFee);
      } else {
        // Fallback or error if applicationFee is not defined on the loan object
        setError('Application fee for this loan is not configured. Please contact support.');
        console.warn("Loan object passed to LoansCheckout does not have a numeric applicationFee:", location.state.loan);
      }
      setIsLoading(false); // Loan details and fee are set (or error is set)
    } else {
      setError('Loan details not found. Please select a loan to apply for.');
      setIsLoading(false);
      return;
    }

    // Display the alert when the component mounts
    // Moved the alert to only show if we successfully have loan details and an application fee
    if (location.state && location.state.loan && typeof location.state.loan.applicationFee === 'number') {
      window.alert(
        "Important: The payment on the next page will be to a USDT (TRC20) wallet. " +
        "Any transfer to another blockchain cannot be processed or verified."
      );
    }
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
