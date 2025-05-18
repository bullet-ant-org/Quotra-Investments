// src/Dashboard/Settings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../utils/api'; // Import Cloudinary constants

const Settings = () => {
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    email: '',
    phone: '',
    profileImageUrl: '',
    walletAddress: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
          email: data.email || '',
          phone: data.phone || '',
          profileImageUrl: data.profileImageUrl || data.profilePictureUrl || '',
          walletAddress: data.walletAddress || '',
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
      ...prev,
      [name]: value,
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

  // --- Save Changes ---
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
      // Update user profile
      const updatePayload = {
        username: userData.username,
        phone: userData.phone,
        walletAddress: userData.walletAddress,
        // profileImageUrl is handled by handleFileSelected
      };
      if (passwordData.newPassword) {
        updatePayload.password = passwordData.newPassword; // Password should be hashed on a real backend
      }

      // Only send PATCH if there's something to update other than password
      if (Object.keys(updatePayload).length > (updatePayload.password ? 1 : 0) ) {
        const res = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update profile details.');
        }
      } else if (updatePayload.password) { // Only password change
         const res = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: updatePayload.password }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update password.');
        }
      }


      // Update localStorage 'loggedInUser' if it exists and matches
      const localUserString = localStorage.getItem('loggedInUser');
      if (localUserString && JSON.parse(localUserString).id === userData.id) {
        // Construct the updated user object for localStorage carefully
        const currentLocalUser = JSON.parse(localUserString);
        const updatedLocalUser = {
            ...currentLocalUser,
            username: userData.username, // from form
            phone: userData.phone,       // from form
            walletAddress: userData.walletAddress,
            // profileImageUrl is updated separately in handleFileSelected
            // password should not be stored in localStorage directly
        };
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

  // --- Handle Profile Picture Upload ---
  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsSaving(true);
      setSuccess(null); // Clear previous success messages
      setError(null);

      // --- Cloudinary Upload ---
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`; // Use imported constants

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        // 1. Upload to Cloudinary
        const cloudinaryResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        if (!cloudinaryResponse.ok) {
          const errData = await cloudinaryResponse.json().catch(() => ({error: {message: "Unknown Cloudinary error"}}));
          throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary.');
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const newProfileImageUrl = cloudinaryData.secure_url;

        // 2. Update profile picture URL in your JSON server
        const updateUserResponse = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // No Authorization header needed for simple JSON server
          },
          body: JSON.stringify({ profileImageUrl: newProfileImageUrl }),
        });

        if (!updateUserResponse.ok) {
          throw new Error('Failed to update profile picture URL in your database.');
        }

        const updatedUserDataState = { ...userData, profileImageUrl: newProfileImageUrl };
        setUserData(updatedUserDataState);

        // Update localStorage 'loggedInUser' with new image URL
        const localUserString = localStorage.getItem('loggedInUser');
        if (localUserString && JSON.parse(localUserString).id === userData.id) {
          localStorage.setItem('loggedInUser', JSON.stringify({...JSON.parse(localUserString), profileImageUrl: newProfileImageUrl}));
        }
        setSuccess('Profile picture updated successfully!');
      } catch (err) {
        console.error('Error uploading profile picture:', err);
        setError(err.message || 'Failed to update profile picture');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const triggerFileInput = () => {
    if (isSaving) return;
    fileInputRef.current.click();
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

  return (
    <Container className="mt-4">
      <Row className="flex-lg-nowrap">
        <Col>
          <Row>
            <Col className="mb-3">
              <Card>
                <Card.Body>
                  <div className="e-profile">
                    <Row>
                      <Col xs={12} sm="auto" className="mb-3">
                        <div className="mx-auto" style={{ width: '140px' }}>
                          <Image
                            src={userData.profileImageUrl || `https://via.placeholder.com/140?text=${userData.username?.[0]?.toUpperCase() || 'U'}`}
                            alt="User profile"
                            rounded
                            fluid
                            style={{
                              height: '140px',
                              width: '140px',
                              objectFit: 'cover',
                              backgroundColor: 'rgb(233, 236, 239)',
                            }}
                          />
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2"
                            onClick={triggerFileInput}
                            disabled={isSaving}
                          >{isSaving && fileInputRef.current?.files?.length > 0 ? <Spinner as="span" animation="border" size="sm" /> : 'Change Photo'}</Button>
                        </div>
                      </Col>
                      <Col className="d-flex flex-column flex-sm-row justify-content-between mb-3">
                        <div className="text-center text-sm-left mb-2 mb-sm-0">
                          <h4 className="pt-sm-2 pb-1 mb-0 text-nowrap">{userData.username || 'User Name'}</h4>
                          <p className="mb-0">{userData.email}</p>
                        </div>
                      </Col>
                    </Row>

                    <div className="tab-content pt-3">
                      <div className="tab-pane active">
                        <Form className="form" onSubmit={handleSaveChanges}>
                          {error && !isSaving && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                          {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

                          <Row>
                            <Col>
                              <Row>
                                <Col>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                      type="text"
                                      name="username"
                                      placeholder="Username"
                                      value={userData.username}
                                      onChange={handleInputChange}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                      type="email"
                                      name="email"
                                      placeholder="user@example.com"
                                      value={userData.email}
                                      readOnly
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                      type="tel"
                                      name="phone"
                                      placeholder="+1234567890"
                                      value={userData.phone}
                                      onChange={handleInputChange}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Wallet Address</Form.Label>
                                    <Form.Control
                                      type="text"
                                      name="walletAddress"
                                      placeholder="Enter your wallet address"
                                      value={userData.walletAddress}
                                      onChange={handleInputChange}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={12} sm={6} className="mb-3">
                              <div className="mb-2">
                                <b>Change Password</b>
                              </div>
                              <Row>
                                <Col>
                                  <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                      type="password"
                                      name="newPassword"
                                      placeholder="••••••"
                                      value={passwordData.newPassword}
                                      onChange={handlePasswordChange}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                      type="password"
                                      name="confirmPassword"
                                      placeholder="••••••"
                                      value={passwordData.confirmPassword}
                                      onChange={handlePasswordChange}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col className="d-flex justify-content-end">
                              <Button variant="primary" type="submit" disabled={isSaving}>
                                {isSaving ? (
                                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                ) : (
                                  'Save Changes'
                                )}
                              </Button>
                            </Col>
                          </Row>
                          {/* Hidden file input, moved inside the form */}
                          <Form.Control
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelected}
                            style={{ display: 'none' }}
                            accept="image/*" // Restrict to image files
                          />
                        </Form>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
