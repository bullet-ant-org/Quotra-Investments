// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\WithdrawalRequests.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const WithdrawalRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null); // To show spinner on specific button

    const fetchWithdrawalRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Assuming your JSON server has a /withdrawalRequests endpoint
            // Or, you might fetch all users and filter those with pending withdrawals
            // For this example, let's assume a dedicated endpoint for pending requests
            const response = await fetch(`${API_BASE_URL}/withdrawals?status=pending`); // Changed endpoint
            if (!response.ok) {
                throw new Error(`Failed to fetch withdrawal requests. Status: ${response.status}`);
            }
            const data = await response.json();
            setRequests(data);
        } catch (err) {
            setError(err.message);
            console.error('Fetch withdrawal requests error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWithdrawalRequests();
    }, [fetchWithdrawalRequests]);

    const handleConfirmWithdrawal = async (request) => {
        if (!window.confirm(`Are you sure you want to confirm the withdrawal of $${request.amount} for ${request.username} to ${request.walletAddress}?`)) {
            return;
        }
        setConfirmingId(request.id);
        setError(null);

        try {
            // 1. Update the withdrawal request status
            const requestUpdateResponse = await fetch(`${API_BASE_URL}/withdrawals/${request.id}`, { // Changed endpoint
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmed' }),
            });

            if (!requestUpdateResponse.ok) {
                throw new Error('Failed to update withdrawal request status.');
            }

            // 2. Fetch the user to get their current balance
            const userResponse = await fetch(`${API_BASE_URL}/users/${request.userId}`);
            if (!userResponse.ok) {
                throw new Error(`Failed to fetch user data for ${request.username}. Cannot update balance.`);
            }
            const userData = await userResponse.json();
            const newBalance = (userData.totalBalance || 0) - parseFloat(request.amount);

            // 3. Update the user's balance
            const balanceUpdateResponse = await fetch(`${API_BASE_URL}/users/${request.userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalBalance: newBalance }),
            });

            if (!balanceUpdateResponse.ok) {
                // Potentially roll back the request status update or mark as needs attention
                throw new Error(`Failed to update user balance for ${request.username}. Withdrawal status updated, but balance needs manual check.`);
            }

            alert(`Withdrawal for ${request.username} confirmed and balance updated.`);
            fetchWithdrawalRequests(); // Refresh the list
        } catch (err) {
            setError(err.message);
            console.error('Confirm withdrawal error:', err);
        } finally {
            setConfirmingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" /> <p>Loading withdrawal requests...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <Card>
                <Card.Header as="h5">Pending Withdrawal Requests</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    {requests.length === 0 && !isLoading && !error && (
                        <Alert variant="info">No pending withdrawal requests found.</Alert>
                    )}
                    {requests.length > 0 && (
                        <Table responsive striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Request Date</th>
                                    <th>Username</th>
                                    <th>Amount</th>
                                    <th>Wallet Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req, index) => (
                                    <tr key={req.id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(req.requestDate).toLocaleString()}</td>
                                        <td>{req.username}</td>
                                        <td>${parseFloat(req.amount).toFixed(2)}</td>
                                        <td className="text-break">{req.walletAddress}</td>
                                        <td>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleConfirmWithdrawal(req)}
                                                disabled={confirmingId === req.id}
                                            >
                                                {confirmingId === req.id ? (
                                                    <Spinner as="span" animation="border" size="sm" />
                                                ) : (
                                                    'Confirm'
                                                )}
                                            </Button>
                                            {/* You could add a "Reject" button here too */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default WithdrawalRequests;