// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\Admin\AdminLayouts\Users.jsx
import React, { useState, useEffect } from 'react';
import { Table, Pagination, Dropdown, Button, Image, Spinner, Alert, Card, Form, InputGroup } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons'; // Default avatar
import { API_BASE_URL } from '../../utils/api'; // Import your API_BASE_URL
 import { differenceInDays, parseISO } from 'date-fns'; // Add this import

const INACTIVE_DAYS = 14; // Same as AdminOverview.jsx

const Users = () => {
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
        // Fetch all users from JSON server
        const response = await fetch(`${API_BASE_URL}/users`);

        if (!response.ok) {
          throw new Error(`Failed to fetch users. Status: ${response.status}`);
        }

        const data = await response.json();
        // Filter out the currently logged-in admin if you don't want them to appear in the list
        // or handle self-modification purely on the client-side as done in handler functions.
        // For simplicity, we'll fetch all and let client-side logic prevent self-modification.
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
      alert('You cannot change your own role from this interface.');
      return;
    }

    try {
      // PATCH request to JSON server to update the user's role
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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
      alert(`User role updated to ${newRole}.`);
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
      console.error('Role change error:', err);
      alert(`Error updating role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (loggedInAdmin && userId === loggedInAdmin.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
      try {
        // DELETE request to JSON server
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'DELETE',
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

        alert(`User "${username}" deleted successfully.`);
      } catch (err) {
        setError(err.message || 'Failed to delete user.');
        console.error('Delete user error:', err);
        alert(`Error deleting user: ${err.message}`);
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
      <Card className="mb-4">
        <Card.Header as="h5">User Management</Card.Header>
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
        <>
          <Table striped bordered hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Username</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  style={
                    isUserInactive(user)
                      ? { background: 'rgba(255,0,0,0.07)' }
                      : {}
                  }
                >
                  <td>
                    <Image
                      src={user.profileImageUrl || user.profilePictureUrl || ''}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline-block';
                      }}
                      roundedCircle
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        display: (user.profileImageUrl || user.profilePictureUrl) ? 'inline-block' : 'none',
                      }}
                      alt={user.username}
                    />
                    <PersonCircle
                      size={40}
                      style={{ display: !(user.profileImageUrl || user.profilePictureUrl) ? 'inline-block' : 'none' }}
                      className="text-secondary"
                    />
                  </td>
                  <td>{user.username}</td>
                  <td>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(user.email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-decoration-underline"
                      title="Email user"
                    >
                      {user.email}
                    </a>
                  </td>
                  <td>
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
                  </td>
                  <td>
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
                          onClick={() => handleRoleChange(user.id, 'editor')}
                          disabled={
                            user.role === 'editor' ||
                            (loggedInAdmin && user.id === loggedInAdmin.id)
                          }
                        >
                          Make Editor
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
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
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
        </>
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
