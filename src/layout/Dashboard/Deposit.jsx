
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';
import { Wallet2, ClipboardCheck, Clipboard, WalletFill } from 'react-bootstrap-icons';

const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number' || isNaN(amount)) return `$0.00`;
  return amount.toLocaleString('en-US', { style: 'currency', currency: currency });
};


const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [chosenCrypto, setChosenCrypto] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [adminSettings, setAdminSettings] = useState(null);
  const [currentWalletAddress, setCurrentWalletAddress] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAdminSettings = async () => {
      setIsLoadingSettings(true);
      setError('');
      try {
        // Fetch from the now public '/view' route
        const response = await fetch(`${API_BASE_URL}/adminSettings/view`);
        if (!response.ok) throw new Error('Failed to load payment information. Please try again later.');
        const data = await response.json();
        const settings = Array.isArray(data) && data.length > 0 ? data[0] : data;
        if (settings) {
          setAdminSettings(settings);
          const firstCrypto = Object.keys(settings).find(key => ['bitcoin', 'ethereum', 'usdt'].includes(key));
          setChosenCrypto(firstCrypto || '');
          setCurrentWalletAddress(firstCrypto ? settings[firstCrypto]?.walletAddress || '' : '');
        } else {
          setError('Admin settings not found.');
          setAdminSettings(null);
        }
      } catch (err) {
        setError(err.message || 'Could not load payment options.');
        setCurrentWalletAddress('');
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchAdminSettings();
  }, []); // Dependency array is correct, token is read inside.

  // Updated useEffect to change wallet address dynamically based on chosenCrypto

  useEffect(() => {
    if (adminSettings && chosenCrypto) {
      setCurrentWalletAddress(adminSettings[chosenCrypto]?.walletAddress || '');
    } else {
      setCurrentWalletAddress('');
    }
  }, [chosenCrypto, adminSettings]);


  const handleConfirm = (e) => {
    e.preventDefault();
    setError('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }
    if (!chosenCrypto) {
      setError('Please select a cryptocurrency.');
      return;
    }
    if (!adminSettings || !adminSettings[chosenCrypto] || !adminSettings[chosenCrypto].walletAddress) {
      setError(`Wallet address for ${chosenCrypto} is not available. Please contact support.`);
      return;
    }
    setShowPaymentDetails(true);
  };

  const copyToClipboard = () => {
    if (currentWalletAddress) {
      navigator.clipboard.writeText(currentWalletAddress).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        setError('Failed to copy wallet address. Please copy it manually.');
      });
    }
  };


  const handlePaymentMade = async () => {
    setError('');
    setCopied(false);
    setIsSubmitting(true);

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const username = loggedInUser?.user?.username || loggedInUser?.username || 'Unknown';

    if (!userId || !token || !loggedInUser) {
      setError('User not authenticated. Cannot submit deposit request.');
      setIsSubmitting(false);
      return;
    }

    try {
      const blockchainDetails = adminSettings[chosenCrypto];
      const depositRecord = {
        userId,
        username: username,
        crypto: chosenCrypto,
        blockchain: blockchainDetails?.blockchain || 'Unknown',
        walletAddress: blockchainDetails?.walletAddress || '',
        paymentMethod: 'crypto',
        amount: parseFloat(amount),
        transactionId: 'USER_WILL_PROVIDE_LATER_OR_VIA_SUPPORT',
        requestDate: new Date().toISOString(),
        status: 'pending',
      };

      console.log('Submitting deposit record:', depositRecord);

      const response = await fetch(`${API_BASE_URL}/depositRequests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(depositRecord),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.message || `Failed to submit deposit request: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('Deposit request successful!');
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

    border: '1px solid rgba(255, 255, 255, 1)',
    overflow: 'hidden' // Ensures inner elements respect border radius
  };

  const inputStyle = { borderRadius: '10px', height: 'calc(2.25rem + 10px)', fontSize: '1rem' };
  const buttonStyle = { borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: '600', transition: 'all 0.3s ease' };

  if (isLoadingSettings) {
    return (
      <Container fluid className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', background: 'white' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="ms-3 fs-5 text-primary">Loading payment options...</p>
      </Container>
    );
  }

  if (!adminSettings && !isLoadingSettings) { // If settings are null after loading (and not due to ongoing loading)
    return (
        <Container fluid className="p-4" style={{ minHeight: '80vh', background: 'white' }}>
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
    <Container fluid className="py-5 px-3" style={{ background: 'white', minHeight: '100vh' }}>
      <Row className="justify-content-center">
        <Col xs={12} md={12} lg={12}>
          <Card style={luxuriousCardStyle}>
            <Card.Header className="bg-transparent border-bottom-0 text-center py-4">
              <Wallet2 size={40} className="mb-2 text-primary" />
              <h2 className="fw-bold text-dark mb-1">Secure Deposit</h2>
              <p className="text-muted">Invest with confidence.</p>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              
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
                      {adminSettings && ['bitcoin', 'ethereum', 'usdt'].map(crypto => (
                        <Form.Check
                          type="radio"
                          key={crypto}
                          id={`crypto-method-${crypto}`}
                          label={
                            <span className="d-flex align-items-center">
                              {crypto.charAt(0).toUpperCase() + crypto.slice(1)}
                              {/* Add blockchain name next to the crypto name */}
                              {adminSettings[crypto] && (
                                <span className="ms-2 text-muted small">
                                  ({adminSettings[crypto].blockchain})
                                </span>
                              )}
                            </span>
                          }
                          name="cryptoGroup"
                          value={crypto}
                          checked={chosenCrypto === crypto}
                          onChange={(e) => setChosenCrypto(e.target.value)}
                          className="mb-2 fs-6" // Added some spacing and font size
                        />
                      ))}
                    </div>
                    {chosenCrypto && (
                        <p className="text-muted mt-2 mb-0">
                            Paying with: {chosenCrypto.charAt(0).toUpperCase() + chosenCrypto.slice(1)}
                        </p>
                    )}
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mt-3"
                    style={{ ...buttonStyle, fontSize: '1.1rem' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    disabled={
                      !chosenCrypto || !currentWalletAddress // Disable if no crypto is chosen or address is missing
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
            alignItems: 'center', justifyContent: 'center', zIndex: 1050
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
                {/* Include Blockchain Name */}
                <h4 className="fw-semibold text-dark mb-3">
                  {chosenCrypto.charAt(0).toUpperCase() + chosenCrypto.slice(1)}
                  {adminSettings[chosenCrypto] && (
                    <span className="ms-2 text-muted small">({adminSettings[chosenCrypto].blockchain})</span>
                  )}
                </h4>
                <div className="mb-3">
                  Amount to Deposit: <strong className="text-success">{formatCurrency(parseFloat(amount))}</strong>
                </div>
                <div className="p-3 mb-3 bg-light-subtle shadow-sm" style={{ borderRadius: '0.5rem', border: '1px solid #e0e0e0' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Wallet Address:</span>
                    {adminSettings[chosenCrypto] && (
                      <span className="badge bg-secondary ms-2" style={{ fontSize: '0.85em' }}>
                        {adminSettings[chosenCrypto].blockchain}
                      </span>
                    )}
                  </div>
                  <InputGroup size="sm" style={{ maxWidth: '300px' }}>
                    <Form.Control
                      type="text"
                      value={currentWalletAddress}
                      readOnly
                      style={{ fontSize: '0.875rem', borderRadius: '0.3rem', height: 'auto', padding: '0.3rem 0.5rem' }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={copyToClipboard}
                      style={{ borderRadius: '0 0.3rem 0.3rem 0' }}
                    >
                      {copied ? <ClipboardCheck size={20} /> : <Clipboard size={20} />}
                    </Button>
                  </InputGroup>
                </div>
                 {/* Add instructions/important notes */}
                 <div className="mb-4">
                  <Alert variant="info" style={{ fontSize: '0.875rem' }}>
                    <ul className="mb-0">
                      <li>
                        Make sure that all payments are made to the above details to avoid loss of funds.
                      </li>
                      {adminSettings[chosenCrypto] && (
                        <li>
                          This is a {adminSettings[chosenCrypto].blockchain} wallet address.
                        </li>
                      )}
                    </ul>
                  </Alert>
                </div>
                {/* Use full width "I Have Made The Payment" Button */}
                <Button
                  variant="primary"
                  onClick={handlePaymentMade}
                  className="w-100" // Make the button full width
                  style={{ ...buttonStyle, fontSize: '1.1rem' }}
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
