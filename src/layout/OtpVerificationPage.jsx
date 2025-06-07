// d:\quotra appwrite\src\layout\OtpVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import emailjs from '@emailjs/browser'; // Import EmailJS
import { API_BASE_URL, // Keep API_BASE_URL for JSON server calls
  EMAILJS_SERVICE_ID,
  EMAILJS_OTP_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY } from '../utils/api';
import NavbarComponent from './Navbar'; // Assuming you want the navbar here too
const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmailForVerification = location.state?.email;

  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = React.useRef([]);

  useEffect(() => {
    if (!userEmailForVerification) {
      setError('No user email provided for verification. Please try signing up again.');
      // Consider redirecting to signup or login after a delay
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [userEmailForVerification, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const startResendCooldown = () => {
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown
  };

  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (error) setError('');
    if (success) setSuccess('');

    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Take the last digit if multiple are pasted/typed
    setOtp(newOtp);

    // Move to next input if a digit is entered
    if (value && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[index] === '' && index > 0 && inputRefs.current[index - 1]) {
        // If current is empty and not the first input, move to previous and clear it
        inputRefs.current[index - 1].focus();
        newOtp[index - 1] = '';
      } else {
        // Clear current input
        newOtp[index] = '';
      }
      setOtp(newOtp);
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (/^\d+$/.test(pasteData)) { // Check if pasted data is all digits
      const newOtp = [...otp];
      for (let i = 0; i < OTP_LENGTH; i++) {
        newOtp[i] = pasteData[i] || ''; // Fill OTP array with pasted data
      }
      setOtp(newOtp);
      // Optionally, focus the last filled input or the next empty one
      inputRefs.current[Math.min(pasteData.length, OTP_LENGTH - 1)]?.focus();
    }
    e.preventDefault(); // Prevent default paste behavior
  };
  const findUserByEmail = async (email) => {
    // In a real backend, you'd have an endpoint like /users/by-email?email=...
    const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data.');
    }
    const users = await response.json(); // JSON Server returns an array for queries
    return users.length > 0 ? users[0] : null;
  };

  // Function to send new OTP email (using EmailJS)
  const sendNewOtpEmail = async (userEmail, userName, newOtp, expiryTime) => {
    const templateParams = {
      to_email: userEmail, // Ensure your template uses {{to_email}}
      to_name: userName, // Ensure your template uses {{to_name}}
      passcode: newOtp,  // Use 'passcode' to match your EmailJS template variable {{passcode}}
      time: new Date(expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Assuming your EmailJS template uses {{time}}
      // Add other template variables here if needed, matching your EmailJS template
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_OTP_TEMPLATE_ID, // Ensure this is the correct template ID for OTPs
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      console.log('New OTP email sent successfully via EmailJS!');
    } catch (emailError) {
      console.error('Raw error from EmailJS in sendNewOtpEmail:', emailError);
      const errorMessage = emailError?.text || emailError?.message || (typeof emailError === 'string' ? emailError : 'Unknown error sending email');
      throw new Error(`Failed to send new OTP email: ${errorMessage}`);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== OTP_LENGTH || !/^\d{6}$/.test(enteredOtp)) {
      setError(`Please enter a valid ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    setLoading(true);

    try {
      const user = await findUserByEmail(userEmailForVerification);
      if (!user) {
        throw new Error('User not found. Please try signing up again.');
      }

      if (user.accountStatus === 'verified') {
        setSuccess('Account already verified. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // --- OTP Verification Logic (Simulated - Backend should do this) ---
      // In a real backend, you would compare the HASHED entered OTP with the stored HASHED OTP
      // and perform the time check securely on the server.
      const now = new Date();
      const otpExpiryTime = new Date(user.otpExpires);

      if (user.otp !== enteredOtp) { // Comparing plain text OTPs for JSON server simulation
        throw new Error('Invalid OTP. Please try again.');
      }
      if (now > otpExpiryTime) {
        throw new Error('OTP has expired. Please request a new one.');
      }
      // --- End of Simulated Logic ---

      // Update user accountStatus to 'verified'
      // Clear OTP and expiry fields after successful verification
      const updatedUser = { ...user, accountStatus: 'verified', otp: '', otpExpires: null };
      const updateResponse = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update account status. Please try again.');
      }

      setSuccess('Account verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    if (!userEmailForVerification || resendDisabled) return;

    setLoading(true);
    try {
      const user = await findUserByEmail(userEmailForVerification);
      if (!user) {
        throw new Error('User not found. Cannot resend OTP.');
      }
      if (user.accountStatus === 'verified') {
        setSuccess('Account already verified. You can log in.');
        return;
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate new OTP
      const newOtpExpiryTime = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

      const updatedUserWithNewOtp = {
        ...user,
        otp: newOtp,
        otpExpires: newOtpExpiryTime.toISOString(),
      };

      const updateUserResp = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserWithNewOtp),
      });

      if (!updateUserResp.ok) {
        throw new Error('Failed to update OTP details for resend.');
      }

      await sendNewOtpEmail(user.email, user.username, newOtp, newOtpExpiryTime); // Pass expiryTime
      setSuccess('A new OTP has been sent to your email.'); // Set success message after sending
      startResendCooldown();

    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <NavbarComponent />
      <Container className="d-flex justify-content-center align-items-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Col md={6} lg={5} xl={4}>
          <Card className="shadow-lg border-0" style={{ borderRadius: '0.5rem' }}>
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-primary text-center mb-4">Verify Your Account</h2>
              <p className="text-muted text-center mb-4">
                An OTP has been sent to <strong>{userEmailForVerification || 'your email'}</strong>.
                Please enter it below.
              </p>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleVerifyOtp}>
                <Form.Group className="mb-3" controlId="otpInput">
                  <Form.Label className="text-center d-block">One-Time Password (OTP)</Form.Label>
                  <div className="d-flex justify-content-center gap-2" onPaste={handlePaste}>
                    {otp.map((data, index) => {
                      return (
                        <Form.Control
                          key={index}
                          type="text" // Use text to allow single character input and better control
                          inputMode="numeric" // Hint for numeric keyboard on mobile
                          value={data}
                          onChange={(e) => handleOtpChange(e.target, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onFocus={(e) => e.target.select()}
                          ref={(el) => (inputRefs.current[index] = el)}
                          maxLength="1"
                          className="text-center fs-5 bg-light otp-input-box"
                          style={{
                            width: '3rem', // Adjust size as needed
                            height: '3.5rem', // Adjust size as needed
                            borderRadius: '0.25rem',
                          }}
                          disabled={loading}
                        />
                      );
                    })}
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading} style={{ borderRadius: '0.25rem' }}>
                  {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Verify OTP'}
                </Button>
              </Form>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={loading || resendDisabled}
                  className="text-secondary text-decoration-none"
                >
                  {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
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
