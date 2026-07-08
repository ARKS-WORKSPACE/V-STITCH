import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onClose, duration]);

  const getIconClass = () => {
    if (type === 'success') return 'ri-checkbox-circle-fill success';
    if (type === 'info') return 'ri-information-fill info';
    return 'ri-error-warning-fill error';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="toast-box"
    >
      <i className={`toast-icon ${getIconClass()}`}></i>
      <span className="toast-message">{message}</span>
      <button className="toast-close-btn" onClick={onClose} aria-label="Close Notification">
        <i className="ri-close-line"></i>
      </button>
      <div 
        className={`toast-progress-bar ${type}`}
        style={{ width: `${progress}%` }}
      />
    </motion.div>
  );
}
