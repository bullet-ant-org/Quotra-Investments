// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\Orders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { Table, Pagination, Button, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api'; // Using API_BASE_URL

const ORDERS_PER_PAGE = 15;

// Helper function to determine badge variant based on status
const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'pending_confirmation':
      return 'warning';
    case 'active': // Assuming 'active' is the same as 'completed' for display
    case 'completed':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
};

// Helper function for sorting orders: pending -> completed/active -> rejected
const sortOrders = (orders) => {
  const statusOrder = {
    'pending_confirmation': 1,
    'active': 2,
    'completed': 2,
    'rejected': 3,
  };
  return [...orders].sort((a, b) => {
    // Prioritize users with a defined investmentStatus
    if (!a.investmentStatus && b.investmentStatus) return 1;
    if (a.investmentStatus && !b.investmentStatus) return -1;
    if (!a.investmentStatus && !b.investmentStatus) return 0;


    const orderA = statusOrder[a.investmentStatus] || 4; // Other statuses last
    const orderB = statusOrder[b.investmentStatus] || 4;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Optional: secondary sort by a date field if available (e.g., submission date)
    // For now, maintain original order for same statuses
    return 0;
  });
};

const AdminOrdersPage = () => {
  const { addToast } = useToast();
  const [allUsersWithOrders, setAllUsersWithOrders] = useState([]); // Stores users who have some form of order/investment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all users and filter those with investment-related fields
  const fetchUsersWithOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authorization token found. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const usersData = await response.json();
      // Filter for users that have an investmentStatus or pending investment details
      const usersWithInvestmentInfo = usersData.filter(
        user => user.investmentStatus || user.pendingPlanId
      );
      setAllUsersWithOrders(sortOrders(usersWithInvestmentInfo));
    } catch (err) {
      setError(err.message || 'Failed to fetch user data.');
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchUsersWithOrders();
  }, [fetchUsersWithOrders]);


  // Update order status (Approving/Rejecting)
  const handleUpdateOrderStatus = async (userId, newStatus) => {
    setError(null);
    const userToUpdate = allUsersWithOrders.find(u => u.id === userId);
    if (!userToUpdate) {
      setError("User not found for update.");
      addToast("User not found for update.", "error");
      return;
    }

    let updatePayload = {
      investmentStatus: newStatus,
    };

    if (newStatus === 'completed' && userToUpdate.pendingPlanId) {
      updatePayload = {
        ...updatePayload,
        currentPlanId: userToUpdate.pendingPlanId,
        currentPlanName: userToUpdate.pendingPlanName,
        currentInvestmentAmount: userToUpdate.pendingInvestmentAmount,
        tradeStartTime: new Date().toISOString(),
        accruedProfit: 0,
        pendingPlanId: null,
        pendingPlanName: null,
        pendingInvestmentAmount: null,
      };
    } else if (newStatus === 'rejected') {
      updatePayload = {
        ...updatePayload,
        pendingPlanId: null,
        pendingPlanName: null,
        pendingInvestmentAmount: null,
        currentPlanId: userToUpdate.currentPlanId,
        currentInvestmentAmount: userToUpdate.currentInvestmentAmount,
      };
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authorization token found. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user (order) status. Status: ${response.status}`);
      }
      fetchUsersWithOrders();
      addToast(`User's investment status has been marked as ${newStatus}.`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
      console.error("Order status update error:", err);
      addToast(`Error updating order: ${err.message}`, 'error');
    }
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrdersOnPage = allUsersWithOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(allUsersWithOrders.length / ORDERS_PER_PAGE);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /> <p>Loading investment orders...</p></div>;
  }

  if (error && allUsersWithOrders.length === 0) {
    return <Alert variant="danger" className="mt-3">Error: {error}</Alert>;
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="mb-4">
        <Card.Header as="h5">Investment Order Management</Card.Header>
        <Card.Body>
          <Card.Title>
            Total Investment Records: {allUsersWithOrders.length}
            {' '}
            (Pending Confirmation: {allUsersWithOrders.filter(o => o.investmentStatus === 'pending_confirmation').length})
          </Card.Title>
          {error && <Alert variant="warning" className="mt-2">Notice: {error}</Alert>}
        </Card.Body>
      </Card>

      {currentOrdersOnPage.length > 0 ? (
        <>
          <Table striped bordered hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Plan Name</th>
                <th>Amount (USD)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrdersOnPage.map((userOrder) => (
                <tr key={userOrder.id}>
                  <td>{userOrder.username || 'N/A'}</td>
                  <td>{userOrder.email || 'N/A'}</td>
                  <td>
                    {userOrder.investmentStatus === 'pending_confirmation'
                      ? userOrder.pendingPlanName
                      : userOrder.currentPlanName || userOrder.pendingPlanName || 'N/A'}
                  </td>
                  <td>
                    {userOrder.investmentStatus === 'pending_confirmation'
                      ? userOrder.pendingInvestmentAmount
                      : userOrder.currentInvestmentAmount || userOrder.pendingInvestmentAmount || 'N/A'}
                  </td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(userOrder.investmentStatus)}>
                      {(userOrder.investmentStatus || 'NO_STATUS').replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    {userOrder.investmentStatus === 'pending_confirmation' ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(userOrder.id, 'completed')}
                          className="me-2 mb-1 mb-md-0"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(userOrder.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      ) : (
        !loading && <Alert variant="info" className="mt-3">No investment orders to display.</Alert>
      )}
    </div>
  );
};

export default AdminOrdersPage;
