import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Accordion, Card, Spinner, Alert, Modal, InputGroup } from 'react-bootstrap'; // Added Modal, InputGroup
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlusCircle, faGift, faDollarSign, faTimes } from '@fortawesome/free-solid-svg-icons'; // Added faDollarSign, faTimes

const UserActionsPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionType, setActionType] = useState(''); // 'deposit' or 'bonus'
  const [activeKey, setActiveKey] = useState(null); // For accordion

  // State for the action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);
  const [actionAmount, setActionAmount] = useState('');
  const [modalError, setModalError] = useState('');
  const [actionReason, setActionReason] = useState(''); // State for the bonus reason
  const [isSubmittingAction, setIsSubmittingAction] = useState(false); // For modal button loading state

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Determine action type from URL path
    if (location.pathname.includes('/create-deposit')) {
      setActionType('deposit');
    } else if (location.pathname.includes('/add-bonus')) {
      setActionType('bonus');
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (actionType) { // Only fetch if actionType is determined
      fetchUsers();
    }
  }, [actionType]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const openActionModal = (user) => {
    setSelectedUserForAction(user);
    setActionAmount('');
    setModalError('');
    setActionReason(''); // Reset reason when opening modal
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedUserForAction(null);
    setActionAmount('');
    setModalError('');
    setActionReason(''); // Reset reason when closing modal
  };

  const handleConfirmAction = async () => {
    if (!actionAmount || parseFloat(actionAmount) <= 0) {
      setModalError(`Please enter a valid amount for the ${actionType}.`);
      return;
    }
    setIsSubmittingAction(true);
    setModalError('');

    const amountValue = parseFloat(actionAmount);
    const userId = selectedUserForAction.id;
    const userName = selectedUserForAction.username;
    const reasonText = actionReason.trim();

    if (actionType === 'bonus' && !reasonText) {
        setModalError('Please provide a reason for adding the bonus.');
        return;
    }

    try {
      // Fetch current user data to get the current balance
      const userRes = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user data for ${userName}.`);
      }
      const userData = await userRes.json();
      const currentBalance = parseFloat(userData.balance) || 0;
      const newBalance = currentBalance + amountValue;

      // Update user's balance
      const updateUserBalanceRes = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (!updateUserBalanceRes.ok) {
        throw new Error(`Failed to update balance for ${userName}.`);
      }

      // If it's a bonus, also record it to a /bonuses endpoint
      if (actionType === 'bonus') {
        const bonusRecord = {
          userId: userId,
          username: userName,
          amount: amountValue,
          reason: reasonText, // Use the reason from the input
          dateAdded: new Date().toISOString(),
        };
        const bonusRes = await fetch(`${API_BASE_URL}/bonuses`, { // Assuming a /bonuses endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bonusRecord),
        });
        if (!bonusRes.ok) {
          // Even if bonus logging fails, the balance update might have succeeded.
          // You might want to handle this more gracefully, e.g., by trying to revert the balance update or logging the error.
          console.error(`Failed to record bonus for ${userName}, but balance was updated.`);
          // For simplicity, we'll proceed but you might want more robust error handling here.
          // throw new Error(`Failed to record bonus for ${userName}.`);
        }
        alert(`Bonus of $${amountValue.toFixed(2)} for ${userName} added and balance updated.`);
      } else if (actionType === 'deposit') {
        // For deposits, you might also want to create a record in 'depositRequests' or a similar collection
        // For now, we're just updating the balance directly as an admin action.
        // If you want to log it like user deposits, you'd POST to /depositRequests with status 'confirmed'
        alert(`Deposit of $${amountValue.toFixed(2)} for ${userName} added and balance updated.`);
      }

      // Successfully updated, now refetch users to update the list display
      // (or you could update the specific user in the local 'users' state)
      const updatedUsersResponse = await fetch(`${API_BASE_URL}/users`);
      if (updatedUsersResponse.ok) {
        const updatedUsersData = await updatedUsersResponse.json();
        setUsers(updatedUsersData);
      } else {
        console.error("Failed to refetch users after action.");
      }

      closeActionModal();

    } catch (err) {
      setModalError(err.message || `An error occurred while processing the ${actionType}.`);
      console.error(`Error during ${actionType} action:`, err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const pageTitle = actionType === 'deposit' ? 'Create Deposit for User' : 'Add Bonus to User';
  const buttonText = actionType === 'deposit' ? 'Add Deposit' : 'Add Bonus';
  const buttonIcon = actionType === 'deposit' ? faPlusCircle : faGift;
  const modalTitle = selectedUserForAction ? `${actionType === 'deposit' ? 'Add Deposit to' : 'Add Bonus to'} ${selectedUserForAction.username}` : '';
  const modalConfirmButtonText = actionType === 'deposit' ? 'Confirm Deposit' : 'Confirm Bonus';

  if (!actionType) {
    return (
      <Container fluid className="p-4">
        <Alert variant="warning">Invalid page access. Action type could not be determined.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-3">
        <Col>
          <h4 className="fw-bold text-primary">{pageTitle}</h4>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="searchUser">
            <div className="input-group">
              <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
              <Form.Control
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading users...</p>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {!isLoading && !error && (
        filteredUsers.length > 0 ? (
          <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} flush>
            {filteredUsers.map((user, index) => (
              <Accordion.Item eventKey={String(index)} key={user.id} className="mb-2 shadow-sm">
                <Accordion.Header onClick={() => setActiveKey(activeKey === String(index) ? null : String(index))}>
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span>
                      <strong>{user.username}</strong> ({user.email})
                    </span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col md={8}>
                      <p><strong>User ID:</strong> {user.id}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Current Balance:</strong> {user.balance ? `$${parseFloat(user.balance).toFixed(2)}` : '$0.00'}</p>
                      {/* Add more user details as needed */}
                    </Col>
                    <Col md={4} className="d-flex align-items-center justify-content-end">
                      <Button
                        variant={actionType === 'deposit' ? "success" : "info"}
                        onClick={() => openActionModal(user)}
                      >
                        <FontAwesomeIcon icon={buttonIcon} className="me-2" />
                        {buttonText}
                      </Button>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Alert variant="info">No users found matching your criteria.</Alert>
        )
      )}

      {/* Action Modal */}
      <Modal show={showActionModal} onHide={closeActionModal} centered backdrop="static" keyboard={false}>
        <Modal.Header className="border-0 pb-0">
          <Modal.Title as="h5" className="ms-auto text-primary fw-bold">{modalTitle}</Modal.Title>
          <Button variant="link" className="text-muted p-0" onClick={closeActionModal} style={{position: 'absolute', top: '15px', left: '15px'}}>
            <FontAwesomeIcon icon={faTimes} size="lg"/>
          </Button>
        </Modal.Header>
        <Modal.Body className="px-4 pt-2 pb-4">
          {modalError && <Alert variant="danger" className="py-2 small">{modalError}</Alert>}
          <Form.Group controlId="actionAmount">
            {/* Amount Input */}
            <Form.Label className="fw-medium">Amount (USD)</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ borderTopLeftRadius: '50rem', borderBottomLeftRadius: '50rem', borderRight: 0, background: '#e9ecef' }}>
                <FontAwesomeIcon icon={faDollarSign} />
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
                className="form-control-pill"
                style={{ 
                  borderTopRightRadius: '50rem', 
                  borderBottomRightRadius: '50rem',
                  borderLeft: 0,
                  paddingLeft: '0.75rem'
                }}
              />
            </InputGroup>
          </Form.Group>

          {/* Reason Textarea (only for bonus) */}
          {actionType === 'bonus' && (
            <Form.Group controlId="actionReason" className="mt-3">
              <Form.Label className="fw-medium">Reason for Bonus</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter reason for adding this bonus..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required // Make reason required for bonus
                className="rounded-1" // Use rounded-1 for textarea
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 d-flex justify-content-center px-4 pb-4">
          <Button 
            variant="primary" 
            onClick={handleConfirmAction} 
            className="w-100 text-white fw-bold"
            style={{
              backgroundColor: '#0d6efd', // Your special blue
              borderColor: '#0d6efd', // Your special blue
              borderRadius: '50rem', // Pill shape
              padding: '0.6rem 1.5rem'
            }}
          >
            {isSubmittingAction ? (
              <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Processing...</>
            ) : (
              modalConfirmButtonText
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserActionsPage;