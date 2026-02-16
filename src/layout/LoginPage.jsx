import { API_BASE_URL } from '../utils/api';
// d:\quotra appwrite\src\layout\LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import NavbarComponent from './Navbar';
const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { addToast } = useToast(); // Get the addToast function

  // State for form inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // For signup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Toggle between login and signup views
  const toggleView = (e) => {
    e.preventDefault();
    setIsLoginView(!isLoginView);
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Validation toasts
    if (!email.trim()) {
      addToast('Please enter your email address.', 'warning');
      return;
    }
    if (!password.trim()) {
      addToast('Please enter your password.', 'warning');
      return;
    }

    setLoading(true);
    addToast('Signing you in...', 'info');

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const token = data.access_token || data.token;
      const userId = data.user?.id || data._id;

      if (!token || !userId) {
        throw new Error('Authentication failed: Invalid response from server.');
      }

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('loggedInUser', JSON.stringify(data));
      localStorage.setItem('lastLogin', new Date().toISOString());
      window.dispatchEvent(new CustomEvent('authChange'));

      addToast('Login successful! Welcome back to Quotra.', 'success');

      // --- Log Login Activity ---
      try {
        const ipResponse = await fetch('http://ip-api.com/json');
        const ipData = await ipResponse.json();

        if (ipData.status === 'success') {
          const activityData = {
            userId: userId,
            activityType: 'login',
            details: {
              ipAddress: ipData.query,
              city: ipData.city || 'Unknown',
              country: ipData.country || 'Unknown',
              regionName: ipData.regionName || 'Unknown',
              status: ipData.status
            },
          };

          await fetch(`${API_BASE_URL}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(activityData),
          });
        }
      } catch (activityError) {
        console.warn('Activity logging failed, but login successful:', activityError);
        // Don't show error toast for activity logging failure
      }
      // --- End of Activity Logging ---

      // Role-based navigation with feedback
      const role = (data.role || (data.user && data.user.role) || '').trim().toLowerCase();
      if (role === 'admin') {
        addToast('Redirecting to admin dashboard...', 'info', 2000);
        setTimeout(() => navigate('/admin'), 500);
      } else {
        addToast('Redirecting to your dashboard...', 'info', 2000);
        setTimeout(() => navigate('/dashboard'), 500);
      }

    } catch (err) {
      console.error('Login error:', err);

      // Network/connection errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        addToast('Network error. Please check your connection and try again.', 'error');
      }
      // Server errors
      else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
        addToast('Server temporarily unavailable. Please try again in a few minutes.', 'error');
      }
      // Authentication errors
      else if (err.message.includes('Invalid') || err.message.includes('incorrect') || err.message.includes('not found')) {
        addToast('Invalid email or password. Please check your credentials.', 'error');
      }
      // Account related errors
      else if (err.message.includes('suspended') || err.message.includes('banned') || err.message.includes('disabled')) {
        addToast('Your account has been suspended. Please contact support.', 'error');
      }
      // Generic error
      else {
        addToast(err.message || 'Login failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation with specific toasts
    if (!username.trim()) {
      addToast('Please enter a username.', 'warning');
      return;
    }
    if (!email.trim()) {
      addToast('Please enter your email address.', 'warning');
      return;
    }
    if (!password.trim()) {
      addToast('Please enter a password.', 'warning');
      return;
    }
    if (!confirmPassword.trim()) {
      addToast('Please confirm your password.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match. Please check and try again.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long for security.', 'warning');
      return;
    }
    if (username.length < 3) {
      addToast('Username must be at least 3 characters long.', 'warning');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email address.', 'warning');
      return;
    }

    setLoading(true);
    addToast('Creating your account...', 'info');

    try {
      const newUser = {
        username: username.trim(),
        email: email.trim().toLowerCase(), // Normalize email to lowercase
        password,
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific signup errors
        if (errorData.message?.includes('email') && errorData.message?.includes('already')) {
          throw new Error('This email is already registered. Try logging in instead.');
        }
        if (errorData.message?.includes('username') && errorData.message?.includes('taken')) {
          throw new Error('This username is already taken. Please choose another.');
        }
        if (errorData.message?.includes('password') && errorData.message?.includes('weak')) {
          throw new Error('Password is too weak. Please use a stronger password.');
        }

        throw new Error(errorData.message || 'Account creation failed');
      }

      const data = await response.json();

      // Store authentication data
      if (data.access_token && data.user && data.user.id) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userId', data.user.id);
      } else {
        // fallback for old backend
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data._id);
      }
      localStorage.setItem('loggedInUser', JSON.stringify(data));
      localStorage.setItem('lastLogin', new Date().toISOString());
      window.dispatchEvent(new CustomEvent('authChange'));

      addToast('Account created successfully! Welcome to Quotra.', 'success');
      addToast('Redirecting to your dashboard...', 'info', 2000);

      setTimeout(() => navigate('/dashboard'), 500);

    } catch (err) {
      console.error('Signup error:', err);

      // Network/connection errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        addToast('Network error. Please check your connection and try again.', 'error');
      }
      // Server errors
      else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
        addToast('Server temporarily unavailable. Please try again in a few minutes.', 'error');
      }
      // Specific validation errors
      else if (err.message.includes('email') && err.message.includes('already')) {
        addToast('This email is already registered. Please try logging in or use a different email.', 'error');
      }
      else if (err.message.includes('username') && err.message.includes('taken')) {
        addToast('This username is already taken. Please choose a different username.', 'error');
      }
      else if (err.message.includes('password') && err.message.includes('weak')) {
        addToast('Password is too weak. Please use a stronger password with numbers and symbols.', 'warning');
      }
      // Generic error
      else {
        addToast(err.message || 'Account creation failed. Please try again.', 'error');
      }
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

  useEffect(() => {
    // ...existing session check code...

    // Check for ?view=signup or #signup in the URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'signup' || window.location.hash === '#signup') {
      setIsLoginView(false);
    }
  }, [navigate, location.pathname]); // Rerun on navigation

  return (
    <div className="Loginpage" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <NavbarComponent />
      <div className="container d-flex justify-content-center align-items-center my-4">
        <div className="form-container bg-white p-4 p-md-5 col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5" style={{ borderRadius: '0.5rem' }}>
          <div className="row align-items-center">
            {/* Removed all alert components */}
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
                  <h2>Hello</h2>
                  <p className="text-muted">Login with your email</p>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light fs-6 totoform"
                    placeholder="Email"
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
                    className="form-control form-control-lg bg-light fs-6 totoform"
                    placeholder="Password"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-3">
                  <button type="submit" className="btn btn-lg btn-primary w-100 fs-6 totobuttom" disabled={loading} style={{ borderRadius: '0.25rem' }}>
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
                  <p className="text-muted text-end">Sign up with your email and username.</p>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light fs-6 totoform"
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
                    className="form-control form-control-lg bg-light fs-6 totoform"
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
                    className="form-control form-control-lg bg-light fs-6 totoform"
                    placeholder="Password"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    required
                    disabled={loading}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className="form-control form-control-lg bg-light fs-6 totoform"
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
