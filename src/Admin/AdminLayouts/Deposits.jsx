import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { API_BASE_URL } from '../../utils/api';
import { sendTransactionEmail } from '../../utils/emailHelper'; // Import the new helper

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const statusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

const Deposits = () => {
  const { addToast } = useToast();
  const [deposits, setDeposits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [usersMap, setUsersMap] = useState({});

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess('');
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authorization token found. Please log in again.');

      // Fetch all users for mapping userId to username/email (admin-only endpoint)
      const usersRes = await fetch(`${API_BASE_URL}/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      const users = await usersRes.json();
      const usersMapTemp = {};
      users.forEach(u => {
        usersMapTemp[u.id] = { username: u.username, email: u.email };
      });
      setUsersMap(usersMapTemp);

      // Fetch all deposit requests (admin-only endpoint)
      const depositsRes = await fetch(`${API_BASE_URL}/depositRequests/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!depositsRes.ok) throw new Error('Failed to fetch deposit requests');
      const depositsData = await depositsRes.json();

      // Sort by date, most recent first
      const sorted = depositsData.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      setDeposits(sorted);
    } catch (err) {
      setError(err.message || 'An unknown error occurred while fetching deposits.');
      setDeposits([]);
      addToast('Error fetching deposits.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleApprove = async (deposit) => {
    if (!window.confirm(`Approve deposit of $${deposit.amount} for ${usersMap[deposit.userId]?.username || deposit.userId}?`)) return;
    setConfirmingId(deposit.id);
    setError('');
    setSuccess('');
    const userEmail = usersMap[deposit.userId]?.email;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authorization token found. Please log in again.');

      // 1. Update deposit status (admin-only)
      const res = await fetch(`${API_BASE_URL}/depositRequests/${deposit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      if (!res.ok) throw new Error('Failed to approve deposit.');

      // 2. Update user balance (admin-only)
      const userRes = await fetch(`${API_BASE_URL}/users/${deposit.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error('Failed to fetch user for balance update.');
      const user = await userRes.json();
      const newBalance = (user.balance || 0) + parseFloat(deposit.amount);
      const balRes = await fetch(`${API_BASE_URL}/users/${deposit.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ balance: newBalance }),
      });
      if (!balRes.ok) throw new Error('Failed to update user balance.');

      // 3. Send confirmation email using the new helper
      if (userEmail) {
          await sendTransactionEmail({
              recipient_email: userEmail,
              recipient_name: usersMap[deposit.userId]?.username || 'Client',
              transaction_type: 'Deposit',
              transaction_amount: formatCurrency(parseFloat(deposit.amount)),
              transaction_date: deposit.requestDate ? format(new Date(deposit.requestDate), 'MMM dd, yyyy, p') : 'N/A',
              transaction_ref: deposit.id, // Using deposit ID as reference
              payment_method: deposit.paymentMethod || 'N/A',
          });
      }

      setSuccess(`Deposit for ${usersMap[deposit.userId]?.username || deposit.userId} approved and balance updated.`);
      addToast('Deposit approved!', 'success');
      fetchDeposits();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setConfirmingId(null);
    }
  };
  // Removed the old sendDepositReceiptEmail function

  const handleCancel = async (deposit) => {
    if (!window.confirm(`Cancel deposit of $${deposit.amount} for ${usersMap[deposit.userId]?.username || deposit.userId}?`)) return;
    setConfirmingId(deposit.id);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authorization token found. Please log in again.');
      const res = await fetch(`${API_BASE_URL}/depositRequests/${deposit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel deposit.');
      setSuccess(`Deposit for ${usersMap[deposit.userId]?.username || deposit.userId} cancelled.`);
      addToast('Deposit cancelled.', 'success');
      fetchDeposits();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h4 className="mb-4 fw-bold text-primary">Deposit Requests</h4>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        </Col>
      </Row>
      {isLoading ? (
        <Row>
          <Col className="text-center my-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading deposit requests...</p>
          </Col>
        </Row>
      ) : deposits.length === 0 ? (
        <Row>
          <Col>
            <Alert variant="info">No deposit requests found.</Alert>
          </Col>
        </Row>
      ) : (
        <Row xs={1} md={2} lg={2} xl={3} className="g-4">
          {deposits.map((dep) => (
            <Col key={dep.id}>
              <Card
                className="shadow-lg border-0 h-100"
                style={{
                  borderRadius: '1.5rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
                  minHeight: '420px', // Increased height
                  minWidth: '340px',  // Increased width for more button space
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <Badge bg={statusColor(dep.status)} className="px-3 py-2 text-uppercase fs-6 shadow-sm" style={{ letterSpacing: '0.08em', borderRadius: '1rem' }}>
                      {dep.status}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <span className="fw-bold text-primary" style={{ fontSize: '1.5rem' }}>
                      {formatCurrency(dep.amount)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">User:</span>
                    <span className="fw-semibold ms-2">{usersMap[dep.userId]?.username || dep.userId}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Email:</span>
                    <span className="fw-semibold ms-2">{usersMap[dep.userId]?.email || 'N/A'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Payment Method:</span>
                    <span className="fw-semibold ms-2">{dep.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Date:</span>
                    <span className="fw-semibold ms-2">
                      {dep.requestDate ? format(new Date(dep.requestDate), 'MMM dd, yyyy, p') : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    {dep.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="fw-bold flex-fill"
                          onClick={() => handleApprove(dep)}
                          disabled={confirmingId === dep.id}
                          style={{ borderRadius: '0.8rem', fontSize: '1.1rem', minWidth: 110 }}
                        >
                          {confirmingId === dep.id ? <Spinner as="span" animation="border" size="sm" /> : 'Approve'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="fw-bold flex-fill"
                          onClick={() => handleCancel(dep)}
                          disabled={confirmingId === dep.id}
                          style={{ borderRadius: '0.8rem', fontSize: '1.1rem', minWidth: 110 }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Deposits;