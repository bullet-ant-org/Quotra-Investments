// src/Dashboard/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, ButtonGroup, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
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
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', // Optional: for verifying before changing
    newPassword: '',
    confirmPassword: '',
  });
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { key: 'profile', name: 'Profile' },
    { key: 'security', name: 'Security' },
    { key: 'withdrawal', name: 'Withdrawal' },
  ];

  // --- Fetch User Data ---
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
          addToast('Authentication required. Please log in.', 'error');
          navigate('/login');
          setIsLoading(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
          }
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData({
          id: data._id || data.id,
          username: data.username || '',
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          withdrawalAccount: data.withdrawalAccount || '',
        });
      } catch (err) {
        console.error('Error fetching user data for settings:', err);
        addToast(`Failed to load settings: ${err.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate, addToast]);

  // --- Handle Input Changes ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev, [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Save Changes (Simplified for example, adapt based on which tab is active) ---
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match.', 'error');
      setIsSaving(false);
      return;
    }

    try {
      let payload = {};
      if (activeTab === 'profile') {
        payload = {
          fullName: userData.fullName,
          phone: userData.phone,
          username: userData.username,
        };
      } else if (activeTab === 'security') {
        payload = {};
        if (userData.phone) payload.phone = userData.phone;
        if (passwordData.newPassword) {
          payload.password = passwordData.newPassword;
        }
      } else if (activeTab === 'withdrawal') {
        payload = {
          withdrawalAccount: userData.withdrawalAccount,
        };
      }

      if (Object.keys(payload).length === 0) {
        addToast('No changes to save for this section.', 'info');
        setIsSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        addToast(errorData.message || `Failed to update ${activeTab} settings.`, 'error');
        setIsSaving(false);
        return;
      }

      // Update localStorage 'loggedInUser' if it exists and matches
      const localUserString = localStorage.getItem('loggedInUser');
      if (localUserString) {
        const currentLocalUser = JSON.parse(localUserString);
        if (currentLocalUser.id === userData.id || currentLocalUser._id === userData.id) {
          const updatedPayload = { ...payload };
          delete updatedPayload.password;
          const newLocalUser = { ...currentLocalUser, ...updatedPayload };
          localStorage.setItem('loggedInUser', JSON.stringify(newLocalUser));
        }
      }
      addToast('Settings saved successfully!', 'success');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Use an effect to show the toast only once if data loading fails
  useEffect(() => {
    if (!isLoading && !userData.id) {
      addToast('Failed to load user data. Please try logging in again.', 'error');
      // Optionally navigate away if the page is unusable without user data
      // navigate('/dashboard'); 
    }
  }, [isLoading, userData.id, addToast, navigate]);

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  const inputClass = "form-control rounded-2 shadow-sm border-0 mb-3 p-3";
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Edit Your Account</h2>

      <Card className=" border-0 bg-transparent">
        <Card.Header className="p-0 border-bottom-0 bg-transparent">
          <div className="settings-tab-selectors d-flex w-100">
            {tabs.map(tab => (
              <div
                key={tab.key}
                className={`settings-tab-selector flex-grow-1 text-center py-2 px-3 ${activeTab === tab.key ? 'active-tab shadow-sm bg-white' : 'inactive-tab'}`}
                style={activeTab === tab.key ? {} : { borderBottom: '2px solid #000', cursor: 'pointer', background: '#f8f9fa' }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.name}
              </div>
            ))}
          </div>
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
                  <strong>Security Notice:</strong> For your protection, withdrawal PINs are not set or changed on this page. Please contact support for assistance with your PIN.
                </Alert>

                <Alert variant="info" className="mt-4">
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
