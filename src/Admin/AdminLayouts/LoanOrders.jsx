import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { format as formatDateFns } from 'date-fns';
import { API_BASE_URL } from '../../utils/api';
import { sendTransactionEmail } from '../../utils/emailHelper'; // Assuming this helper is set up

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const statusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
};

const LoanOrders = () => {
  const [loanOrders, setLoanOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null); // For approve/reject actions
  const [usersMap, setUsersMap] = useState({});

  const fetchLoanOrders = useCallback(async () => {
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
        usersMapTemp[u.id] = { username: u.username, email: u.email, balance: u.balance };
      });
      setUsersMap(usersMapTemp);

      // Fetch all loan orders
      const loanOrdersRes = await fetch(`${API_BASE_URL}/loanOrders`);
      if (!loanOrdersRes.ok) throw new Error('Failed to fetch loan orders');
      const loanOrdersData = await loanOrdersRes.json();

      // Sort by createdAt, newest first (oldest at the bottom)
      const sorted = loanOrdersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLoanOrders(sorted);
    } catch (err) {
      setError(err.message || 'An unknown error occurred while fetching loan orders.');
      setLoanOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoanOrders();
  }, [fetchLoanOrders]);

  const handleApproveLoan = async (loan) => {
    if (!window.confirm(`Approve loan of ${formatCurrency(loan.amount)} for ${usersMap[loan.userId]?.username || loan.userId}? This will add funds to their balance.`)) return;
    setProcessingId(loan.id);
    setError('');
    setSuccess('');
    const userDetail = usersMap[loan.userId];
    const userEmail = userDetail?.email;

    try {
      // 1. Update loan order status
      const loanRes = await fetch(`${API_BASE_URL}/loanOrders/${loan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', approvalDate: new Date().toISOString() }),
      });
      if (!loanRes.ok) throw new Error('Failed to approve loan order.');

      // 2. Update user balance
      const currentBalance = parseFloat(userDetail?.balance || 0);
      const newBalance = currentBalance + parseFloat(loan.amount);
      const balRes = await fetch(`${API_BASE_URL}/users/${loan.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance }),
      });
      if (!balRes.ok) throw new Error('Failed to update user balance.');

      // 3. Send confirmation email
      if (userEmail) {
        await sendTransactionEmail({
          recipient_email: userEmail,
          recipient_name: userDetail?.username || 'Client',
          transaction_type: 'Loan Approved',
          transaction_amount: formatCurrency(parseFloat(loan.amount)),
          transaction_date: formatDateFns(new Date(), 'MMM dd, yyyy, p'),
          transaction_ref: `LOAN-${loan.id}`,
        });
      }
      setSuccess(`Loan for ${userDetail?.username || loan.userId} approved. ${formatCurrency(loan.amount)} added to balance.`);
      fetchLoanOrders(); // Refresh list
    } catch (err) {
      setError(err.message || 'An error occurred while approving the loan.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectLoan = async (loan) => {
    if (!window.confirm(`Reject loan of ${formatCurrency(loan.amount)} for ${usersMap[loan.userId]?.username || loan.userId}?`)) return;
    setProcessingId(loan.id);
    setError('');
    setSuccess('');
    const userDetail = usersMap[loan.userId];
    const userEmail = userDetail?.email;

    try {
      const res = await fetch(`${API_BASE_URL}/loanOrders/${loan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectionDate: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to reject loan order.');

      // Optionally send a rejection email
      if (userEmail) {
        await sendTransactionEmail({
          recipient_email: userEmail,
          recipient_name: userDetail?.username || 'Client',
          transaction_type: 'Loan Application Update',
          transaction_amount: formatCurrency(parseFloat(loan.amount)),
          transaction_date: formatDateFns(new Date(), 'MMM dd, yyyy, p'),
          transaction_ref: `LOAN-${loan.id}`,
        });
      }
      setSuccess(`Loan for ${userDetail?.username || loan.userId} rejected.`);
      fetchLoanOrders(); // Refresh list
    } catch (err) {
      setError(err.message || 'An error occurred while rejecting the loan.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h4 className="mb-4 fw-bold text-primary">Loan Applications</h4>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        </Col>
      </Row>
      {isLoading ? (
        <Row><Col className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Loading loan applications...</p></Col></Row>
      ) : loanOrders.length === 0 ? (
        <Row><Col><Alert variant="info">No loan applications found.</Alert></Col></Row>
      ) : (
        <Row xs={1} md={1} lg={2} xl={2} className="g-4">
          {loanOrders.map((loan) => (
            <Col key={loan.id}>
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '1rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                <Card.Body className="d-flex flex-column p-4">
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-primary mb-0">{loan.loanTypeName || loan.loanName}</h5>
                    <Badge bg={statusColor(loan.status)} className="px-3 py-2 text-uppercase" style={{ fontSize: '0.8rem', borderRadius: '0.5rem' }}>
                      {loan.status}
                    </Badge>
                  </div>
                  <p className="mb-1"><strong className="text-muted">User:</strong> {usersMap[loan.userId]?.username || loan.userId}</p>
                  <p className="mb-1"><strong className="text-muted">Email:</strong> {usersMap[loan.userId]?.email || loan.userEmail || 'N/A'}</p>
                  <p className="mb-1"><strong className="text-muted">Amount:</strong> <span className="fw-bold">{formatCurrency(loan.amount || loan.quota)}</span></p>
                  <p className="mb-1"><strong className="text-muted">Term:</strong> {loan.term}</p>
                  <p className="mb-1"><strong className="text-muted">Interest:</strong> {loan.interest}%</p>
                  <p className="mb-1"><strong className="text-muted">Application Fee:</strong> <span className="fw-bold">{formatCurrency(loan.applicationFee)}</span></p>
                  <p className="mb-3"><strong className="text-muted">Applied:</strong> {loan.createdAt ? formatDateFns(new Date(loan.createdAt), 'MMM dd, yyyy, p') : 'N/A'}</p>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    {loan.status === 'pending' && (
                      <>
                        <Button variant="success" size="sm" onClick={() => handleApproveLoan(loan)} disabled={processingId === loan.id} className="flex-grow-1">
                          {processingId === loan.id ? <Spinner as="span" animation="border" size="sm" /> : 'Approve'}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleRejectLoan(loan)} disabled={processingId === loan.id} className="flex-grow-1">
                          {processingId === loan.id ? <Spinner as="span" animation="border" size="sm" /> : 'Reject'}
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

export default LoanOrders;