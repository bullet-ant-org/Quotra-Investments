// c:\Users\Bullet Ant\Desktop\CODING\quotra appwrite\src\layout\LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import featuredImage from '../assets/1.png';
import NavbarComponent from './Navbar';
import { API_BASE_URL } from '../utils/api'; // <-- Use your API base URL from utils

const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For signup
  const [confirmPassword, setConfirmPassword] = useState(''); // For signup
  const [error, setError] = useState(''); // State for displaying errors
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [user, setUser] = useState(null); // State for storing user data, though primarily used for session check

  // Redirect if already logged in
  useEffect(() => {
    const storedUserJSON = localStorage.getItem('loggedInUser');
    const tokenFromStorage = localStorage.getItem('token'); // Get the separate token

    if (storedUserJSON && tokenFromStorage) {
      try {
        const parsedUser = JSON.parse(storedUserJSON); // This is the user object from localStorage

        const fetchUserData = async () => {
          try {
            // We should use the tokenFromStorage which is already confirmed to exist.
            if (!tokenFromStorage) { // This check is for robustness.
              throw new Error('No token found. Please log in again.');
            }

            // Example: Fetch user by ID from JSON server
            const userId = parsedUser?.id; // Use the ID from the parsedUser object
            if (!userId) {
              throw new Error('No user ID found in local session data.');
            }
            
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({})); // Graceful parse
              throw new Error(errorData.message || 'Failed to fetch user data.');
            }

            const userDataFromServer = await response.json();
            setUser(userDataFromServer); // Set user state with fresh data from server
            // If user data is successfully fetched, assume session is valid and navigate
            navigate('/dashboard');
          } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err.message || 'Failed to load user data. Session might be invalid.');
            // Clear localStorage if fetching user data fails, as session might be invalid
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('token');
            localStorage.removeItem('user'); 
            localStorage.removeItem('userId');
          }
        };
        fetchUserData();
      } catch (e) {
        console.error('Error parsing stored user:', e);
        setError('Error processing local session. Please log in again.');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      }
    }
  }, [navigate]);

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

  // Handle input changes
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Fetch all users and check credentials
      const response = await fetch(`${API_BASE_URL}/users`); // GET /users
      if (!response.ok) {
        let errorMessage = 'Failed to fetch users. Server might be down.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        } catch (parseError) { /* Ignore if response body is not JSON or empty */ }
        throw new Error(errorMessage);
      }
      const users = await response.json();

      const matchedUser = users.find(
        (u) =>
          (u.email === email.trim() || u.username === email.trim()) && // Added trim() for robustness
          u.password === password // Password check is direct; in real apps, this would be hashed
      );

      if (!matchedUser) {
        throw new Error('Invalid email/username or password.');
      }

      // Save user data to localStorage (simulate login)
      localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
      localStorage.setItem('token', `mock-token-for-${matchedUser.id}`); // Mock token
      localStorage.setItem('userId', matchedUser.id); // Store userId for easy access
      // localStorage.setItem('user', JSON.stringify(matchedUser)); // 'user' is redundant if 'loggedInUser' is used consistently

      window.dispatchEvent(new CustomEvent('authChange'));
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

    try {
      // Check if user/email already exists
      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      if (!usersResponse.ok) {
        throw new Error('Failed to check existing users. Server might be down.');
      }
      const existingUsers = await usersResponse.json();

      if (existingUsers.some((u) => u.email === email.trim())) {
        throw new Error('Email already in use. Please choose another.');
      }
      if (existingUsers.some((u) => u.username === username.trim())) {
        throw new Error('Username already taken. Please choose another.');
      }

      // Register new user
      const newUser = {
        // id: Math.random().toString(36).slice(2, 8), // Let JSON server assign ID
        username: username.trim(),
        email: email.trim(),
        password: password, // In a real app, hash this password
        profileImageUrl: '', // Default profile picture
        role: 'user', // Default role
        balance: 0,
        totalIncome: 0,
        totalBalance: 0,
        currentPlanId: null,
        currentInvestmentAmount: 0,
        profitPotential: 0,
        tradeStartTime: null,
        tradeDurationDays: 0,
        investmentStatus: 'none',
        accruedProfit: 0,
      };

      const createResp = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!createResp.ok) {
        const errorData = await createResp.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed');
      }

      alert('Signup successful! You can now log in.');
      setIsLoginView(true); // Switch to login view
      // Clear form fields
      setEmail('');
      setPassword('');
      setUsername('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Loginpage">
      <NavbarComponent />
      <div className="container d-flex justify-content-center align-items-center mt-4">
        <div className="row border rounded-5 p-3 bg-white shadow box-area">
          {/* Left Box */}
          <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box">
            <div className="featured-image mb-3">
              <img src={featuredImage} className="img-fluid" alt="Featured" />
            </div>
            <p className="left-box-title">Be Verified</p>
            <small className="left-box-subtitle">
              Join experienced Traders on this platform.
            </small>
          </div>

          {/* Right Box */}
          <div className="col-md-6 right-box">
            <div className="row align-items-center">
              {error && <div className="alert alert-danger w-100">{error}</div>}
              {loading && (
                <div className="text-center w-100">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {isLoginView ? (
                <form onSubmit={handleLoginSubmit} className="w-100">
                  <div className="header-text mb-4">
                    <h2>Hello, Again</h2>
                    <p>We are happy to have you back.</p>
                  </div>
                  <div className="input-group mb-3">
                    <input
                      type="text" // Changed to text to allow username or email
                      className="form-control form-control-lg bg-light fs-6"
                      placeholder="Email address or Username"
                      value={email}
                      onChange={handleInputChange(setEmail)}
                      required
                      disabled={loading}
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
                    />
                  </div>
                  <div className="input-group mb-5 d-flex justify-content-between">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="formCheck" disabled={loading} />
                      <label htmlFor="formCheck" className="form-check-label text-secondary">
                        <small>Remember Me</small>
                      </label>
                    </div>
                    <div className="forgot">
                      <small>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          Forgot Password?
                        </a>
                      </small>
                    </div>
                  </div>
                  <div className="input-group mb-3">
                    <button type="submit" className="btn btn-lg btn-primary w-100 fs-6" disabled={loading}>
                      Login
                    </button>
                  </div>
                  <div className="row">
                    <small>
                      Don't have an account? <a href="#" onClick={toggleView}>Sign Up</a>
                    </small>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="w-100">
                  <div className="header-text mb-4">
                    <h2>Create Account</h2>
                    <p>Let's get you started.</p>
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
                    />
                  </div>
                  <div className="input-group mb-3">
                    <button type="submit" className="btn btn-lg btn-primary w-100 fs-6" disabled={loading}>
                      Sign Up
                    </button>
                  </div>
                  <div className="row">
                    <small>
                      Already have an account? <a href="#" onClick={toggleView}>Login</a>
                    </small>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
