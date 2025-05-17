import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { Container, Card, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap'; // Added Form, Container, Row, Col
import { API_BASE_URL } from '../../utils/api'; // Import API_BASE_URL

const Checkout = () => {
  // This component will now be an input page for custom investment amounts.
  // It will then navigate to the main CheckoutPage.jsx (which is likely routed at /dashboard/checkout)

  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // To check if any state was passed to this route

  useEffect(() => {
    // This component is now an input page.
    // If it receives state (e.g. from PricingPage or LoansCheckout),
    // it should ideally redirect to the actual payment page.
    // However, the request is to make THIS page an input form.
    // So, we'll assume if someone lands here directly, they want to input a custom amount.
    // The existing CheckoutPage.jsx (with QR code) will handle pre-filled amounts.

    // If this page was meant to be a gateway that also handles pre-filled amounts,
    // the logic would be more complex here to check location.state and redirect.
    // For now, focusing on making it an input page as requested.
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setInvestmentAmount(value);
    }
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const amount = parseFloat(investmentAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid investment amount greater than zero.');
      return;
    }

    setIsSubmitting(true);

    // Navigate to the main CheckoutPage.jsx (assuming it's routed at /dashboard/checkout)
    // The main CheckoutPage.jsx will handle fetching the admin wallet and displaying payment details.
    navigate('/dashboard/checkout', { // Or your designated route for CheckoutPage.jsx
      state: {
        amount: amount,
        type: 'custom_investment',
        itemName: 'Custom Investment',
        // You can add more details if needed, e.g., a description or reference
      },
    });
    // No need to setIsSubmitting(false) here as we are navigating away.
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg">
            <Card.Header as="h4" className="text-center bg-info text-white">
              Enter Investment Amount
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-center mb-4">
                Please specify the amount you would like to invest.
              </p>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="investmentAmount">
                  <Form.Label>Investment Amount (USD)</Form.Label>
                  <Form.Control
                    type="text" // Use text to allow custom validation for numbers/decimals
                    placeholder="e.g., 500.00"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    required
                    className="text-center fs-4"
                    inputMode="decimal" // Helps mobile keyboards
                  />
                </Form.Group>
                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        {' '}Processing...
                      </>
                    ) : (
                      'Proceed to Payment Details'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-muted text-center small py-3">
              You will be directed to the payment page after entering the amount.
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;