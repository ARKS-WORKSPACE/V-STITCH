import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const res = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shakeAnimation = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-backdrop" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="auth-modal" 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="auth-modal-close" onClick={onClose} aria-label="Close Authentication Modal">
              <i className="ri-close-line"></i>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 className="auth-modal-title">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="auth-modal-subtitle">
                {isLogin ? 'Welcome back to V-stitch' : 'Join our premium fashion circle'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  variants={shakeAnimation}
                  animate="shake"
                  style={{ 
                    color: 'var(--color-accent-rust)', 
                    fontSize: '0.8rem', 
                    marginBottom: '1.25rem', 
                    backgroundColor: 'rgba(174, 72, 45, 0.08)', 
                    padding: '0.75rem 1rem', 
                    borderRadius: 'var(--radius-sm)', 
                    borderLeft: '3px solid var(--color-accent-rust)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="ri-error-warning-line" style={{ fontSize: '1.1rem' }}></i>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    className="form-group"
                    initial={{ height: 0, opacity: 0, y: -10 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="retro_stylist"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-pill solid" style={{ width: '100%', marginTop: '0.75rem', borderRadius: '0px' }} disabled={loading}>
                {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="auth-toggle-prompt">
              {isLogin ? (
                <span>
                  New to V-stitch?
                  <button 
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className="auth-toggle-btn"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Have an account?
                  <button 
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className="auth-toggle-btn"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
