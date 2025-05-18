// src/layout/Dashboard/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Image,
  Card,
  Button,
  Modal,
  Table,
  Container,
  Spinner,
  Alert,
  Dropdown,
} from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { API_BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../utils/api'; // Import Cloudinary constants
import { PersonCircle } from 'react-bootstrap-icons';
import './Profile.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Profile = () => {
  const [profileData, setProfileData] = useState({
    id: '', // Added to store user ID
    username: '',
    email: '',
    phone: '',
    profileImageUrl: '',
    totalBalance: 0,
    totalIncome: 0,
    monthlyIncomes: [500, 650, 800, 750, 900, 1100, 1050, 1200, 1300, 1150, 1400, 1500], // Default data
    monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Default labels
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // Specific state for upload
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // For success messages
  const fileInputRef = useRef(null);
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
        setProfileData((prev) => ({
          ...prev,
          id: data.id,
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          profileImageUrl: data.profileImageUrl || data.profilePictureUrl || '',
          totalBalance: data.totalBalance || 0,
          totalIncome: data.totalIncome || 0,
          // Use fetched monthlyIncomes if available, otherwise keep default
          monthlyIncomes: data.monthlyIncomes || prev.monthlyIncomes,
          monthlyLabels: data.monthlyLabels || prev.monthlyLabels,
        }));
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Monthly Income', padding: { bottom: 20 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
    elements: { line: { tension: 0.3 } },
  };

  const chartData = {
    labels: profileData.monthlyLabels,
    datasets: [
      {
        label: 'Income',
        data: profileData.monthlyIncomes,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

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

      <Row className="align-items-center mb-4">
        <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
          <Dropdown>
            <Dropdown.Toggle
              as="div"
              style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}
              id="profile-pic-dropdown"
            >
              {profileData.profileImageUrl ? (
                <Image
                  src={profileData.profileImageUrl}
                  roundedCircle
                  className="profile-avatar"
                  style={{ width: '140px', height: '140px', objectFit: 'cover' }} // Added style
                  alt="Profile"
                />
              ) : (
                <PersonCircle
                  size={140}
                  className="text-light profile-avatar"
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
        <Col xs={12} md={8}>
          <Row>
            <Col xs={6} className="mb-3 mb-md-0" >
              <Card className="shadow-sm text-center cardeeta">
                <Card.Body>
                  <Card.Title className="mb-1">Total Balance</Card.Title>
                  <h3 className="text-primary"><i className="fas fa-coins me-2"></i>{formatCurrency(profileData.totalBalance)}</h3>
                </Card.Body>
              </Card>
            </Col>            
            <Col xs={6}>
              <Card className="shadow-sm text-center text-light cardeeta">
                <Card.Body>
                  <Card.Title className="mb-1">Total Income</Card.Title>
                  <h3 className="text-success"><i className="fas fa-money-bill-wave me-2"></i>{formatCurrency(profileData.totalIncome)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm profile-card-rounded">
            <Card.Body>
              <h5 className="mb-3">User Information</h5>
              <Table responsive bordered hover className="mb-0 profile-card-rounded ">
                <tbody>
                  <tr>
                    <th className='text-light'>Username</th>
                    <td className='text-light'>{profileData.username}</td>
                  </tr>
                  <tr>
                    <th className='text-light'>Email</th>
                    <td className='text-light'>{profileData.email}</td>
                  </tr>
                  <tr>
                    <th className='text-light'>Phone</th>
                    <td className='text-light'>{profileData.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th className='text-light'>Total Balance</th>
                    <td className='text-light'>{formatCurrency(profileData.totalBalance)}</td>
                  </tr>
                  <tr>
                    <th className='text-light'>Total Income</th>
                    <td className='text-light'>{formatCurrency(profileData.totalIncome)}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm profile-card-rounded">
            <Card.Body style={{ height: 340 }}>
              <h5 className="mb-3">Monthly Income Chart</h5>
              <div style={{ height: 260 }}>
                <Line data={chartData} options={chartOptions} height={260} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
              className="profile-avatar"
              style={{ width: 200, height: 200, objectFit: 'cover', border: '3px solid #007bff' }}
              alt="Profile"
            />
          ) : (
            <PersonCircle
              size={200}
              className="text-secondary profile-avatar"
              style={{ border: '3px solid #007bff', background: '#f8f9fa' }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;
