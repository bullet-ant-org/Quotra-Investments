import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const gradientCardStyle = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
  border: 'none',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  borderRadius: '2rem',
  padding: '2.5rem 2rem',
};

const balanceBoxStyle = {
  background: 'linear-gradient(90deg, #00c6fb 0%, #005bea 100%)',
  color: '#fff',
  borderRadius: '1rem',
  boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
  padding: '1.5rem 1rem',
  marginBottom: '2rem',
};

const Withdrawal = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchUserData(userId);
    } else {
      setError("User not logged in. Please log in to make a withdrawal.");
      setIsLoadingUser(false);
    }
  }, []);

  const fetchUserData = async (userId) => {
    setIsLoadingUser(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
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
    setSuccessMessage('');

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
      setError("Insufficient funds to process this withdrawal. Your balance is lower than the requested amount.");
      return;
    }

    if (!loggedInUser?.withdrawalAccount) {
      setError("Please add a withdrawal account (wallet address) in your profile settings before requesting a withdrawal.");
      return;
    }

    setShowPasswordModal(true);
    setPasswordError('');
  };

  const handlePasswordConfirm = async () => {
    setPasswordError('');
    if (!inputPassword) {
      setPasswordError("Password is required to confirm withdrawal.");
      return;
    }

    try {
      const userResponse = await fetch(`${API_BASE_URL}/users/${loggedInUser.id}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data for password verification.');
      }
      const fullUserData = await userResponse.json();

      if (fullUserData.password === inputPassword) {
        setShowPasswordModal(false);
        setInputPassword('');
        setSuccessMessage("Password correct. Submitting withdrawal request...");

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withdrawalRecord),
        });

        if (!createRequestRes.ok) {
          throw new Error('Failed to submit withdrawal request. Please try again.');
        }
        // const createdWithdrawal = await createRequestRes.json(); // Data is available if needed locally

        setSuccessMessage(
          `Withdrawal request for $${parseFloat(withdrawalAmount).toFixed(2)} submitted successfully. It is now pending admin approval.`
        );

        setWithdrawalAmount('');
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setPasswordError(err.message || "An error occurred during password verification.");
    }
  };

  const handleModalClose = () => {
    setShowPasswordModal(false);
    setInputPassword('');
    setPasswordError('');
  };

  if (isLoadingUser) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading user data...</p>
      </Container>
    );
  }
  if (error && !loggedInUser) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!loggedInUser) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">Please log in to access the withdrawal page.</Alert>
      </Container>
    );
  }

  if (!loggedInUser.withdrawalAccount) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="info">
          <p>You need to add a withdrawal account (wallet address) before you can request a withdrawal.</p>
          <Button as={Link} to="/dashboard/settings" variant="primary">Add Withdrawal Account</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7} xl={6}>
          <Card style={gradientCardStyle} className="shadow-lg">
            <Card.Header
              as="h4"
              className="text-center bg-white text-primary fw-bold"
              style={{
                borderTopLeftRadius: '2rem',
                borderTopRightRadius: '2rem',
                borderBottom: 'none',
                fontSize: '1.7rem',
                letterSpacing: '0.02em'
              }}
            >
              <i className="fas fa-wallet me-2 align-middle" style={{ fontSize: '28px' }}></i>
              Request Withdrawal
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>
                <i className="fas fa-info-circle me-2"></i>{error}
              </Alert>}
              {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
                <i className="fas fa-check-circle me-2"></i>{successMessage}
              </Alert>}

              {/* Balance Card */}
              <div style={balanceBoxStyle} className="mb-4 text-center">
                <h6 className="mb-1" style={{ color: '#e0e7ef', letterSpacing: '0.04em' }}>
                  <i className="fas fa-dollar-sign me-1" style={{ fontSize: '22px' }}></i>
                  Your Current Balance
                </h6>
                <h2 className="fw-bold m-0" style={{ fontSize: '2.5rem', color: '#fff', textShadow: '0 2px 8px #005bea33' }}>
                  ${currentBalance.toFixed(2)}
                </h2>
              </div>

              <Form onSubmit={handleSubmitWithdrawalRequest}>
                <Form.Group className="mb-3" controlId="withdrawalAmount">
                  <Form.Label className="fw-semibold" style={{ fontSize: '1.1rem' }}>
                    <i className="fas fa-dollar-sign me-2" style={{ fontSize: '20px' }}></i>
                    Amount to Withdraw
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0 text-muted">$</InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="e.g., 50.00"
                      value={withdrawalAmount}
                      onChange={handleAmountChange}
                      required
                      inputMode="decimal"
                      className="border-start-0"
                      style={{ fontSize: '1.2rem', background: '#f8fafc' }}
                    />
                  </InputGroup>
                </Form.Group>

                {/* Display Stored Wallet Address */}
                <Form.Group className="mb-4" controlId="storedWalletAddress">
                  <Form.Label className="fw-semibold" style={{ fontSize: '1.1rem' }}>
                    <i className="far fa-credit-card me-2" style={{ fontSize: '20px' }}></i>
                    Your Withdrawal Account (USDT, TRC20)
                  </Form.Label>
                  <div className="form-control bg-light text-muted" style={{ overflowWrap: 'break-word', fontSize: '1.1rem' }}>
                    {loggedInUser?.withdrawalAccount || 'Not set'}
                  </div>
                  <Form.Text className="text-muted mt-1">
                    This is the address where your funds will be sent.
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg" className="fw-bold" style={{ borderRadius: '1rem', fontSize: '1.2rem' }}>
                    Request Withdrawal
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Confirmation Modal */}
      <Modal show={showPasswordModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-key me-2" style={{ fontSize: '24px' }}></i> Confirm Withdrawal
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>For your security, please enter your account password to confirm this withdrawal request.</p>
          {passwordError && <Alert variant="danger" onClose={() => setPasswordError('')} dismissible>{passwordError}</Alert>}
          <Form.Group controlId="inputPassword">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              autoFocus
              className={passwordError ? 'is-invalid' : ''}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handlePasswordConfirm} className="fw-bold">
            Confirm & Proceed
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Withdrawal;