// src/Dashboard/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, ButtonGroup, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';

const Settings = () => {
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    fullName: '', // Added for profile tab
    email: '',
    phone: '',
    // profileImageUrl is handled in Profile.jsx, not typically edited here unless specified
    withdrawalAccount: '', // For Withdrawal tab
    withdrawalPin: '',     // For Withdrawal tab (consider security implications)
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', // Optional: for verifying before changing
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'withdrawal'

  // --- Fetch User Data ---
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Consistently use 'userId' or 'loggedInUser' as set by LoginPage
        const userId = localStorage.getItem('userId');
        const storedUserString = localStorage.getItem('loggedInUser');

        let userToFetchId = userId;
        if (!userToFetchId && storedUserString) {
            const storedUserObj = JSON.parse(storedUserString);
            userToFetchId = storedUserObj.id;
        }

        if (!userToFetchId) {
          navigate('/login');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/${userToFetchId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // No Authorization header for simple JSON server
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login'); // Redirect to login if unauthorized
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData({
          id: data.id,
          username: data.username || '',
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          withdrawalAccount: data.withdrawalAccount || '', // Fetch if stored
          // withdrawalPin should not be fetched for display
        });
      } catch (err) {
        console.error('Error fetching user data for settings:', err);
        setError(`Failed to load settings: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // --- Handle Input Changes ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev, [name]: value,
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // --- Save Changes (Simplified for example, adapt based on which tab is active) ---
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      setIsSaving(false);
      return;
    }

    try {
      let payload = {};
      let endpoint = `${API_BASE_URL}/users/${userData.id}`; // Default endpoint

      if (activeTab === 'profile') {
        payload = {
          fullName: userData.fullName,
          phone: userData.phone, // Assuming phone is part of general profile
          username: userData.username,
        };
      } else if (activeTab === 'security') {
        payload = {};
        if (userData.phone) payload.phone = userData.phone; // If phone is also in security
        if (passwordData.newPassword) {
          // Add currentPassword to payload if your backend requires it for verification
          // payload.currentPassword = passwordData.currentPassword;
          payload.password = passwordData.newPassword; // Backend should hash this
        }
      } else if (activeTab === 'withdrawal') {
        payload = {
          withdrawalAccount: userData.withdrawalAccount,
          // Withdrawal PIN should be handled with extreme care,
          // often involving a separate, more secure endpoint or flow.
          withdrawalPin: userData.withdrawalPin, // Ensure backend encrypts this
        };
        // Potentially a different endpoint for withdrawal settings
        // endpoint = `${API_BASE_URL}/users/${userData.id}/withdrawal-settings`;
      }

      if (Object.keys(payload).length === 0) {
        setSuccess("No changes to save for this section.");
        setIsSaving(false);
        return;
      }

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update ${activeTab} settings.`);
      }

      // Update localStorage 'loggedInUser' if it exists and matches
      const localUserString = localStorage.getItem('loggedInUser');
      if (localUserString && JSON.parse(localUserString).id === userData.id) {
        const currentLocalUser = JSON.parse(localUserString);
        const updatedLocalUser = { ...currentLocalUser, ...payload }; // Merge changes
        delete updatedLocalUser.password; // Never store new password in localStorage
        delete updatedLocalUser.withdrawalPin; // Never store PIN in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(updatedLocalUser));
      }
      setSuccess('Settings saved successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' }); // Clear password fields
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error && !userData.id) { // Show full page error only if user data failed to load initially
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const inputClass = "form-control rounded-pill shadow-lg border-0 mb-3";

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Edit Your Account</h2>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      <Card className="shadow-sm border-0 bg-transparent">
        <Card.Header className="p-0 border-bottom-0">
          <ButtonGroup size="sm" className="w-100">
            <Button
              variant={activeTab === 'profile' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('profile')}
              className="rounded-0"
            >
              Profile
            </Button>
            <Button
              variant={activeTab === 'security' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('security')}
              className="rounded-0"
            >
              Security
            </Button>
            <Button
              variant={activeTab === 'withdrawal' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('withdrawal')}
              className="rounded-0"
            >
              Withdrawal
            </Button>
          </ButtonGroup>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSaveChanges}>
            {activeTab === 'profile' && (
              <>
                <Form.Group controlId="formFullName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" name="fullName" placeholder={userData.fullName || "Enter full name"} value={userData.fullName} onChange={handleInputChange} className={inputClass} />
                </Form.Group>
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" name="username" placeholder={userData.username || "Enter username"} value={userData.username} onChange={handleInputChange} className={inputClass} />
                </Form.Group>
                <Form.Group controlId="formEmailProfile">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" placeholder={userData.email || "user@example.com"} value={userData.email} readOnly className={inputClass + " bg-light"} />
                </Form.Group>
                <Form.Group controlId="formPhoneProfile">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control type="tel" name="phone" placeholder={userData.phone || "Enter mobile number"} value={userData.phone} onChange={handleInputChange} className={inputClass} />
                </Form.Group>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <Form.Group controlId="formEmailSecurity">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder={userData.email || "user@example.com"} value={userData.email} readOnly className={inputClass + " bg-light"} />
                </Form.Group>
                <Form.Group controlId="formPhoneSecurity">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type="tel" name="phone" placeholder={userData.phone || "Enter phone number"} value={userData.phone} onChange={handleInputChange} className={inputClass} />
                </Form.Group>
                <h5 className="mt-4 mb-3">Change Password</h5>
                {/* Optional: Current Password
                <Form.Group controlId="formCurrentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control type="password" name="currentPassword" placeholder="Enter current password" value={passwordData.currentPassword} onChange={handlePasswordChange} className={inputClass} />
                </Form.Group>
                */}
                <Form.Group controlId="formNewPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" name="newPassword" placeholder="Enter new password" value={passwordData.newPassword} onChange={handlePasswordChange} className={inputClass} />
                </Form.Group>
                <Form.Group controlId="formConfirmPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control type="password" name="confirmPassword" placeholder="Confirm new password" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={inputClass} />
                </Form.Group>
              </>
            )}

            {activeTab === 'withdrawal' && (
              <>
                <Form.Group controlId="formWithdrawalAccount">
                  <Form.Label>Withdrawal Account (USDT TRC20 Address)</Form.Label>
                  <Form.Control
                    type="text"
                    name="withdrawalAccount"
                    placeholder={userData.withdrawalAccount || "Enter USDT TRC20 wallet address"}
                    value={userData.withdrawalAccount}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </Form.Group>
                <Alert variant="warning" className="mt-4">
                  <strong>Important:</strong> Make sure that your wallet address is a USDT, TRC20 account. If not, your Withdrawals cannot be placed.
                </Alert>
              </>
            )}

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings;
