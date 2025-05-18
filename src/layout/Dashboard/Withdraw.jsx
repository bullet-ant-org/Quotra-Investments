import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Modal } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Import the API base URL

const Withdrawal = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState(''); // Error specific to password modal

  useEffect(() => {
    const userString = localStorage.getItem('loggedInUser');
    if (userString) {
      const user = JSON.parse(userString);
      setLoggedInUser(user);
      // Simulate fetching/setting balance and wallet address
      // In a real app, this might come from user object or a separate API call
      setCurrentBalance(user.balance || 1000.00); // Example: default to 1000 if no balance
      setWalletAddress(user.walletAddress || ''); // Pre-fill from user settings if available

      // Fetch user data from the API using the user ID
      fetchUserData(user.id);
    } else {
      setError("User not logged in. Please log in to make a withdrawal.");
    }
  }, []);

    const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`); // Replace with your actual user endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setCurrentBalance(userData.totalBalance || 0); // Update with data from JSON server
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError("Failed to load user data. Please try again later."); // More specific error
    }
  };
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point for currency
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
    
    if (!walletAddress.trim()) {
        setError("Please enter your wallet address.");
        return;
    }

    // If all checks pass, show password modal
    setShowPasswordModal(true);
    setPasswordError(''); 
  };

  const handlePasswordConfirm = async () => {
    setPasswordError('');
    if (!inputPassword) {
      setPasswordError("Password is required to confirm withdrawal.");
      return;
    }

    // --- Password Verification & Withdrawal ---
    try {
      // 1. Fetch the full user data again to get the stored password
      //    THIS IS NOT SECURE FOR PRODUCTION. In production, send `inputPassword`
      //    to a backend endpoint for verification.
      const userResponse = await fetch(`${API_BASE_URL}/users/${loggedInUser.id}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data for password verification.');
      }
      const fullUserData = await userResponse.json();

      // 2. Compare the input password with the stored password
      //    Assuming 'password' field exists in your user object in db.json
      if (fullUserData.password === inputPassword) {
        setShowPasswordModal(false);
        setInputPassword('');
        setSuccessMessage("Password correct. Processing withdrawal request...");

        // 3. Create a withdrawal request entry (if your admin panel uses it)
        // This is an example, adjust payload as needed for your /withdrawalRequests endpoint
        const withdrawalRecord = {
          userId: loggedInUser.id,
          username: loggedInUser.username, // Or fullUserData.username
          amount: parseFloat(withdrawalAmount),
          walletAddress: walletAddress,
          requestDate: new Date().toISOString(),
          status: 'pending', // Admin will confirm this
        };

        const createRequestRes = await fetch(`${API_BASE_URL}/withdrawals`, { // Changed endpoint to /withdrawals
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(withdrawalRecord),
        });

        if (!createRequestRes.ok) {
            throw new Error('Failed to submit withdrawal request. Please try again.');
        }

        // No balance update here on the client-side directly.
        // The admin will confirm and the balance will be updated then.
        setSuccessMessage(
          `Withdrawal request for $${parseFloat(withdrawalAmount).toFixed(2)} submitted successfully. It is now pending admin approval.`
        );
        setWithdrawalAmount('');
        // Optionally clear walletAddress or keep it based on UX preference
        // setWalletAddress('');
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setPasswordError(err.message || "An error occurred during password verification.");
      console.error("Password confirmation error:", err);
    }
  };

  const handleModalClose = () => {
    setShowPasswordModal(false);
    setInputPassword('');
    setPasswordError('');
  }

  if (!loggedInUser && !error) {
    // This state is brief, usually before useEffect runs or if localStorage is slow
    return (
      <Container className="mt-5 text-center">
        <p>Loading user data or checking login status...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7} xl={6}>
          <Card className="shadow-lg" style={{ borderRadius: '15px' }}>
            <Card.Header as="h4" className="text-center bg-primary text-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <i className="fas fa-wallet me-2 align-middle" style={{ fontSize: '28px' }}></i> Request Withdrawal
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible><i className="fas fa-info-circle me-2"></i>{error}</Alert>}
              {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible><i className="fas fa-info-circle me-2"></i>{successMessage}</Alert>}

              <div className="mb-4 p-3 border rounded bg-light text-center shadow-sm cardeeta">
                <h6 className="text-light mb-1">
                  <i className="fas fa-dollar-sign me-1" style={{ fontSize: '22px' }}></i> Your Current Balance
                </h6>
                <h3 className="fw-bold text-success m-0">${currentBalance.toFixed(2)}</h3>
              </div>

              <Form onSubmit={handleSubmitWithdrawalRequest}>
                <Form.Group className="mb-3" controlId="withdrawalAmount">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-dollar-sign me-2" style={{ fontSize: '20px' }}></i>Amount to Withdraw
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
                      className="border-start-0 text-light"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4" controlId="walletAddress">
                  <Form.Label className="fw-semibold">
                    <i className="far fa-credit-card me-2" style={{ fontSize: '20px' }}></i>Destination Wallet Address
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your crypto wallet address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    required
                  />
                  <Form.Text className="text-warning mt-1">
                    <i className="fas fa-exclamation-triangle me-1"></i>Make sure it is a USDT, TRC20 wallet.
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg" className="fw-bold">
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