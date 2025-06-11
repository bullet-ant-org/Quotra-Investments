import React from 'react';
import Logo from '../assets/logo-no-background1.png';
// It's recommended to move these styles to a CSS file (e.g., CustomSpinner.css or your global styles)
// For this example, we'll assume the classes .custom-spinner-container, .spinner-logo-group,
// .custom-spinner, .custom-spinner-logo, and .custom-spinner-text are defined in an imported CSS file.

const CustomSpinner = ({ text = "Securing Your Financial Future" }) => (
  <div className="custom-spinner-container">
    <div className="spinner-logo-group"> {/* Grouping spinner and logo */}
      <div className="custom-spinner" />
      <img src={Logo} alt="Company Logo" className="custom-spinner-logo" />
    </div>
    <div className="custom-spinner-text">{text}</div>
  </div>
);

export default CustomSpinner;