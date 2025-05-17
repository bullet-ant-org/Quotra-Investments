import React from 'react';

const CustomSpinner = ({ text = "Loading..." }) => (
  <div className="custom-spinner-container">
    <div className="custom-spinner" />
    <div className="custom-spinner-text">{text}</div>
  </div>
);

export default CustomSpinner;