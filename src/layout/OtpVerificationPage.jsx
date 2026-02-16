// d:\quotra appwrite\src\layout\OtpVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Col, Card, Button, Spinner } from 'react-bootstrap';
import { FiMail } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

import NavbarComponent from './Navbar';import { API_BASE_URL } from '../utils/api';

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmailForVerification = location.state?.email;
  const { addToast } = useToast(); // Get addToast function

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!userEmailForVerification) {
      addToast('No user email provided. Please sign up again.', 'error');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }
    // Check OTP every 3 seconds
    let intervalId;
    const checkOtp = () => {
      setCheckingStatus(true);
      const storedOtp = localStorage.getItem('otp');
      const storedOtpExpiry = localStorage.getItem('otpExpiry');
      const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');
      // Simulate OTP verification: if user entered correct OTP and not expired, mark as verified
      if (pendingUser && pendingUser.email === userEmailForVerification) {
        // In real app, you would check backend for verification status
        if (storedOtp && storedOtpExpiry && Date.now() < parseInt(storedOtpExpiry)) {
          // If verified, redirect
          if (pendingUser.accountStatus === 'verified') {
            addToast('Account verified! You can now log in.', 'success');
            setTimeout(() => navigate('/login'), 2000);
          }
        }
      }
      setCheckingStatus(false);
    };
    intervalId = setInterval(checkOtp, 3000);
    checkOtp();
    return () => clearInterval(intervalId);
  }, [userEmailForVerification, navigate, addToast]);

  // Cooldown for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Helper to resend OTP email
  const handleResendOtp = async () => {
    if (!userEmailForVerification || resendDisabled) return;
    setLoading(true);
    try {
      // Generate new OTP and expiry
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = Date.now() + 10 * 60 * 1000; // 10 min expiry      
      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmailForVerification,
          name: userEmailForVerification, // Or a real name if you have it
          otp: otp,
          expiryTime: expiryTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP from server.');
      }

      localStorage.setItem('otp', otp);
      localStorage.setItem('otpExpiry', expiryTime);
      addToast('A new OTP has been sent to your email.', 'success');
      setResendDisabled(true);
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      addToast('Failed to resend OTP email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <NavbarComponent />
      <Container className="d-flex justify-content-center align-items-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Col md={6} lg={5} xl={4}>
          <Card className="shadow-lg border-0 text-center" style={{ borderRadius: '0.5rem' }}>
            <Card.Body className="p-4 p-md-5">
              <FiMail className="text-primary mb-3" size={50} />
              <h2 className="text-primary mb-3">Check Your Email</h2>
              <p className="text-muted text-center mb-4">
                We've sent a <strong>magic link</strong> to <strong>{userEmailForVerification || 'your email address'}</strong>.<br />
                Please click the link in your email to activate your account.<br />
                <span className="text-success">Once verified, you'll be redirected to login automatically.</span>
              </p>
              {checkingStatus && (
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span className="text-muted">Checking verification status...</span>
                </div>
              )}
              <div className="d-grid gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={handleResendOtp}
                  disabled={loading || resendDisabled}
                >
                  {loading ? (
                    <><Spinner as="span" animation="border" size="sm" /> Sending...</>
                  ) : resendDisabled ? `Resend in ${countdown}s` : 'Send Another OTP'}
                </Button>
                <Button as={Link} to="/login" variant="link" className="text-secondary">
                  Back to Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Container>
    </div>
  );
};

export default OtpVerificationPage;
