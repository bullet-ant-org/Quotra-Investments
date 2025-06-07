import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Pagination, Accordion } from 'react-bootstrap';
import { format } from 'date-fns'; // Using date-fns for date formatting
import { API_BASE_URL } from '../../utils/api'; // Import your API base URL

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
    case 'loan_withdrawal': // Loan withdrawal is also red
      return 'danger';
    case 'investment': // Assuming 'investment' type might come from a generic /transactions endpoint if you merge later
    case 'investment_paid_back': // Investment paid back is primary
      return 'primary';
    case 'bonus_added':
      return 'secondary';
    default:
      return 'info'; // Default color for unknown types
  }
};

// Map transaction status to Bootstrap colors
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed': // Assuming confirmed is equivalent to completed for status display
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
  const userId = localStorage.getItem('userId'); // Get userId from localStorage

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Cannot fetch transactions.");
      setIsLoading(false);
      setTransactions([]);
      setTotalPages(1);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch user balance
      const userRes = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!userRes.ok) throw new Error(`Failed to fetch user: ${userRes.statusText}`);
      const userData = await userRes.json();
      setUserBalance(userData.balance || 0);

      // Fetch data from all endpoints for the specific user
      const [depositsRes, withdrawalsRes, bonusesRes, investmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/depositRequests?userId=${userId}`),
        fetch(`${API_BASE_URL}/withdrawalRequests?userId=${userId}`),
        fetch(`${API_BASE_URL}/bonuses?userId=${userId}`),
        fetch(`${API_BASE_URL}/assetOrders?userId=${userId}`),
      ]);

      if (!depositsRes.ok) throw new Error(`Failed to fetch deposit requests: ${depositsRes.statusText}`);
      if (!withdrawalsRes.ok) throw new Error(`Failed to fetch withdrawal requests: ${withdrawalsRes.statusText}`);
      if (!bonusesRes.ok) throw new Error(`Failed to fetch bonuses: ${bonusesRes.statusText}`);
      if (!investmentsRes.ok) throw new Error(`Failed to fetch investments: ${investmentsRes.statusText}`);

      const depositsData = await depositsRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      const bonusesData = await bonusesRes.json();
      const investmentsData = await investmentsRes.json();

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

      // Map investments as transactions
      const mappedInvestments = investmentsData.map(inv => ({
        id: `inv-${inv.orderId || inv.id}`,
        type: 'investment',
        amount: inv.priceAtOrder,
        date: inv.orderDate,
        status: inv.status,
        userId: inv.userId,
        details: `Asset: ${inv.assetId || 'N/A'}${inv.editorDiscountApplied ? ' (Editor Discount Applied)' : ''}`,
      }));

      // Combine all transactions
      const allTransactions = [
        ...mappedDeposits,
        ...mappedWithdrawals,
        ...mappedBonuses,
        ...mappedInvestments,
      ];

      // Sort by date, most recent first
      const sortedTransactions = allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate running balance after each transaction
      let runningBalance = userData.balance || 0;
      const sortedWithBalance = sortedTransactions.map(tx => {
        let balanceAfter = runningBalance;
        if (tx.status === 'completed' || tx.status === 'confirmed') {
          if (tx.type === 'deposit' || tx.type === 'bonus_added') {
            runningBalance -= tx.amount;
          } else if (tx.type === 'withdrawal') {
            runningBalance += tx.amount;
          } else if (tx.type === 'investment') {
            runningBalance += 0; // Adjust if you want to reflect investment effect on balance
          }
        }
        return { ...tx, balanceAfter };
      });

      // Client-side pagination
      const totalItems = sortedWithBalance.length;
      setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedTransactions = sortedWithBalance.slice(startIndex, endIndex);

      setTransactions(paginatedTransactions);

    } catch (err) {
      setError(err.message || 'An unknown error occurred while fetching transactions.');
      console.error('Error fetching transactions:', err);
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Fetch transactions when the function changes (due to currentPage change)

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
          <Card className="transactions-card">
            <Card.Header as="h5">Transaction History</Card.Header>
            {isLoading ? (
              <Card.Body className="text-center">
                <Spinner animation="border" />
                <p className="mt-2">Loading transactions...</p>
              </Card.Body>
            ) : error ? (
              <Card.Body>
                <Alert variant="danger" className="m-0">{error}</Alert>
              </Card.Body>
            ) : transactions.length > 0 ? (
              <>
                <Accordion flush>
                  {transactions.map((transaction) => (
                    <Accordion.Item eventKey={transaction.id} key={transaction.id}>
                      <Accordion.Header>
                        <span className={`fw-bold text-capitalize me-auto text-${getTypeColor(transaction.type)}`}>
                          {transaction.type.replace(/_/g, ' ')}
                        </span>
                        <span className={`transaction-status text-${getStatusColor(transaction.status)} text-uppercase fw-bold px-3`}>
                          {transaction.status}
                        </span>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col sm={12} md={6} className="mb-2 mb-md-0">
                            <small className="text-muted d-block">Date & Time</small>
                            {transaction.date && !isNaN(new Date(transaction.date)) 
  ? format(new Date(transaction.date), 'MMM dd, yyyy, p') 
  : 'N/A'}
                          </Col>
                          <Col sm={6} md={3} className="mb-2 mb-md-0">
                            <small className="text-muted d-block">Amount</small>
                            {formatCurrency(transaction.amount)}
                          </Col>
                          <Col sm={6} md={3}>
                            <small className="text-muted d-block">Balance After</small>
                            {transaction.balanceAfter !== undefined ? formatCurrency(transaction.balanceAfter) : 'N/A'}
                          </Col>
                          {transaction.details && (
                            <Col sm={12} className="mt-2 text-muted">
                                <small>{transaction.details}</small>
                            </Col>)}
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
                {totalPages > 1 && (
                  <Card.Footer className="d-flex justify-content-center">
                    <Pagination>{renderPaginationItems()}</Pagination>
                  </Card.Footer>
                )}
              </>
            ) : (
              <Card.Body>
                <Alert variant="info" className="m-0">No transactions found.</Alert>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default Transactions;
