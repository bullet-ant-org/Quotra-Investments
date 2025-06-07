import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import {
  API_BASE_URL,
  // Removed EMAILJS related imports as they are no longer used here
} from '../../utils/api'; // Combined imports
import { Wallet2, ClipboardCheck, Clipboard, ArrowLeft, WalletFill } from 'react-bootstrap-icons'; // Added WalletFill

const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number' || isNaN(amount)) return `$0.00`;
  return amount.toLocaleString('en-US', { style: 'currency', currency: currency });
};

const Deposit = () => {
  const [amount, setAmount] = useState('');
  // New state for the high-level payment system choice
  const [chosenPaymentSystem, setChosenPaymentSystem] = useState('crypto'); // Default to 'crypto' as others are disabled
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  
  const [adminSettings, setAdminSettings] = useState(null);
  const [currentWalletAddress, setCurrentWalletAddress] = useState('');
  
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAdminSettings = async () => {
      setIsLoadingSettings(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/adminSettings`);
        if (!response.ok) throw new Error('Failed to load payment information. Please try again later.');
        const data = await response.json();
        // Assuming data is the settings object directly, or the first element if it's an array
        const settings = Array.isArray(data) && data.length > 0 ? data[0] : data;
        setAdminSettings(settings);
        // Directly set the wallet address, assuming it's a string
        setCurrentWalletAddress(settings?.checkoutWalletAddress || '');
      } catch (err) {
        setError(err.message || 'Could not load payment options.');
        setCurrentWalletAddress(''); // Ensure it's cleared on error
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchAdminSettings();
  }, []);

  const handleConfirm = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }
    // Check chosen payment system
    if (chosenPaymentSystem !== 'crypto') {
        setError('Please select Crypto as the payment method. Other methods are currently unavailable.');
        return;
    }
    if (!currentWalletAddress) {
      setError('Wallet address for the selected crypto is not available. Please contact support.');
      return;
    }
    setShowPaymentDetails(true);
  };

  const copyToClipboard = () => {
    if (!currentWalletAddress) return;
    navigator.clipboard.writeText(currentWalletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setError('Failed to copy wallet address. Please copy it manually.');
    });
  };

  const handlePaymentMade = async () => {
    setError('');
    setCopied(false);
    setIsSubmitting(true);

    const loggedInUserString = localStorage.getItem('loggedInUser');
    const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : null;

    if (!loggedInUser || !loggedInUser.id) {
      setError("User not logged in. Cannot submit deposit request.");
      setIsSubmitting(false); 
      return;
    }

    try {
      const depositRecord = {
        userId: loggedInUser.id,
        username: loggedInUser.username,
        amount: parseFloat(amount),
        paymentMethod: 'crypto', // Since we have one address, method is generically 'crypto'
        transactionId: 'USER_WILL_PROVIDE_LATER_OR_VIA_SUPPORT', // Placeholder, ideally user provides this
        requestDate: new Date().toISOString(),
        status: 'pending',
      };

      const response = await fetch(`${API_BASE_URL}/depositRequests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositRecord),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.message || `Failed to submit deposit request: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      // const createdDeposit = await response.json(); // Data is available if needed locally

      setSuccessMessage('Deposit request submitted successfully! It will be reviewed by an admin shortly.');
      // Email sending logic removed from this component.

      setShowPaymentDetails(false);
      setAmount('');

    } catch (err) {
      console.error('Error submitting deposit request:', err);
      setError(err.message || 'An error occurred while submitting your deposit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom styles
  const luxuriousCardStyle = {
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden' // Ensures inner elements respect border radius
  };

  const inputStyle = { borderRadius: '10px', height: 'calc(2.25rem + 10px)', fontSize: '1rem' };
  const buttonStyle = { borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: '600', transition: 'all 0.3s ease' };

  if (isLoadingSettings) {
    return (
      <Container fluid className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="ms-3 fs-5 text-primary">Loading payment options...</p>
      </Container>
    );
  }

  if (!adminSettings && !isLoadingSettings) { // If settings are null after loading (and not due to ongoing loading)
    return (
        <Container fluid className="p-4" style={{ minHeight: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <Alert.Heading>Payment Gateway Error</Alert.Heading>
                        <p>{error || "Payment options could not be loaded at this time. Please try again later or contact support."}</p>
                    </Alert>
                </Col>
            </Row>
        </Container>
    );
}

  return (
    <Container fluid className="py-5 px-3" style={{ background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', minHeight: '100vh' }}>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card style={luxuriousCardStyle}>
            <Card.Header className="bg-transparent border-bottom-0 text-center py-4">
              <Wallet2 size={40} className="mb-2 text-primary" />
              <h2 className="fw-bold text-dark mb-1">Secure Deposit</h2>
              <p className="text-muted">Invest with confidence.</p>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
              
              {!showPaymentDetails ? (
                <Form onSubmit={handleConfirm}>
                  <Form.Group className="mb-4" controlId="depositAmount">
                    <Form.Label className="fw-medium text-dark">Deposit Amount (USD)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={inputStyle}
                      min="0.01"
                      step="0.01"
                      required
                      className="shadow-sm"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="paymentSystem">
                    <Form.Label className="fw-medium text-dark">Select Payment Method</Form.Label>
                    <div className="mt-2">
                      {['Paypal', 'Stripe', 'Crypto'].map((method) => (
                        <Form.Check
                          type="radio"
                          key={method}
                          id={`payment-method-${method.toLowerCase()}`}
                          label={method}
                          name="paymentSystemGroup"
                          value={method.toLowerCase()}
                          checked={chosenPaymentSystem === method.toLowerCase()}
                          onChange={(e) => setChosenPaymentSystem(e.target.value)}
                          disabled={method !== 'Crypto'}
                          className="mb-2 fs-6"
                        />
                      ))}
                    </div>
                    {chosenPaymentSystem === 'crypto' && currentWalletAddress && (
                        <p className="text-muted mt-2 mb-0 small">
                            Paying with: Crypto
                        </p>
                    )}
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mt-3"
                    style={{...buttonStyle, fontSize: '1.1rem'}}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    disabled={
                      isLoadingSettings || 
                      chosenPaymentSystem !== 'crypto' || 
                      !currentWalletAddress // Ensure the wallet address is loaded
                    }
                  >
                    Proceed to Payment
                  </Button>
                </Form>
              ) : null}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Details Modal/Overlay Section */}
      {showPaymentDetails && (
        <>
          {/* Using a fixed overlay for a modal-like experience */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem'
          }}>
            <Card style={{...luxuriousCardStyle, maxWidth: '550px', width: '100%'}} className="text-center">
              {/* New Header: "Deposit Checkout" to the right */}
              <Card.Header className="bg-transparent border-bottom-0 pt-3 pb-2 px-3 d-flex justify-content-end align-items-center">
                <div> {/* Container for right-aligned content */}
                  <h5 className="text-primary fw-bold mb-0">Deposit Checkout</h5>
                </div>
              </Card.Header>

              <Card.Body className="p-3 p-md-4">
                {/* Filled Wallet Icon */}
                <div className="text-center mb-3">
                  <WalletFill size={40} className="text-primary" />
                </div>

                <h4 className="fw-semibold text-dark mb-3">Payment Details</h4>

                {/* Amount to Deposit */}
                <div className="text-start mb-2">
                  <p className="mb-1 text-dark">
                    Amount to Deposit: <strong className="text-success">{formatCurrency(parseFloat(amount))}</strong>
                  </p>
                </div>

                {/* Payment Account Label */}
                <div className="text-start mb-1">
                  <p className="mb-1 text-dark">
                    Payment Account : Crypto
                  </p>
                </div>

                {/* Wallet Address Container */}
                <div 
                  className="p-3 mb-2 bg-light-subtle shadow-sm" 
                  style={{ borderRadius: '0.5rem', border: '1px solid #e0e0e0', wordBreak: 'break-all' }}
                >
                  <strong className="text-dark" style={{ fontSize: '0.95rem' }}>{currentWalletAddress}</strong>
                </div>

                {/* Copy Button */}
                <div className="text-start mb-3">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={copyToClipboard}
                    style={{ borderRadius: '0.3rem', backgroundColor: '#0d6efd', borderColor: '#0d6efd' }} // Explicit blue
                  >
                    {copied ? <><ClipboardCheck className="me-1" /> Copied!</> : <><Clipboard className="me-1" /> Copy</>}
                  </Button>
                </div>

                {/* Warning Text */}
                <div className="text-start mb-4">
                  <p className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                    <strong>Important:</strong> This is a Usdt, TRC20 wallet Address.
                    Make sure that all payments are made to the above details to avoid loss of funds.
                    Click the wallet address field or the 'Copy' button to copy the address.
                  </p>
                </div>

                {/* "I Have Made The Payment" Button */}
                <Button
                  variant="primary" // Your special blue
                  onClick={handlePaymentMade}
                  className="w-100" // Full width
                  style={{...buttonStyle, fontSize: '1.1rem', backgroundColor: '#0d6efd', borderColor: '#0d6efd'}} // Explicit blue
                  disabled={isSubmitting}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isSubmitting ? (
                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Submitting...</>
                  ) : (
                    "I Have Made The Payment"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </div>
        </>
      )}
    </Container>
  );
};

export default Deposit;
