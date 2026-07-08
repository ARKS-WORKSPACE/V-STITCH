import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  isAuthenticated,
  onAddToCart
}) {
  const [wrapProduct, setWrapProduct] = useState(false);

  // Lock background body scroll when Cart Drawer is open to prevent touch/scroll conflicts
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const wrapCharge = wrapProduct ? 10 : 0;
  const rawSubtotal = itemsSubtotal + wrapCharge;
  const subtotal = rawSubtotal;

  const FREE_SHIPPING_THRESHOLD = 75;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const shippingPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Mock "Before You Go" Everlane cross-sell beanie item
  const mockBeanie = {
    _id: 'cross_beanie_id',
    title: 'The Good Merino Wool Beanie',
    price: 35,
    category: 'Accessories',
    gender: 'Unisex',
    size: 'One Size',
    color: 'Chambray Blue',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=800&auto=format&fit=crop',
    quantity: 10
  };

  const handleAddBeanie = () => {
    onAddToCart(mockBeanie);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ zIndex: 1000 }}
          />

          {/* Drawer Panel */}
          <motion.div 
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{ zIndex: 1001, borderRadius: '0px', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="cart-drawer-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="cart-drawer-title" style={{ textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.1em', fontWeight: '700' }}>
                Your Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
              <button className="cart-drawer-close" onClick={onClose} aria-label="Close Bag">
                <i className="ri-close-line" style={{ fontSize: '1.25rem' }}></i>
              </button>
            </div>

            {/* Shipping Threshold bar */}
            {cartItems.length > 0 && (
              <div className="shipping-progress-box" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="shipping-progress-text" style={{ fontSize: '0.8rem' }}>
                  {remainingForFreeShipping > 0 ? (
                    <span>Spend <strong>${remainingForFreeShipping.toFixed(2)}</strong> more for free shipping</span>
                  ) : (
                    <span style={{ color: '#2b3a2a', fontWeight: '700' }}>You qualify for Free Shipping!</span>
                  )}
                </div>
                <div className="shipping-progress-bar-bg" style={{ borderRadius: '0px', height: '4px', marginTop: '6px' }}>
                  <div 
                    className="shipping-progress-bar-fill"
                    style={{ width: `${shippingPercent}%`, borderRadius: '0px', backgroundColor: '#2b3a2a' }}
                  />
                </div>
              </div>
            )}

            {/* Scrollable Content Container */}
            <div className="cart-items-list" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {cartItems.length === 0 ? (
                <div className="cart-empty-state" style={{ padding: '4rem 0', textAlign: 'center' }}>
                  <i className="ri-shopping-bag-line cart-empty-icon" style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'block' }}></i>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Your bag is empty</h3>
                  <button 
                    className="btn-pill solid" 
                    style={{ marginTop: '1.5rem', width: '100%' }}
                    onClick={onClose}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cartItems.map((item) => (
                      <div className="cart-item" key={item.productId} style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #f5f5f5', paddingBottom: '1.5rem' }}>
                        <img src={item.image} alt={item.title} className="cart-item-image" style={{ width: '70px', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '0px' }} />
                        <div className="cart-item-info" style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h3 className="cart-item-title" style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.title}</h3>
                            <span className="cart-item-price" style={{ fontSize: '0.85rem', fontWeight: '700' }}>${item.price * item.quantity}</span>
                          </div>

                          <div className="cart-item-details" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                            {item.color} / {item.size}
                          </div>

                          <div className="cart-item-qty-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="qty-selector" style={{ borderRadius: '0px', border: '1px solid var(--color-border)', height: '28px' }}>
                              <button 
                                className="qty-btn"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                <i className="ri-subtract-line"></i>
                              </button>
                              <span className="qty-value" style={{ fontSize: '0.8rem' }}>{item.quantity}</span>
                              <button 
                                className="qty-btn"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <i className="ri-add-line"></i>
                              </button>
                            </div>

                            <button 
                              className="cart-item-remove-btn"
                              onClick={() => onRemoveItem(item.productId)}
                              aria-label="Remove item"
                              style={{ border: 'none', background: 'none', textDecoration: 'underline', color: 'var(--color-text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* "Before You Go" Cross-sell panel */}
                  {/* Only show if the beanie is not already in the cart list */}
                  {!cartItems.some(i => i.title === mockBeanie.title) && (
                    <div className="cross-sell-box" style={{ marginTop: '2rem' }}>
                      <h4 className="cross-sell-title">Before You Go</h4>
                      <div className="cross-sell-item">
                        <img src={mockBeanie.image} alt={mockBeanie.title} className="cross-sell-img" />
                        <div className="cross-sell-details">
                          <h5 className="cross-sell-name">{mockBeanie.title}</h5>
                          <span className="cross-sell-price">${mockBeanie.price}</span>
                        </div>
                        <button className="cross-sell-add-btn" onClick={handleAddBeanie}>
                          ADD
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Calculations & Subtotal Footer */}
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer" style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="checkbox-container" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={wrapProduct} 
                      onChange={(e) => setWrapProduct(e.target.checked)} 
                    />
                    <span>Add premium gift packaging ($10.00)</span>
                  </label>
                </div>

                <div className="cart-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span>Subtotal</span>
                  <strong>${itemsSubtotal.toFixed(2)}</strong>
                </div>
                {wrapProduct && (
                  <div className="cart-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span>Gift Wrap Charge</span>
                    <span>$10.00</span>
                  </div>
                )}
                <div className="cart-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '15px' }}>
                  <span>Shipping</span>
                  <span>{remainingForFreeShipping > 0 ? '$8.00' : 'Free'}</span>
                </div>
                
                <div className="cart-summary-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '700', borderTop: '1px solid #eee', paddingTop: '12px', marginBottom: '1.5rem' }}>
                  <span>Total</span>
                  <span>${(subtotal + (remainingForFreeShipping > 0 ? 8 : 0)).toFixed(2)}</span>
                </div>

                <button 
                  className="btn-pill solid" 
                  style={{ width: '100%', borderRadius: '0px', padding: '14px', fontSize: '0.85rem' }}
                  onClick={onCheckout}
                >
                  Continue to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
