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
import { API_BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../utils/api'; // Import API_BASE_URL
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
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userId');
        navigate('/login');
        setIsLoading(false);
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}` };
      const userId = localStorage.getItem('userId'); // Get userId
      try {
        // Fetch profile from backend
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers });
        if (!response.ok) {
          if (response.status === 401 || response.status === 404) { // Handle auth errors
            setError('User not found. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userId');
            navigate('/login');
          }
          throw new Error('Failed to load user data.');
        }
        const data = await response.json();
        let updatedProfileData = {
          id: data._id || data.id,
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          fullName: data.fullName || 'N/A',
          profileImageUrl: data.profileImageUrl || data.profilePictureUrl || '',
          balance: data.balance || 0,
          bonus: data.bonus || 0,
          allTimeProfits: data.Profit || 0,
          totalInvestmentsAllTime: data.totalInvestmentsAllTime || 0,
          totalBonusesCount: data.totalBonusesCount || 0,
          depositHistoryCount: data.depositHistoryCount || 0,
          withdrawalHistoryCount: data.withdrawalHistoryCount || 0,
          investmentHistoryCount: data.investmentHistoryCount || 0,
          calculatedTotalBonusAmount: profileData.calculatedTotalBonusAmount,
          calculatedTotalBonusesCount: profileData.calculatedTotalBonusesCount,
        };
        // Fetch bonuses from /api/bonuses (if needed)
        // const bonusResponse = await fetch(`/api/bonuses?userId=${updatedProfileData.id}`, { headers });
        // if (bonusResponse.ok) {
        //   const bonuses = await bonusResponse.json();
        //   const totalBonusAmount = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
        //   updatedProfileData = {
        //     ...updatedProfileData,
        //     calculatedTotalBonusAmount: totalBonusAmount,
        //     calculatedTotalBonusesCount: bonuses.length,
        //   };
        // }
        setProfileData(updatedProfileData);
      } catch (err) {
        setError(err.message || 'Failed to load user data.');
        console.error('Error fetching profile data:', err);
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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      try {
        // 1. Upload to Cloudinary
        const cloudinaryResponse = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
        if (!cloudinaryResponse.ok) {
          const errData = await cloudinaryResponse.json().catch(() => ({ error: { message: 'Unknown Cloudinary error' } }));
          throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary.');
        }
        const cloudinaryData = await cloudinaryResponse.json();
        const newProfileImageUrl = cloudinaryData.secure_url;

        // 2. Update profileImageUrl in backend (PUT /api/users/profile)
        const updateUserResponse = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ profileImageUrl: newProfileImageUrl }),
        });
        if (!updateUserResponse.ok) throw new Error('Failed to update profile picture URL in database.');

        setProfileData((prev) => ({ ...prev, profileImageUrl: newProfileImageUrl }));
        // Update localStorage if other components rely on it
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && (loggedInUser._id === profileData.id || loggedInUser.id === profileData.id)) {
          localStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInUser, profileImageUrl: newProfileImageUrl }));
        }
        setSuccess('Profile picture updated successfully!');
      } catch (err) {
        setError(err.message || 'Failed to upload profile picture.');
        console.error('Profile picture upload error:', err);
      } finally {
        setIsUploading(false);
        setShowImageModal(false);
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

  return (
    <Container className="mt-4">
      {/* Global Error/Success for operations like image upload */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible className="mb-3">{success}</Alert>}

      {/* Top Section: Profile Image */}
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
      </Row>

      {/* Tab Selectors - Custom Styled */}
      <div className="profile-tab-selectors d-flex mb-4">
        <div
          className={`profile-tab-selector flex-grow-1 text-center py-2 px-3 ${activeTab === 'profile' ? 'active-tab shadow bg-white' : 'inactive-tab bg-white'}`}
          style={activeTab === 'profile' ? {} : { borderBottom: '3px solid #000', cursor: 'pointer', background: '#f8f9fa' }}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </div>
        <div
          className={`profile-tab-selector flex-grow-1 text-center py-2 px-3 ${activeTab === 'security' ? 'active-tab shadow bg-white' : 'inactive-tab bg-white'}`}
          style={activeTab === 'security' ? {} : { borderBottom: '3px solid #000', cursor: 'pointer', background: '#f8f9fa' }}
          onClick={() => setActiveTab('security')}
        >
          Security
        </div>
      </div>

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
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>Total Balance</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{formatCurrency(profileData.balance)}</Col>
              </Row>
              <Row className="profile-info-row">
                <Col xs={5} md={4} className="profile-info-label"><strong>All Bonus</strong></Col>
                <Col xs={7} md={8} className="profile-info-value">{formatCurrency(profileData.bonus)}</Col>
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