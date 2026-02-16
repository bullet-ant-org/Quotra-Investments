import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Pagination, Badge, Accordion } from 'react-bootstrap';
import { format } from 'date-fns';
import { API_BASE_URL, handle401 } from '../../utils/api';

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Map transaction types to Bootstrap colors
const getTypeColor = (type) => {
  switch (type.toLowerCase()) {
    case 'deposit':
      return 'success';
    case 'withdrawal':
    case 'loan_withdrawal':
      return 'danger';
    case 'investment':
    case 'investment_paid_back':
      return 'primary';
    case 'bonus_added':
      return 'secondary';
    case 'loan':
      return 'info';
    default:
      return 'info';
  }
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
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

const ITEMS_PER_PAGE = 15;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userBalance, setUserBalance] = useState(0);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const fetchTransactions = useCallback(async () => {
    if (!userId || !token) {
      setError("User not authenticated. Cannot fetch transactions.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      // Fetch all transaction endpoints including loanOrders
      const [depositsRes, withdrawalsRes, bonusesRes, investmentsRes, loanOrdersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/depositRequests`, { headers }),
        fetch(`${API_BASE_URL}/withdrawalRequests`, { headers }),
        fetch(`${API_BASE_URL}/bonuses`, { headers }),
        fetch(`${API_BASE_URL}/assetOrders`, { headers }),
        fetch(`${API_BASE_URL}/loanOrders`, { headers }),
      ]);


      // Handle 401 Unauthorized for any endpoint (auto-logout and redirect)
      if ([depositsRes, withdrawalsRes, bonusesRes, investmentsRes, loanOrdersRes].some(res => handle401(res))) {
        setError('Your session has expired or you are not authorized. Please log in again.');
        setTransactions([]);
        setTotalPages(1);
        setIsLoading(false);
        return;
      }

      if (!depositsRes.ok) throw new Error(`Failed to fetch deposit requests: ${depositsRes.statusText}`);
      if (!withdrawalsRes.ok) throw new Error(`Failed to fetch withdrawal requests: ${withdrawalsRes.statusText}`);
      if (!bonusesRes.ok) throw new Error(`Failed to fetch bonuses: ${bonusesRes.statusText}`);
      if (!investmentsRes.ok) throw new Error(`Failed to fetch investments: ${investmentsRes.statusText}`);
      if (!loanOrdersRes.ok) throw new Error(`Failed to fetch loan orders: ${loanOrdersRes.statusText}`);

      const depositsData = await depositsRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      const bonusesData = await bonusesRes.json();
      const investmentsData = await investmentsRes.json();
      const loanOrdersData = await loanOrdersRes.json();

      // Map data to a common transaction format
      const mappedDeposits = depositsData.map(d => ({
        id: `dep-${d.id}`,
        type: 'deposit',
        amount: d.amount,
        date: d.requestDate,
        status: d.status,
        userId: d.userId,
        details: `Method: ${d.paymentMethod || 'N/A'}`,
      }));

      const mappedWithdrawals = withdrawalsData.map(w => ({
        id: `wd-${w.id}`,
        type: 'withdrawal',
        amount: w.amount,
        date: w.requestDate,
        status: w.status,
        userId: w.userId,
        details: `To: ${w.walletAddress || 'N/A'}`,
      }));

      const mappedBonuses = bonusesData.map(b => ({
        id: `bonus-${b.id}`,
        type: 'bonus_added',
        amount: b.amount,
        date: b.dateAwarded,
        status: b.status || 'completed',
        userId: b.userId,
        details: `Reason: ${b.reason || 'N/A'}`,
      }));

      const mappedInvestments = investmentsData.map(inv => ({
        id: `inv-${inv.orderId || inv.id}`,
        type: 'investment',
        amount: inv.priceAtOrder,
        date: inv.orderDate,
        status: inv.status,
        userId: inv.userId,
        details: `Asset: ${inv.assetId || 'N/A'}${inv.editorDiscountApplied ? ' (Editor Discount Applied)' : ''}`,
      }));

      // Map loan orders as transactions
      const mappedLoanOrders = loanOrdersData.map(lo => ({
        id: `loan-${lo.id}`,
        type: 'loan',
        amount: lo.quota || lo.applicationFee || 0,
        date: lo.createdAt || lo.date || lo.orderDate,
        status: lo.status || 'completed',
        userId: lo.userId,
        details: `Loan Type: ${lo.loanTypeName || lo.loanTypeId || 'N/A'}${lo.chosenCrypto ? ` | Paid with: ${lo.chosenCrypto}` : ''}`,
      }));

      // Combine all transactions
      const allTransactions = [
        ...mappedDeposits,
        ...mappedWithdrawals,
        ...mappedBonuses,
        ...mappedInvestments,
        ...mappedLoanOrders,
      ];

      // Sort by date, oldest at the bottom (newest first)
      const sortedTransactions = allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Pagination
      const totalItems = sortedTransactions.length;
      setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

      setTransactions(paginatedTransactions);

    } catch (err) {
      setError(err.message || 'An unknown error occurred while fetching transactions.');
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, currentPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationItems = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
          {number}
        </Pagination.Item>,
      );
    }
    return items;
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h4 className="mb-4 fw-bold text-primary">Transaction History</h4>
          {isLoading ? (
            <Row>
              <Col className="text-center my-5">
                <Spinner animation="border" />
                <p className="mt-2">Loading transactions...</p>
              </Col>
            </Row>
          ) : error ? (
            <Row>
              <Col>
                <Alert variant="danger">{error}</Alert>
              </Col>
            </Row>
          ) : transactions.length > 0 ? (
            <Accordion flush>
              {transactions.map((transaction, index) => (
                <Accordion.Item eventKey={String(index)} key={transaction.id} className="mb-2 shadow-sm">
                  <Accordion.Header>
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <span>
                        <Badge bg={getTypeColor(transaction.type)} className="me-2 text-uppercase shadow-sm" style={{ letterSpacing: '0.08em', borderRadius: '1rem' }}>
                          {transaction.type.replace(/_/g, ' ')}
                        </Badge>
                        <strong>{formatCurrency(transaction.amount)}</strong>
                      </span>
                      <Badge bg={getStatusColor(transaction.status)} className="px-3 py-2 text-uppercase shadow-sm" style={{ letterSpacing: '0.08em', borderRadius: '1rem' }}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6} className="mb-2 mb-md-0">
                        <p className="mb-1"><strong>Date & Time:</strong> {transaction.date && !isNaN(new Date(transaction.date)) ? format(new Date(transaction.date), 'MMM dd, yyyy, p') : 'N/A'}</p>
                        <p className="mb-1"><strong>Balance After:</strong> {transaction.balanceAfter !== undefined ? formatCurrency(transaction.balanceAfter) : 'N/A'}</p>
                      </Col>
                      <Col md={6}>
                        {transaction.details && (
                          <p className="mb-1 text-muted"><strong>Details:</strong> {transaction.details}</p>
                        )}
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          ) : (
            <Row>
              <Col>
                <Alert variant="info">No transactions found.</Alert>
              </Col>
            </Row>
          )}
          {totalPages > 1 && (
            <Row className="justify-content-center mt-3">
              <Col xs="auto">
                <Pagination>{renderPaginationItems()}</Pagination>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};
export default Transactions;
