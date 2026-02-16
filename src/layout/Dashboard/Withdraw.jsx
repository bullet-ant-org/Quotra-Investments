import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../utils/api';

const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number' || isNaN(amount)) return `$0.00`;
  return amount.toLocaleString('en-US', { style: 'currency', currency });
};

const luxuriousCardStyle = {
  borderRadius: '20px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 1)',
  overflow: 'hidden',
  boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
};

const inputStyle = { borderRadius: '10px', height: 'calc(2.25rem + 10px)', fontSize: '1rem' };
const buttonStyle = { borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: '600', transition: 'all 0.3s ease' };

const Withdrawal = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchUserData(userId);
    } else {
      addToast("User not logged in. Please log in to make a withdrawal.", 'error');
      setIsLoadingUser(false);
    }
  }, [addToast]);

  const fetchUserData = async (userId) => {
    setIsLoadingUser(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.message || `Failed to fetch user data: ${response.statusText}`;
        if (response.status === 404) {
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
        throw new Error(errorMessage);
      }
      const userData = await response.json();
      setLoggedInUser(userData);
      setCurrentBalance(userData.balance || 0);
    } catch (err) {
      setError("Failed to load user data. Please try again later.");
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setWithdrawalAmount(value);
    }
  };

  const handleSubmitWithdrawalRequest = (e) => {
    e.preventDefault();
    setError('');
    if (!loggedInUser) {
      setError("User not logged in.");
      return;
    }
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }
    if (amount > currentBalance) {
      setError("Insufficient funds. Your balance is lower than the requested amount.");
      return;
    }
    if (!loggedInUser?.withdrawalAccount) {
      setError("Please add a withdrawal account in your settings first.");
      return;
    }
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async () => {
    if (!inputPassword) {
      setError("Password is required to confirm withdrawal.");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      // TODO: This is not secure. The backend should verify the password.
      const userResponse = await fetch(`${API_BASE_URL}/users/${loggedInUser.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data for password verification.');
      }
      const fullUserData = await userResponse.json();
      if (fullUserData.password === inputPassword) {
        setShowPasswordModal(false);
        setInputPassword('');
        setError('');
        addToast("Password correct. Submitting withdrawal request...", 'info');
        const withdrawalRecord = {
          userId: loggedInUser.id,
          username: loggedInUser.username,
          amount: parseFloat(withdrawalAmount),
          walletAddress: fullUserData.withdrawalAccount,
          requestDate: new Date().toISOString(),
          status: 'pending',
        };
        const createRequestRes = await fetch(`${API_BASE_URL}/withdrawalRequests`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(withdrawalRecord),
        });
        if (!createRequestRes.ok) {
          throw new Error('Failed to submit withdrawal request. Please try again.');
        }
        addToast(`Withdrawal request for ${formatCurrency(parseFloat(withdrawalAmount))} submitted successfully.`, 'success');
        setWithdrawalAmount('');
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during password verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowPasswordModal(false);
    setInputPassword('');
    setError('');
  };

  if (isLoadingUser) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', background: 'white' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="ms-3 fs-5 text-primary">Loading your account...</p>
      </Container>
    );
  }

  if (!loggedInUser) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', background: 'white' }}>
        <Alert variant="warning" className="text-center shadow-sm">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>Please log in to access the withdrawal page.</p>
        </Alert>
      </Container>
    );
  }

  if (!loggedInUser.withdrawalAccount) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', background: 'white' }}>
        <Alert variant="info" className="text-center shadow-sm">
          <Alert.Heading>Withdrawal Account Needed</Alert.Heading>
          <p>You need to add a withdrawal account (wallet address) before you can request a withdrawal.</p>
          <Button href="/dashboard/settings" variant="primary" className="rounded-pill px-4 py-2 fw-bold">
            Add Withdrawal Account
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-5 px-3" style={{ background: 'white', minHeight: '100vh' }}>
      <Row className="justify-content-center">
        <Col xs={12} md={12} lg={12}>
          <Card style={luxuriousCardStyle}>
            <Card.Header className="bg-transparent border-bottom-0 text-center py-4">
              <i className="fas fa-wallet mb-2 text-primary" style={{ fontSize: '2.5rem' }}></i>
              <h2 className="fw-bold text-dark mb-1">Secure Withdrawal</h2>
              <p className="text-muted">Withdraw with confidence.</p>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              <div className="mb-4 text-center">
                <h6 className="mb-1 text-secondary" style={{ letterSpacing: '0.04em' }}>
                  <i className="fas fa-dollar-sign me-1" style={{ fontSize: '22px' }}></i>
                  Your Current Balance
                </h6>
                <h2 className="fw-bold m-0" style={{ fontSize: '2.5rem', color: '#005bea', textShadow: '0 2px 8px #005bea33' }}>
                  {formatCurrency(currentBalance)}
                </h2>
              </div>
              <Form onSubmit={handleSubmitWithdrawalRequest}>
                <Form.Group className="mb-4" controlId="withdrawalAmount">
                  <Form.Label className="fw-medium text-dark">Withdrawal Amount (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawalAmount}
                    onChange={handleAmountChange}
                    style={inputStyle}
                    min="0.01"
                    step="0.01"
                    required
                    className="shadow-sm"
                  />
                </Form.Group>
                <Form.Group className="mb-4" controlId="withdrawalAccount">
                  <Form.Label className="fw-medium text-dark">Your Withdrawal Account</Form.Label>
                  <div className="form-control bg-white text-muted" style={{ overflowWrap: 'break-word', fontSize: '1.1rem', borderRadius: '0.75rem' }}>
                    {loggedInUser?.withdrawalAccount || 'Not set'}
                  </div>
                  <Form.Text className="text-muted mt-1">
                    This is the address where your funds will be sent.
                  </Form.Text>
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-3"
                  style={{ ...buttonStyle, fontSize: '1.1rem' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Submitting...</>
                  ) : (
                    "Request Withdrawal"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Confirmation Modal/Overlay Section */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
          <Card style={{ ...luxuriousCardStyle, maxWidth: '400px', width: '100%' }} className="text-center">
            <Card.Header className="bg-transparent border-bottom-0 pt-3 pb-2 px-3">
              <h5 className="text-primary fw-bold mb-0">Confirm Withdrawal</h5>
            </Card.Header>
            <Card.Body className="p-3 p-md-4">
              <Form.Group controlId="inputPassword">
                <Form.Label className="fw-semibold">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  autoFocus
                  style={{ borderRadius: '0.75rem' }}
                  disabled={isSubmitting}
                />
              </Form.Group>
              {error && <Alert variant="danger" className="mt-3" onClose={() => setError('')} dismissible>{error}</Alert>}
              <Button
                variant="success"
                onClick={handlePasswordConfirm}
                className="w-100 mt-3 fw-bold"
                style={{ ...buttonStyle, fontSize: '1.1rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Confirming...</>
                ) : (
                  "Confirm & Proceed"
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleModalClose}
                className="w-100 mt-2"
                style={{ ...buttonStyle, fontSize: '1.1rem' }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default Withdrawal;