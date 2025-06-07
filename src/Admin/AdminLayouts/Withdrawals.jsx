// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\WithdrawalRequests.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [usersMap, setUsersMap] = useState({});

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess('');
    try {
      // Fetch all users for mapping userId to username/email
      const usersRes = await fetch(`${API_BASE_URL}/users`);
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      const users = await usersRes.json();
      const usersMapTemp = {};
      users.forEach(u => {
        usersMapTemp[u.id] = { username: u.username, email: u.email };
      });
      setUsersMap(usersMapTemp);

      // Fetch all withdrawal requests
      const withdrawalsRes = await fetch(`${API_BASE_URL}/withdrawalRequests`);
      if (!withdrawalsRes.ok) throw new Error('Failed to fetch withdrawal requests');
      const withdrawalsData = await withdrawalsRes.json();

      // Sort by date, most recent first
      const sorted = withdrawalsData.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      setWithdrawals(sorted);
    } catch (err) {
      setError(err.message || 'An unknown error occurred while fetching withdrawals.');
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleApprove = async (withdrawal) => {
    if (!window.confirm(`Approve withdrawal of $${withdrawal.amount} for ${usersMap[withdrawal.userId]?.username || withdrawal.userId}?`)) return;
    setConfirmingId(withdrawal.id);
    setError('');
    setSuccess('');
    const userEmail = usersMap[withdrawal.userId]?.email;
    try {
      // 1. Update withdrawal status
      const res = await fetch(`${API_BASE_URL}/withdrawalRequests/${withdrawal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      if (!res.ok) throw new Error('Failed to approve withdrawal.');

      // 2. Update user balance
      const userRes = await fetch(`${API_BASE_URL}/users/${withdrawal.userId}`);
      if (!userRes.ok) throw new Error('Failed to fetch user for balance update.');
      const user = await userRes.json();
      const newBalance = (user.balance || 0) - parseFloat(withdrawal.amount);
      const balRes = await fetch(`${API_BASE_URL}/users/${withdrawal.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance }),
      });
      if (!balRes.ok) throw new Error('Failed to update user balance.');

      // 3. Send confirmation email using the new helper
      if (userEmail) {
          await sendTransactionEmail({
              recipient_email: userEmail,
              recipient_name: usersMap[withdrawal.userId]?.username || 'Client',
              transaction_type: 'Withdrawal',
              transaction_amount: formatCurrency(parseFloat(withdrawal.amount)),
              transaction_date: withdrawal.requestDate ? format(new Date(withdrawal.requestDate), 'MMM dd, yyyy, p') : 'N/A',
              transaction_ref: withdrawal.id, // Using withdrawal ID as reference
              withdrawal_address: withdrawal.walletAddress || 'N/A',
          });
      }
      setSuccess(`Withdrawal for ${usersMap[withdrawal.userId]?.username || withdrawal.userId} approved and balance updated.`);
      fetchWithdrawals();
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancel = async (withdrawal) => {
    if (!window.confirm(`Cancel withdrawal of $${withdrawal.amount} for ${usersMap[withdrawal.userId]?.username || withdrawal.userId}?`)) return;
    setConfirmingId(withdrawal.id);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/withdrawalRequests/${withdrawal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel withdrawal.');
      setSuccess(`Withdrawal for ${usersMap[withdrawal.userId]?.username || withdrawal.userId} cancelled.`);
      fetchWithdrawals();
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h4 className="mb-4 fw-bold text-primary">Withdrawal Requests</h4>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        </Col>
      </Row>
      {isLoading ? (
        <Row>
          <Col className="text-center my-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading withdrawal requests...</p>
          </Col>
        </Row>
      ) : withdrawals.length === 0 ? (
        <Row>
          <Col>
            <Alert variant="info">No withdrawal requests found.</Alert>
          </Col>
        </Row>
      ) : (
        <Row xs={1} md={2} lg={2} xl={3} className="g-4">
          {withdrawals.map((wd) => (
            <Col key={wd.id}>
              <Card
                className="shadow-lg border-0 h-100"
                style={{
                  borderRadius: '1.5rem',
                  background: 'linear-gradient(135deg, #fff7f7 0%, #f3e7e7 100%)',
                  minHeight: '420px',
                  minWidth: '340px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <Badge bg={statusColor(wd.status)} className="px-3 py-2 text-uppercase fs-6 shadow-sm" style={{ letterSpacing: '0.08em', borderRadius: '1rem' }}>
                      {wd.status}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <span className="fw-bold text-danger" style={{ fontSize: '1.5rem' }}>
                      {formatCurrency(wd.amount)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">User:</span>
                    <span className="fw-semibold ms-2">{usersMap[wd.userId]?.username || wd.userId}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Email:</span>
                    <span className="fw-semibold ms-2">{usersMap[wd.userId]?.email || 'N/A'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Wallet Address:</span>
                    <span className="fw-semibold ms-2">{wd.walletAddress || 'N/A'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Date:</span>
                    <span className="fw-semibold ms-2">
                      {wd.requestDate ? format(new Date(wd.requestDate), 'MMM dd, yyyy, p') : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    {wd.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="fw-bold flex-fill"
                          onClick={() => handleApprove(wd)}
                          disabled={confirmingId === wd.id}
                          style={{ borderRadius: '0.8rem', fontSize: '1.1rem', minWidth: 110 }}
                        >
                          {confirmingId === wd.id ? <Spinner as="span" animation="border" size="sm" /> : 'Approve'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="fw-bold flex-fill"
                          onClick={() => handleCancel(wd)}
                          disabled={confirmingId === wd.id}
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

export default Withdrawals;