import React, { StrictMode, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';

import CustomSpinner from './components/CustomSpinner'; // Assuming you have a CustomSpinner component
import { Container, Row, Col } from 'react-bootstrap';

const LoadingScreen = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) {
    return <App />;
  }

  return (
    <div className="custom-spinner-container">
      {/* Adjusted Spinner Position */}
      <div style={{ marginTop: '10vh' }}> 
        <CustomSpinner />
      </div>

      
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingScreen />
  </StrictMode>,
);

/*
  Note:
  1. You'll need to create or adjust your `CustomSpinner` component.
  2. Replace `/logo-placeholder.png` with the actual path to your company logo.
  3. Adjust styling as needed to match your brand.
*/
