import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AccountView({
  API_BASE,
  user,
  token,
  onUserUpdate,
  addToast,
  setActiveView
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'shipping', 'security'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      addToast('Profile picture must be less than 1MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePic: base64String })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to upload photo');
        onUserUpdate(data);
        addToast('Profile picture updated successfully', 'success');
      } catch (err) {
        addToast(err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Shipping details state
  const [shippingForm, setShippingForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    shippingAddress: user?.shippingAddress || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    country: user?.country || 'United States'
  });
  const [shippingSaving, setShippingSaving] = useState(false);

  // Account settings/security state
  const [securityForm, setSecurityForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Sync forms if user object updates
  useEffect(() => {
    if (user) {
      setShippingForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        shippingAddress: user.shippingAddress || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'United States'
      });
      setSecurityForm((prev) => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders' && token) {
      fetchOrders();
    }
  }, [activeTab, token]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to retrieve order history');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error loading orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setShippingSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shippingForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update shipping details');
      
      onUserUpdate(data);
      addToast('Default shipping details saved successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setShippingSaving(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setSecuritySaving(true);
    try {
      const payload = {
        username: securityForm.username,
        email: securityForm.email
      };
      if (securityForm.newPassword) {
        payload.currentPassword = securityForm.currentPassword;
        payload.newPassword = securityForm.newPassword;
      }

      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update account settings');

      onUserUpdate(data);
      setSecurityForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordChange(false);
      addToast('Account settings updated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSecuritySaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container account-page-wrapper">
      <div className="account-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div className="profile-pic-container" style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
          {user?.profilePic ? (
            <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </span>
          )}
          <label htmlFor="profile-pic-input" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '0.65rem', textAlign: 'center', padding: '4px 0', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="upload-overlay">
            Edit
          </label>
        </div>
        <input 
          id="profile-pic-input"
          type="file" 
          accept="image/*" 
          onChange={handleProfilePicChange} 
          style={{ display: 'none' }} 
        />
        <div>
          <h1 style={{ marginBottom: '2px' }}>My Account</h1>
          <p>Welcome back, <strong style={{ color: 'var(--color-text-primary)' }}>{user?.username}</strong>. Manage your orders, default shipping details, and account credentials.</p>
        </div>
      </div>

      <div className="account-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Horizontal Navigation Tabs */}
        <nav className="account-tabs-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }}>
          <button 
            className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="ri-file-list-3-line"></i> Order History
          </button>
          <button 
            className={`account-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            <i className="ri-map-pin-line"></i> Default Shipping Address
          </button>
          <button 
            className={`account-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="ri-lock-line"></i> Account Settings
          </button>
        </nav>

        {/* Content Pane */}
        <main className="account-content-pane">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="account-tab-content"
            >
              <h2 className="tab-title">Order History</h2>
              
              {ordersLoading ? (
                <div className="stitch-loader-container"><div className="stitch-loader"></div></div>
              ) : orders.length === 0 ? (
                <div className="account-empty-state">
                  <i className="ri-shopping-bag-2-line empty-icon"></i>
                  <h3>No Orders Found</h3>
                  <p>You haven't placed any orders with us yet. Start exploring our collections to find your perfect staples.</p>
                  <button className="btn-pill solid" onClick={() => setActiveView('shop')}>
                    Explore Collections <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-item-card">
                      {/* Order Header Summary */}
                      <div 
                        className="order-card-header" 
                        onClick={() => toggleOrderExpand(order._id)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '15px 20px', userSelect: 'none' }}
                      >
                        <div className="order-header-col">
                          <span className="order-lbl">Order Placed</span>
                          <span className="order-val">{formatDate(order.createdAt || order.dateOrdered)}</span>
                        </div>
                        <div className="order-header-col">
                          <span className="order-lbl">Total Amount</span>
                          <span className="order-val font-semibold">${order.totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="order-header-col">
                          <span className="order-lbl">Ship To</span>
                          <span className="order-val italic">{order.customerName || `${user?.firstName || ''} ${user?.lastName || ''}`}</span>
                        </div>
                        <div className="order-header-col order-id-col" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                          <span className="order-lbl">Order ID</span>
                          <span className="order-val mono">{order._id}</span>
                        </div>
                        <div style={{ paddingLeft: '10px', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                          <i className={expandedOrders[order._id] ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                        </div>
                      </div>

                      {/* Order Items Body */}
                      {expandedOrders[order._id] && (
                        <div className="order-card-body">
                          <div className="order-products-list">
                            {order.items?.map((item, idx) => (
                              <div key={item.productId || idx} className="order-product-row">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="order-prod-img" 
                                />
                                <div className="order-prod-info">
                                  <h4>{item.title}</h4>
                                  <p className="order-prod-meta">
                                    Color: {item.color} • Size: {item.size} • Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="order-prod-price">
                                  ${item.price * item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping details footer */}
                          <div className="order-shipping-summary">
                            <div className="shipping-box">
                              <h5>Delivery Address</h5>
                              <p>{order.shippingAddress}</p>
                              <p>{order.city}, {order.postalCode}</p>
                              <p>{order.country}</p>
                            </div>
                            <div className="payment-box">
                              <h5>Payment Method</h5>
                              <p className="capitalize">
                                {order.paymentCardName ? `Card ending in ••••` : 'Cash on Delivery'}
                              </p>
                              {order.paymentCardName && <span className="card-name-label">{order.paymentCardName}</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: DEFAULT SHIPPING DETAILS */}
          {activeTab === 'shipping' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="account-tab-content"
            >
              <h2 className="tab-title">Default Shipping Address</h2>
              <p className="tab-subtitle">Save your shipping address below to speed up your checkout experience.</p>
              
              <form onSubmit={handleShippingSubmit} className="account-form">
                <div className="form-grid-row">
                  <div className="input-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      placeholder="First Name"
                      value={shippingForm.firstName}
                      onChange={(e) => setShippingForm({...shippingForm, firstName: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Last Name"
                      value={shippingForm.lastName}
                      onChange={(e) => setShippingForm({...shippingForm, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    placeholder="Street Address, Apt, Suite"
                    required
                    value={shippingForm.shippingAddress}
                    onChange={(e) => setShippingForm({...shippingForm, shippingAddress: e.target.value})}
                  />
                </div>

                <div className="form-grid-row">
                  <div className="input-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      placeholder="City"
                      required
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>Postal Code</label>
                    <input 
                      type="text" 
                      placeholder="Postal Code"
                      required
                      value={shippingForm.postalCode}
                      onChange={(e) => setShippingForm({...shippingForm, postalCode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Country</label>
                  <select 
                    value={shippingForm.country}
                    onChange={(e) => setShippingForm({...shippingForm, country: e.target.value})}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="India">India</option>
                  </select>
                </div>

                <button type="submit" disabled={shippingSaving} className="btn-pill solid account-submit-btn">
                  {shippingSaving ? 'Saving Address...' : 'Save Default Address'}
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 3: ACCOUNT SECURITY */}
          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="account-tab-content"
            >
              <h2 className="tab-title">Account Settings</h2>
              <p className="tab-subtitle">Update your account credentials and personal profile.</p>

              <form onSubmit={handleSecuritySubmit} className="account-form">
                {/* Profile Pic Row Upload Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', border: '1px solid var(--color-border)', marginBottom: '0.5rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                        {user?.username ? user.username[0].toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)', margin: 0 }}>Profile Picture</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>JPEG, PNG, or WEBP up to 1MB</p>
                    <div style={{ marginTop: '4px' }}>
                      <label 
                        htmlFor="profile-pic-input-settings" 
                        className="btn-pill outlined"
                        style={{ padding: '6px 12px', fontSize: '0.7rem', cursor: 'pointer', display: 'inline-block', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}
                      >
                        Choose Photo
                      </label>
                      <input 
                        id="profile-pic-input-settings"
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePicChange} 
                        style={{ display: 'none' }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    required
                    value={securityForm.username}
                    onChange={(e) => setSecurityForm({...securityForm, username: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={securityForm.email}
                    onChange={(e) => setSecurityForm({...securityForm, email: e.target.value})}
                  />
                </div>

                {/* Collapsible Change Password section */}
                {!showPasswordChange ? (
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      className="btn-pill outlined"
                      onClick={() => setShowPasswordChange(true)}
                      style={{ border: '1.5px solid var(--color-border)', fontSize: '0.8rem', padding: '10px 20px', cursor: 'pointer', background: 'var(--color-bg-base)', fontWeight: '600' }}
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <div className="password-change-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>Change Password</h4>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowPasswordChange(false);
                          setSecurityForm((prev) => ({
                            ...prev,
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          }));
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-accent-red)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="section-note">Enter your current password and set a new password below.</p>
                    
                    <div className="input-group">
                      <label>Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        required={showPasswordChange}
                        value={securityForm.currentPassword}
                        onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      />
                    </div>

                    <div className="form-grid-row">
                      <div className="input-group">
                        <label>New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          required={showPasswordChange}
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="input-group">
                        <label>Confirm New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          required={showPasswordChange}
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={securitySaving} className="btn-pill solid account-submit-btn">
                  {securitySaving ? 'Updating...' : 'Save Settings'}
                </button>
              </form>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
