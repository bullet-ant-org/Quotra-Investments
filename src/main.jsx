import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.jsx'
import CustomSpinner from './components/CustomSpinner';
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA

// Your Google reCAPTCHA v2 Site Key
// IMPORTANT: Replace with your actual Site Key if this is not correct
const RECAPTCHA_SITE_KEY = "6Lc9MT4rAAAAAEqxA9jgcy5bRmzx7X8oZEG25ND0";

// Component to handle initial loading and CAPTCHA check
const RootWithLoader = () => {
  const [showLoader, setShowLoader] = useState(true);
  // Initialize captcha state from sessionStorage
  const [isCaptchaSolved, setIsCaptchaSolved] = useState(
    sessionStorage.getItem('captchaSolvedInSession') === 'true'
  );

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => setShowLoader(false), 3000); // 3 seconds delay
    return () => clearTimeout(timer);
  }, []);
  
  // Effect to clear sessionStorage on component unmount (optional, for strict cleanup)
  // useEffect(() => {
  //   return () => {
  //     sessionStorage.removeItem('captchaSolvedInSession');
  //   };
  // }, []);

  // Handler for when the CAPTCHA is solved
  const handleCaptchaChange = (token) => {
    if (token) {
      setIsCaptchaSolved(true);
      sessionStorage.setItem('captchaSolvedInSession', 'true'); // Store success in session
    } else {
      setIsCaptchaSolved(false); // Handle case where token expires or is reset
      sessionStorage.removeItem('captchaSolvedInSession'); // Clear from session
    }
  };

  // Render logic based on loading and CAPTCHA state
  if (showLoader) {
    return <CustomSpinner text="Loading Quotra..." />;
  }

  // Check isCaptchaSolved state, which is now aware of the session
  if (!isCaptchaSolved) { 
    // Show CAPTCHA if loader is done and CAPTCHA is not solved
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleCaptchaChange}
          onExpired={() => {
            setIsCaptchaSolved(false);
            sessionStorage.removeItem('captchaSolvedInSession'); // Clear from session on expiry
          }}
        />
      </div>
    );
  }

  // Render the main App if loader is done and CAPTCHA is solved
  return <App />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootWithLoader />
  </StrictMode>,
)
