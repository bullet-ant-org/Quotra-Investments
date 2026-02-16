import React, { useEffect, useState } from 'react';
import './Toast.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type, onRemove, duration }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [timestamp] = useState(new Date());
  const onRemoveRef = React.useRef(onRemove);
  const fadeOutTimerRef = React.useRef(null);
  const removeTimerRef = React.useRef(null);

  // Keep onRemove ref updated without re-triggering effects
  useEffect(() => {
    onRemoveRef.current = onRemove;
  }, [onRemove]);

  useEffect(() => {
    // Set up auto-hide timers
    fadeOutTimerRef.current = setTimeout(() => {
      setIsFadingOut(true);
    }, duration - 500); // Start fading out 500ms before removal

    removeTimerRef.current = setTimeout(() => {
      onRemoveRef.current();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimerRef.current);
      clearTimeout(removeTimerRef.current);
    };
  }, [duration]);

  const handleRemove = () => {
    // Clear auto-hide timers and start manual removal
    clearTimeout(fadeOutTimerRef.current);
    clearTimeout(removeTimerRef.current);
    setIsFadingOut(true);
    setTimeout(() => {
      onRemoveRef.current();
    }, 500); // Match fade-out duration
  };

  const getIconAndColor = (type) => {
    const icons = {
      success: faCheckCircle,
      error: faTimesCircle,
      warning: faExclamationTriangle,
      info: faInfoCircle,
    };

    const colors = {
      success: 'text-success',
      error: 'text-danger',
      warning: 'text-warning',
      info: 'text-primary',
    };

    return {
      icon: icons[type] || icons.info,
      colorClass: colors[type] || colors.info,
      title: type.charAt(0).toUpperCase() + type.slice(1)
    };
  };

  const { icon, colorClass, title } = getIconAndColor(type);

  const getTimeAgo = () => {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    return 'a while ago';
  };

  return (
    <div className={`toast fade show ${isFadingOut ? 'fade-out' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header py-2">
        <FontAwesomeIcon icon={icon} className={`fa-lg me-2 ${colorClass}`} />
        <strong className="me-auto">{title}</strong>
        <small className="text-body-secondary">{getTimeAgo()}</small>
        <button type="button" className="btn-close" onClick={handleRemove} aria-label="Close"></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

export default Toast;