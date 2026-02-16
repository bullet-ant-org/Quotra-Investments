// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\Users.jsx
import React, { useState, useEffect } from 'react';
import { Table, Pagination, Dropdown, Button, Image, Spinner, Alert, Card, Form, InputGroup, Accordion, Row, Col } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons'; // Default avatar
import { API_BASE_URL } from '../../utils/api'; // Import your API_BASE_URL
 import { differenceInDays, parseISO } from 'date-fns'; // Add this import

const INACTIVE_DAYS = 14; // Same as AdminOverview.jsx

import { useToast } from '../../context/ToastContext';

const Users = () => {
  const { addToast } = useToast();
  // ...existing code...
  // Example usage:
  // addToast('User deleted successfully.', 'success');
  // addToast('Error updating user.', 'error');
  // Place addToast calls after any data mutation or error.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const loggedInAdmin = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authorization token found. Please log in again.');
        // Fetch all users from admin-only endpoint
        const response = await fetch(`${API_BASE_URL}/users/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users. Status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch users.');
        console.error('Fetch users error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (loggedInAdmin && userId === loggedInAdmin.id) {
      addToast('You cannot change your own role from this interface.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authorization token found. Please log in again.');
      // PATCH request to admin-only endpoint to update the user's role
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update role. Status: ${response.status}`);
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      addToast(`User role updated to ${newRole}.`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
      console.error('Role change error:', err);
      addToast(`Error updating role: ${err.message}`, 'error');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (loggedInAdmin && userId === loggedInAdmin.id) {
      addToast('You cannot delete your own account.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authorization token found. Please log in again.');
        // DELETE request to admin-only endpoint
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete user. Status: ${response.status}`);
        }

        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.filter((user) => user.id !== userId);
          const newTotalPages = Math.ceil(updatedUsers.length / usersPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          } else if (updatedUsers.length === 0) {
            setCurrentPage(1);
          }
          return updatedUsers;
        });

        addToast(`User "${username}" deleted successfully.`, 'success');
      } catch (err) {
        setError(err.message || 'Failed to delete user.');
        console.error('Delete user error:', err);
        addToast(`Error deleting user: ${err.message}`, 'error');
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper to determine if user is inactive
  const isUserInactive = (user) => {
    if (!user.lastLogin && !user.lastActive) return true;
    const last = user.lastActive || user.lastLogin;
    try {
      const lastDate = typeof last === 'string' ? parseISO(last) : new Date(last);
      return differenceInDays(new Date(), lastDate) >= INACTIVE_DAYS;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> <p>Loading users...</p>
      </div>
    );
  }

  if (error && filteredUsers.length === 0 && searchTerm === '') {
    return <Alert variant="danger" className="mt-3">Error: {error}</Alert>;
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="mb-4 border-0">
        <Card.Header as="h5" className='border-0'>User Management</Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">
              Total Users: {users.length}{' '}
              {searchTerm && `(Showing ${filteredUsers.length} of ${users.length} matching search)`}
            </Card.Title>
            <Form className="w-50">
              <InputGroup>
                <Form.Control
                  type="search"
                  className="totoform"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </Form>
          </div>
          {error && users.length > 0 && !loading && (
            <Alert variant="warning" className="mt-2">
              Partial data warning: {error}
            </Alert>
          )}
        </Card.Body>
      </Card>
      {currentUsers.length > 0 ? (
        <div>
          <Accordion flush>
            {currentUsers.map((user, index) => (
              <Accordion.Item eventKey={String(user._id || user.id || index)} key={user._id || user.id || index} className="mb-2 shadow-sm">
                <Accordion.Header>
                  <div className="d-flex align-items-center w-100">
                    {(user.profileImageUrl || user.profilePictureUrl) ? (
                      <Image
                        src={user.profileImageUrl || user.profilePictureUrl}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-block';
                        }}
                        roundedCircle
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          marginRight: '1rem'
                        }}
                        alt={user.username}
                      />
                    ) : (
                      <PersonCircle
                        size={40}
                        style={{ marginRight: '1rem' }}
                        className="text-secondary"
                      />
                    )}
                    <span>
                      <strong>{user.username}</strong> ({user.email})
                    </span>
                    <span className="ms-auto">
                      <span
                        className={`badge bg-${
                          user.role === 'admin'
                            ? 'danger'
                            : user.role === 'editor'
                            ? 'warning'
                            : 'secondary'
                        }`}
                      >
                        {user.role || 'user'}
                      </span>
                    </span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col md={8}>
                      <p><strong>User ID:</strong> {user.id}</p>
                      <p><strong>Email:</strong> <a href={`mailto:${user.email}`} className="text-primary text-decoration-underline">{user.email}</a></p>
                      <p>
                        <strong>Last Active:</strong>{' '}
                        {user.lastActive || user.lastLogin
                          ? new Date(user.lastActive || user.lastLogin).toLocaleString()
                          : 'Never'}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        {isUserInactive(user) ? (
                          <span className="text-danger">Inactive</span>
                        ) : (
                          <span className="text-success">Active</span>
                        )}
                      </p>
                    </Col>
                    <Col md={4} className="d-flex align-items-center justify-content-end">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-primary"
                          size="sm"
                          id={`dropdown-user-${user.id}`}
                        >
                          Change Role
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => handleRoleChange(user.id, 'admin')}
                            disabled={
                              user.role === 'admin' ||
                              (loggedInAdmin && user.id === loggedInAdmin.id)
                            }
                          >
                            Make Admin
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleRoleChange(user.id, 'user')}
                            disabled={
                              (!user.role || user.role === 'user') ||
                              (loggedInAdmin && user.id === loggedInAdmin.id)
                            }
                          >
                            Make User
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="text-danger"
                            disabled={loggedInAdmin && user.id === loggedInAdmin.id}
                          >
                            Delete User
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-3">
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </div>
      ) : (
        !loading && (
          <Alert variant="info" className="mt-3">
            {searchTerm
              ? 'No users match your search criteria.'
              : 'No users found.'}
          </Alert>
        )
      )}
    </div>
  );
};

export default Users;
