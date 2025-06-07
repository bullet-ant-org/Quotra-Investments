import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

const NotFoundPage = () => {
  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Soft gradient background
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const iconStyle = {
    fontSize: '6rem', // Large icon
    color: '#ffc107', // Warning color (Bootstrap yellow)
    marginBottom: '20px',
    animation: 'pulse 2s infinite',
  };

  const titleStyle = {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)', // Responsive font size
    fontWeight: 'bold',
    color: '#343a40', // Dark gray
    marginBottom: '10px',
  };

  const messageStyle = {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: '#6c757d', // Muted gray
    marginBottom: '30px',
    maxWidth: '600px',
  };

  const buttonStyle = {
    padding: '12px 30px',
    fontSize: '1.1rem',
    borderRadius: '50px', // Pill shape
    fontWeight: '600',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  };

  // Simple pulse animation for the icon
  const keyframes = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={pageStyle}>
        <ExclamationTriangleFill style={iconStyle} />
        <h1 style={titleStyle}>404 - Page Not Found</h1>
        <p style={messageStyle}>
          Oops! The page you're looking for doesn't seem to exist. It might have been moved, deleted, or maybe you just mistyped the URL.
        </p>
        <Button as={Link} to="/" variant="primary" style={buttonStyle} className="shadow-sm">
          Go Back to Homepage
        </Button>
      </div>
    </>
  );
};

export default NotFoundPage;