// d:\quotra appwrite\src\layout\LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import emailjs from 'emailjs-com'; // Import EmailJS
import NavbarComponent from './Navbar';
import { API_BASE_URL, EMAILJS_SERVICE_ID, EMAILJS_OTP_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../utils/api'; // <-- Use your API base URL and EmailJS config from utils
const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For signup
  const [confirmPassword, setConfirmPassword] = useState(''); // For signup
  const [error, setError] = useState(''); // State for displaying errors
  const [loading, setLoading] = useState(false); // State for loading indicator
  // user state is primarily used for the session check/redirect logic
  const [user, setUser] = useState(null); // Not strictly necessary if we always redirect, but good for potential future use

  // Redirect if already logged in
  useEffect(() => {
    const storedUserJSON = localStorage.getItem('loggedInUser');
    const tokenFromStorage = localStorage.getItem('token');
    const currentPath = location.pathname;

    if (storedUserJSON && tokenFromStorage) {
      try {
        const parsedUser = JSON.parse(storedUserJSON);

        const fetchUserDataAndValidateSession = async () => {
          try {
            if (!parsedUser?.id) {
              throw new Error('User ID not found in local session. Please log in again.');
            }

            // In a real app, you'd validate the token with your backend.
            // For JSON server, we fetch the user by ID to simulate session validation.
            const response = await fetch(`${API_BASE_URL}/users/${parsedUser.id}`);

            if (!response.ok) {
              // If user not found or other server error, session is invalid.
              throw new Error('Session validation failed. User not found or server error.');
            }

            const userDataFromServer = await response.json();
            // setUser(userDataFromServer); // Set user state if needed elsewhere

            // Determine target path
            const targetPath = userDataFromServer.role === 'admin' ? '/admin' : '/dashboard';

            // Only redirect if not already on the target page or login page
            if (currentPath !== targetPath && currentPath !== '/login' && currentPath !== '/signup') {
              navigate(targetPath);
            }
          } catch (err) {
            console.error('Error validating session/fetching user data:', err);
            // Clear invalid session data
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            // Optionally, navigate to login if session is truly invalid and not already there
            if (currentPath !== '/login' && currentPath !== '/signup') {
              // navigate('/login'); // Be cautious with auto-redirects to avoid loops
            }
          }
        };

        fetchUserDataAndValidateSession();
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    }
  }, [navigate, location.pathname]); // Rerun on navigation

  // Toggle between login and signup views
  const toggleView = (e) => {
    e.preventDefault();
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  // Function to send OTP email
  const sendOtpEmail = async (userEmail, userName, otp, expiryTime) => {
    const templateParams = {
      to_email: userEmail, // Added for EmailJS
      to_name: userName,   // Assuming your template uses {{to_name}}
      passcode: otp, // Use 'passcode' to match your EmailJS template variable {{passcode}}
      time: new Date(expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format expiry time for the email
      // Add other template variables here if needed, e.g., company_logo_url: 'YOUR_LOGO_URL'
    };
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_OTP_TEMPLATE_ID,
        templateParams, // Use the template parameters object
        EMAILJS_PUBLIC_KEY
      );
      console.log('OTP email sent successfully via EmailJS!');
    } catch (emailError) {
      console.error('Raw error from EmailJS in sendOtpEmail:', emailError);
      const errorMessage = emailError?.text || emailError?.message || (typeof emailError === 'string' ? emailError : 'Unknown error sending email');
      setError(`Signup successful, but failed to send OTP email: ${errorMessage}. Please check your EmailJS configuration and template variables.`);
    }
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users. Server might be down.');
      }
      const users = await response.json();

      const matchedUser = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === email.trim().toLowerCase() || u.username && u.username.toLowerCase() === email.trim().toLowerCase()) &&
          u.password === password // IMPORTANT: HASH PASSWORDS IN PRODUCTION!
      );

      if (!matchedUser) {
        throw new Error('Invalid email/username or password.');
      }

      if (matchedUser.accountStatus === 'pending_verification') {
        navigate('/verify-otp', { state: { email: matchedUser.email } });
        // No need to throw an error here, the navigation handles it.
        // setLoading(false) will be called in finally.
        return; // Stop further execution
      }

      localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
      localStorage.setItem('token', `mock-token-for-${matchedUser.id}`);
      localStorage.setItem('userId', matchedUser.id);
      window.dispatchEvent(new CustomEvent('authChange'));

      // Log Login Activity (Client-Side Simulation for JSON Server)
      try {
        const simulatedIpAddress = `192.168.1.${Math.floor(Math.random() * 255)}`;
        const activityLogResponse = await fetch(`${API_BASE_URL}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: matchedUser.id,
            timestamp: new Date().toISOString(),
            activityType: 'login',
            details: { ipAddress: simulatedIpAddress, successful: true },
          }),
        });
        if (!activityLogResponse.ok) {
          console.warn('Failed to save login activity to JSON server.');
        } else {
          console.log(`Login activity logged for user ${matchedUser.id}`);
        }
      } catch (activityError) {
        console.error("Error during client-side activity logging:", activityError);
      }

      if (matchedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      if (!usersResponse.ok) {
        throw new Error('Failed to check existing users. Server might be down.');
      }
      const existingUsers = await usersResponse.json();

      if (existingUsers.some((u) => u.email && u.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new Error('Email already in use. Please choose another.');
      }
      if (existingUsers.some((u) => u.username && u.username.toLowerCase() === username.trim().toLowerCase())) {
        throw new Error('Username already taken. Please choose another.');
      }

      const newUserPartial = {
        username: username.trim(),
        email: email.trim(),
        password: password, // IMPORTANT: Hash this password in a real application!
        profileImageUrl: '',
        role: 'user',
        balance: 0,
        totalIncome: 0,
        totalBalance: 0,
        // Initialize other fields as needed by your data model
        accountStatus: 'pending_verification', // Set directly
      };

      // POST the new user without OTP fields first to get an ID from json-server
      const createResp = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPartial),
      });

      if (!createResp.ok) {
        const errorData = await createResp.json().catch(() => ({}));
        throw new Error(errorData.message || `Signup failed with status: ${createResp.status}`);
      }

      const createdUserWithId = await createResp.json(); // User with ID from json-server

      // Generate OTP (In a real app, backend generates this and stores it hashed)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiryTime = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

      // Now, update the user with OTP details using PUT
      const userToUpdateWithOtp = {
        ...createdUserWithId, // Contains all fields from newUserPartial + id
        otp: generatedOtp, // Store plain for json-server simulation; HASH IN REAL BACKEND
        otpExpires: otpExpiryTime.toISOString(),
        // accountStatus is already 'pending_verification' from newUserPartial
      };

      const updateUserResp = await fetch(`${API_BASE_URL}/users/${createdUserWithId.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToUpdateWithOtp),
      });

      if (!updateUserResp.ok) {
        // Attempt to roll back user creation if OTP update fails (best effort for json-server)
        await fetch(`${API_BASE_URL}/users/${createdUserWithId.id}`, { method: 'DELETE' });
        throw new Error('Failed to save OTP details for the new user. Signup rolled back.');
      }

      await sendOtpEmail(createdUserWithId.email, createdUserWithId.username, generatedOtp, otpExpiryTime); // <-- FIX: Use otpExpiryTime

      alert('Signup successful! Please check your email for an OTP to verify your account.');
      navigate('/verify-otp', { state: { email: createdUserWithId.email } });

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect for loading CoinGecko widget script
  useEffect(() => {
    const scriptId = 'coingecko-marquee-widget-script';
    // Check if the script is already added to the page
    if (document.getElementById(scriptId)) {
      return; // Script already loaded, do nothing
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Optional: Cleanup function if you want to remove the script when the component unmounts.
    // For widget scripts that are meant to be global, this might not be necessary.
    // return () => {
    //   const existingScript = document.getElementById(scriptId);
    //   if (existingScript && existingScript.parentNode) {
    //     existingScript.parentNode.removeChild(existingScript);
    //   }
    // };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="Loginpage" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <NavbarComponent />
      <div className="container d-flex justify-content-center align-items-center my-4">
        <div className="form-container bg-white p-4 p-md-5 shadow-lg col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5" style={{ borderRadius: '0.5rem' }}>
          <div className="row align-items-center">
            {error && <div className="alert alert-danger w-100 mb-3">{error}</div>}
            {loading && (
              <div className="text-center w-100 my-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {isLoginView ? (
              <form onSubmit={handleLoginSubmit} className="w-100">
                <div className="header-text mb-4 text-primary text-end">
                  <h2>Hello, Again!</h2>
                  <p className="text-muted">Welcome back, you've been missed.</p>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light fs-6"
                    placeholder="Email address or Username"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-1">
                  <input
                    type="password"
                    className="form-control form-control-lg bg-light fs-6"
                    placeholder="Password"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-5 d-flex justify-content-between">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="formCheck" disabled={loading} />
                    <label htmlFor="formCheck" className="form-check-label text-secondary">
                      <small>Remember Me</small>
                    </label>
                  </div>
                  <div className="forgot text-secondary">
                   
                  </div>
                </div>
                <div className="input-group mb-3">
                  <button type="submit" className="btn btn-lg btn-primary w-100 fs-6" disabled={loading} style={{ borderRadius: '0.25rem' }}>
                    Login
                  </button>
                </div>
                <div className="row">
                  <small className="text-secondary">
                    Don't have an account? <a href="#" onClick={toggleView} className="text-primary fw-bold">Sign Up</a>
                  </small>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="w-100">
                <div className="header-text mb-4">
                  <h2 className="text-primary text-end">Create Account</h2>
                  <p className="text-muted text-end">Let's get you started.</p>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light fs-6"
                    placeholder="Username"
                    value={username}
                    onChange={handleInputChange(setUsername)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control form-control-lg bg-light fs-6"
                    placeholder="Email address"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className="form-control form-control-lg bg-light fs-6"
                    placeholder="Password"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-4">
                  <input
                    type="password"
                    className="form-control form-control-lg bg-light fs-6"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-3">
                  <button type="submit" className="btn btn-lg btn-primary w-100 fs-6" disabled={loading} style={{ borderRadius: '0.25rem' }}>
                    Sign Up
                  </button>
                </div>
                <div className="row">
                  <small className="text-secondary">
                    Already have an account? <a href="#" onClick={toggleView} className="text-primary fw-bold">Login</a>
                  </small>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
{/* New Container as requested */}
<div className="container my-4">
  <div
    className="bg-primary rounded-5 d-flex flex-column flex-md-row align-items-center justify-content-between p-4"
    style={{
      height: '50vh',
      width: '100%',
      borderRadius: '0.25rem',
      minHeight: 250,
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Left Side: Animated Bouncing & Pulsing Circle */}
    <div className="flex-fill d-flex pt-5 justify-content-center align-items-center mb-4 mb-md-0" style={{ minWidth: 180, minHeight: 180 }}>
      <div className="bouncing-pulse-circle"></div>
    </div>
    {/* Right Side: Encouraging Text */}
    <div className="flex-fill text-center text-md-end">
      <h3 className="text-white fw-bold mb-0" style={{ lineHeight: 1.3 }}>
        Secure your future today.<br className="d-none d-md-block" />
        Invest with us for guaranteed growth and peace of mind.
      </h3>
    </div>
    {/* Animation Styles */}
    <style>
      {`
        .bouncing-pulse-circle {
          width: 90px;
          height: 90px;
          border: 5px solid #fff;
          border-radius: 50%;
          background: transparent;
          animation: bouncePulse 5s cubic-bezier(.68,-0.55,.27,1.55) infinite;
          box-shadow: 0 0 0 0 rgba(255,255,255,0.5);
        }
        @keyframes bouncePulse {
          0%   { transform: translateY(0);    box-shadow: 0 0 0 0 rgba(255,255,255,0.5);}
          10%  { transform: translateY(-60px);}
          20%  { transform: translateY(0);}
          30%  { transform: translateY(-40px);}
          40%  { transform: translateY(0);}
          50%  { transform: translateY(-20px);}
          60%  { transform: translateY(0);}
          70%  { transform: translateY(-60px);}
          75%  { 
            transform: translateY(-60px) scale(1.15);
            box-shadow: 0 0 0 15px rgba(255,255,255,0.2);
          }
          78%  { 
            transform: translateY(-60px) scale(1.25);
            box-shadow: 0 0 0 25px rgba(255,255,255,0.15);
          }
          81%  { 
            transform: translateY(-60px) scale(1.15);
            box-shadow: 0 0 0 15px rgba(255,255,255,0.2);
          }
          84%  { 
            transform: translateY(-60px) scale(1.25);
            box-shadow: 0 0 0 25px rgba(255,255,255,0.15);
          }
          87%  { 
            transform: translateY(-60px) scale(1.15);
            box-shadow: 0 0 0 15px rgba(255,255,255,0.2);
          }
          90%  { 
            transform: translateY(-60px) scale(1);
            box-shadow: 0 0 0 0 rgba(255,255,255,0.5);
          }
          100% { transform: translateY(0); box-shadow: 0 0 0 0 rgba(255,255,255,0.5);}
        }
      `}
    </style>
  </div>
</div>


      {/* CoinGecko Widget Section */}
      <div className="container my-4">
        {/* The script for CoinGecko widgets is loaded in the useEffect hook above. */}
        {/* You can customize the widget attributes (coin-ids, currency, colors, etc.) as needed. */}
        <coingecko-coin-price-marquee-widget
          coin-ids="bitcoin,ethereum,litecoin,cardano,solana,dogecoin" // Example coins
          currency="usd"
          background-color="#f8f9fa" // Match page background or choose another (e.g., #ffffff or transparent)
          locale="en"
          font-color="#212529" // A dark font color for good readability
        ></coingecko-coin-price-marquee-widget>
        <small className="d-block text-center mt-2 text-muted">
          Live rates powered by <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko</a>.
        </small>
      </div>
    </div>
  );
};

export default LoginPage;
