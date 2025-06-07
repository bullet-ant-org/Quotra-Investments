// src/layout/Dashboard/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Image,
  Card,
  Button,
  Modal, // Removed Table
  Container,
  Spinner,
  Alert,
  Dropdown,
  ButtonGroup, // Added for tab buttons
} from 'react-bootstrap';
import { API_BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../utils/api'; // Import Cloudinary constants
import { PersonCircle } from 'react-bootstrap-icons';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    id: '',
    username: '',
    email: '',
    phone: '',
    profileImageUrl: '',
    fullName: 'N/A', // New - Placeholder
    balance: 0,
    bonus: 0, // New - Placeholder
    allTimeProfits: 0, // New - Placeholder
    totalInvestmentsAllTime: 0, // New - Placeholder
    // For misc tab - Placeholders
    totalBonusesCount: 0,
    depositHistoryCount: 0,
    withdrawalHistoryCount: 0,
    investmentHistoryCount: 0,
    calculatedTotalBonusAmount: 0, // New state for calculated bonus sum
    calculatedTotalBonusesCount: 0, // New state for calculated bonus count
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // Specific state for upload
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // For success messages
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'misc'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem('userId');
        const storedUserString = localStorage.getItem('loggedInUser');

        let userToFetchId = userId;
        if (!userToFetchId && storedUserString) {
          const storedUser = JSON.parse(storedUserString);
          userToFetchId = storedUser.id;
        }

        if (!userToFetchId) {
          navigate('/login');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/${userToFetchId}`);
        if (!response.ok) {
          if (response.status === 401 || response.status === 404) navigate('/login');
          throw new Error('Failed to load user data.');
        }
        const data = await response.json();
        // Initialize updatedProfileData with values from fetched 'data'.
        // For fields like 'fullName', fall back to the current 'profileData' state value
        // if not available in 'data'.
        // Also, initialize 'calculated' bonus fields from current state;
        // they will be updated by the subsequent bonus fetch or its fallback.
        let updatedProfileData = {
          id: data.id,
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          fullName: data.fullName || profileData.fullName, // Use fetched or fallback to current state's fullName
          profileImageUrl: data.profileImageUrl || data.profilePictureUrl || '',
          balance: data.balance || 0,
          bonus: data.bonus || 0, // This is from the user object (e.g., current spendable bonus)
          allTimeProfits: data.Profit || 0, // Use AccuredProfit from backend
          totalInvestmentsAllTime: data.totalInvestmentsAllTime || 0, // Fetch or keep placeholder
          // Summary counts from the user object
          totalBonusesCount: data.totalBonusesCount || 0, 
          depositHistoryCount: data.depositHistoryCount || 0,
          withdrawalHistoryCount: data.withdrawalHistoryCount || 0,
          investmentHistoryCount: data.investmentHistoryCount || 0,
          // Initialize calculated fields from current state
          calculatedTotalBonusAmount: profileData.calculatedTotalBonusAmount,
          calculatedTotalBonusesCount: profileData.calculatedTotalBonusesCount,
        };

        // Now fetch bonus history
        const bonusResponse = await fetch(`${API_BASE_URL}/bonuses?userId=${userToFetchId}`);
        if (bonusResponse.ok) {
          const bonuses = await bonusResponse.json();
          const totalBonusAmount = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
          updatedProfileData = {
            ...updatedProfileData,
            calculatedTotalBonusAmount: totalBonusAmount,
            calculatedTotalBonusesCount: bonuses.length,
          };
        } else {
          console.warn("Could not fetch bonus history for user.");
          // Keep existing/placeholder values if bonus fetch fails
          // Fallback for calculated bonus fields: use summary fields from the main 'data' object.
          updatedProfileData = {
            ...updatedProfileData,
            calculatedTotalBonusAmount: data.bonus || 0, // Fallback to summary bonus amount from user data
            calculatedTotalBonusesCount: data.totalBonusesCount || 0, // Fallback to summary bonus count from user data
          };
        }
        setProfileData(updatedProfileData);
      } catch (err) {
        setError(err.message || 'Failed to load user data.');
        console.error("Error fetching profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      try {
        // 1. Upload to Cloudinary
        const cloudinaryResponse = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
        if (!cloudinaryResponse.ok) {
          const errData = await cloudinaryResponse.json().catch(() => ({ error: { message: "Unknown Cloudinary error" } }));
          throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary.');
        }
        const cloudinaryData = await cloudinaryResponse.json();
        const newProfileImageUrl = cloudinaryData.secure_url;

        // 2. Update profileImageUrl in JSON server
        const updateUserResponse = await fetch(`${API_BASE_URL}/users/${profileData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImageUrl: newProfileImageUrl }),
        });
        if (!updateUserResponse.ok) throw new Error('Failed to update profile picture URL in database.');

        setProfileData((prev) => ({ ...prev, profileImageUrl: newProfileImageUrl }));
        // Update localStorage if other components rely on it
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.id === profileData.id) {
            localStorage.setItem('loggedInUser', JSON.stringify({...loggedInUser, profileImageUrl: newProfileImageUrl}));
        }
        setSuccess('Profile picture updated successfully!');
      } catch (err) {
        setError(err.message || 'Failed to upload profile picture.');
        console.error("Profile picture upload error:", err);
      } finally {
        setIsUploading(false);
        setShowImageModal(false); // Close modal after attempt
      }
    }
  };

  const formatCurrency = (amount) =>
    amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0.00';

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error && !profileData.id) { // Show full page error only if initial load failed
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const renderPillCard = (title, value, currency = 'USD') => (
    <Card className="profile-pill-card shadow-sm mx-1 mb-2 mb-md-0">
      <Card.Body className="p-2 text-center">
        <small className="d-block text-muted profile-pill-title">{title}</small>
        <div className="profile-pill-value fw-bold">
          {typeof value === 'number' && !isNaN(value) ? `${value.toLocaleString()} ${currency}` : `${value} ${currency}`}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="mt-4">
      {/* Global Error/Success for operations like image upload */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible className="mb-3">{success}</Alert>}

      {/* Top Section: Profile Image and Pills */}
      <Row className="mb-4 align-items-center profile-top-section">
        {/* Profile Image */}
        <Col xs={12} md={3} className="text-center text-md-start mb-3 mb-md-0">
          <Dropdown>
            <Dropdown.Toggle
              as="div"
              className="profile-image-dropdown-toggle"
              id="profile-pic-dropdown"
            >
              {profileData.profileImageUrl ? (
                <Image
                  src={profileData.profileImageUrl}
                  roundedCircle
                  className="profile-main-image"
                  alt="Profile"
                />
              ) : (
                <PersonCircle
                  size={140}
                  className="profile-main-image-placeholder"
                />
              )}
              <span className="profile-avatar-badge">
                <i className="bi bi-camera text-primary" />
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowViewModal(true)}>View Profile Picture</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowImageModal(true)}>Edit Profile Picture</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        {/* Pills Section */}
        <Col xs={12} md={9} className="profile-pills-container d-flex flex-column flex-md-row justify-content-md-end align-items-center">
          {renderPillCard("Balance", profileData.balance)}
          {renderPillCard("Bonus", profileData.bonus)}
          {/* Removed All Time Profits pill */}
        </Col>
      </Row>

      {/* Tab Buttons */}
      <ButtonGroup className="mb-4 d-flex profile-tab-buttons">
        <Button variant={activeTab === 'profile' ? 'primary' : 'outline-primary'} onClick={() => setActiveTab('profile')}>Profile</Button>
        <Button variant={activeTab === 'security' ? 'primary' : 'outline-primary'} onClick={() => setActiveTab('security')}>Security</Button>
        {/* Removed Misc tab */}
      </ButtonGroup>

      {/* Content Area */}
      <div className="profile-content-area p-3 shadow-sm bg-light">
        {activeTab === 'profile' && (
          <div>
            <h4 className="mb-3">Profile Information</h4>
            <div className="profile-info-grid">
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Username</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{profileData.username}</Col>
              </Row>
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Full Name</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{profileData.fullName}</Col>
              </Row>
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Email</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{profileData.email}</Col>
              </Row>
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Phone</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{profileData.phone || 'N/A'}</Col>
              </Row>
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Current Balance</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{formatCurrency(profileData.balance)}</Col>
              </Row>
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Total Investments All Time</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{formatCurrency(profileData.totalInvestmentsAllTime)}</Col>
              </Row>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h4 className="mb-3">Security Settings</h4>
            <div className="profile-info-grid">
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Email</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{profileData.email}</Col>
              </Row>
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Phone Number</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{profileData.phone || 'N/A'}</Col>
              </Row>
              <Row className="profile-info-row align-items-center">
                <Col xs={5} md={4} className="profile-info-label"><strong>Password</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">
                    <Button variant="outline-secondary" size="sm">Change Password</Button>
                </Col>
              </Row>
              {/* Add 2FA settings here if applicable, following the same Row/Col pattern */}
            </div>
          </div>
        )}

        {/* Removed Misc tab content */}
      </div>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isUploading && (
            <div className="text-center mb-3">
              <Spinner animation="border" size="sm" /> Uploading...
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="form-control"
            disabled={isUploading}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {profileData.profileImageUrl ? (
            <Image
              src={profileData.profileImageUrl}
              roundedCircle
              className="profile-view-modal-image"
              alt="Profile"
            />
          ) : (
            <PersonCircle
              size={200}
              className="profile-view-modal-placeholder"
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;
