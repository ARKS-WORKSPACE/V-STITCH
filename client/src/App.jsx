import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailView from './components/ProductDetailView';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import AccountView from './components/AccountView';

const API_BASE = 'http://localhost:5001/api';

export default function App() {
  // Navigation & View States
  const [activeView, setActiveView] = useState('home'); // 'home', 'shop', 'product-detail', 'checkout', 'success', 'stores', 'everworld', 'blog-post', 'about'
  const [activeProductId, setActiveProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Catalog State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null); // null, 'category', 'gender', 'color', 'size'

  // Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist / Favorites State
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Testimonials Slider state
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Newsletter Email state
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Checkout shipping form
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    country: 'United States'
  });
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'cod'
  const [upiId, setUpiId] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [createdOrder, setCreatedOrder] = useState(null);

  // Footer columns expanded state for mobile
  const [expandedFooterCols, setExpandedFooterCols] = useState({});
  const toggleFooterCol = (colKey) => {
    setExpandedFooterCols(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  // Sync cart & favorites
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Operations
  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    localStorage.setItem('token', authToken);
    addToast(`Signed in as ${authUser.username}`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    addToast('Logged out.', 'info');
    setActiveView('home');
  };

  // Toggle wishlist favorite
  const handleToggleFavorite = (prodId) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.includes(prodId);
      if (isAlreadyFav) {
        addToast('Removed from favorites', 'info');
        return prev.filter((id) => id !== prodId);
      } else {
        addToast('Added to favorites', 'success');
        return [...prev, prodId];
      }
    });
  };

  // Fetch catalog
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedGender) params.append('gender', selectedGender);
      if (sortBy !== 'featured') params.append('sort', sortBy);

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      if (!res.ok) throw new Error('Catalog retrieval failed');
      let data = await res.json();

      // Apply client-side color & size filtering if set (since backend filters are basic)
      if (selectedColor) {
        // Simple mock match: descriptions or title containing color name
        data = data.filter(p =>
          p.title.toLowerCase().includes(selectedColor.toLowerCase()) ||
          p.description.toLowerCase().includes(selectedColor.toLowerCase())
        );
      }
      if (selectedSize) {
        data = data.filter(p => p.size.toLowerCase() === selectedSize.toLowerCase());
      }

      setProducts(data);
    } catch (err) {
      console.error(err);
      addToast('Cannot fetch products. Make sure server is running.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedGender, selectedColor, selectedSize, sortBy, activeView]);

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        size: product.size || 'M',
        color: product.color || 'Heather Charcoal',
        quantity: 1,
        maxQty: product.quantity || 10
      }];
    });
  };

  const handleUpdateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => item.productId === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
    addToast('Removed item from cart', 'info');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    addToast(`Subscribed successfully with email ${newsletterEmail}!`, 'success');
    setNewsletterEmail('');
  };

  // Checkout handling
  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!user) {
      setIsAuthModalOpen(true);
      addToast('Please Sign In to proceed to checkout.', 'info');
    } else {
      setShippingForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        shippingAddress: user.shippingAddress || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'United States'
      });
      setCheckoutStep(1);
      setActiveView('checkout');
    }
  };

  const validateShippingForm = () => {
    const errors = {};
    if (!shippingForm.firstName.trim()) errors.firstName = 'First Name is required';
    if (!shippingForm.lastName.trim()) errors.lastName = 'Last Name is required';
    if (!shippingForm.email.trim() || !/\S+@\S+\.\S+/.test(shippingForm.email)) errors.email = 'Valid Email is required';
    if (!shippingForm.shippingAddress.trim()) errors.shippingAddress = 'Address is required';
    if (!shippingForm.city.trim()) errors.city = 'City is required';
    if (!shippingForm.postalCode.trim()) errors.postalCode = 'Postal Code is required';
    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentForm = () => {
    const errors = {};
    if (paymentMethod === 'card') {
      if (!paymentForm.cardName.trim()) errors.cardName = 'Name on Card is required';
      if (paymentForm.cardNumber.replace(/\s/g, '').length < 12) errors.cardNumber = 'Provide a valid credit card number';
      if (!paymentForm.cardExpiry.trim()) errors.cardExpiry = 'Expiry Date is required';
      if (paymentForm.cardCvv.length < 3) errors.cardCvv = 'CVV code required';
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) errors.upiId = 'Provide a valid UPI ID (e.g. name@upi)';
    }
    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      if (validateShippingForm()) {
        setCheckoutErrors({});
        setCheckoutStep(2);
      }
      return;
    }

    if (!validatePaymentForm()) return;

    try {
      const orderPayload = {
        items: cart.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          size: i.size,
          color: i.color
        })),
        customerName: `${shippingForm.firstName} ${shippingForm.lastName}`,
        email: shippingForm.email,
        shippingAddress: shippingForm.shippingAddress,
        city: shippingForm.city,
        postalCode: shippingForm.postalCode,
        country: shippingForm.country,
        paymentCardName: paymentMethod === 'card' ? paymentForm.cardName : paymentMethod === 'upi' ? `UPI: ${upiId}` : 'On-Delivery (COD)',
        paymentMethod: paymentMethod,
        totalPrice: cart.reduce((acc, i) => acc + i.price * i.quantity, 0)
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      if (!res.ok) throw new Error('Order creation failed');
      const order = await res.json();

      setCreatedOrder(order);
      setCart([]);
      setActiveView('success');

      // Reset checkout step
      setCheckoutStep(1);
    } catch (err) {
      console.error(err);
    }
  };

  // Everlane Stores Array
  const stores = [
    { name: 'University Village', city: 'Seattle', desc: 'Find us in the beautiful open-air village. Carrying both Men\'s and Women\'s collections.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop' },
    { name: 'Valencia Street', city: 'San Francisco', desc: 'Our historic Mission District location displaying cleaner denim and premium alpaca wool.', img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop' },
    { name: 'Stanford Shopping Center', city: 'Palo Alto', desc: 'Sunny outdoor courtyard display showcasing our latest cashmere and micro-rib collections.', img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop' },
    { name: 'Abbot Kinney', city: 'Los Angeles', desc: 'Located on LA\'s premier art and fashion boulevard. Extremely light-filled minimal build.', img: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&auto=format&fit=crop' },
    { name: 'Seaport', city: 'Boston', desc: 'A stunning wood-lined harbor front shop featuring our full winter coats and ReWool jacket lines.', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop' },
    { name: 'Prince Street', city: 'New York', desc: 'In the heart of Soho. Carrying our full shoe index, pants collections, and outerwear lines.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop' },
    { name: 'Williamsburg', city: 'Brooklyn', desc: 'Industrial brick walls hosting our core wardrobe basics and annual impact report displays.', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=600&auto=format&fit=crop' },
    { name: 'King of Prussia Mall', city: 'King of Prussia', desc: 'Find us on the upper level showcasing organic cotton layers and technical activewear.', img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop' },
    { name: 'Georgetown', city: 'Georgetown', desc: 'Located in the historic neighborhood. Two floors of cleaner fashion, shoes, and bags.', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop' }
  ];

  return (
    <div className="app-viewport">
      {/* Toast notifications */}
      <div className="toasts-wrapper">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Auth Sign in modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Navbar header layout */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onCheckoutDirect={handleCheckoutClick}
        wishlistCount={favorites.length}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
      />

      {/* Cart drawer slide */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutClick}
        isAuthenticated={!!user}
        onAddToCart={handleAddToCart}
      />

      {/* Page Switching Layouts */}
      <AnimatePresence mode="wait">

        {/* --- Home View (Everlane Replica) --- */}
        {activeView === 'home' && (
          <motion.main
            key="view-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Cozy Era Hero Banner */}
            <div
              className="hero-cozy"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop')` }}
            >
              <div className="hero-cozy-content">
                <h1 className="hero-cozy-title">Everyday Ease</h1>
                <p className="hero-cozy-desc">Welcome to your ease.
                  Comfort meets modern design. Essentials that balance softness, structure, and sustainability.
                </p>
                <button className="btn-pill solid" style={{ background: '#87CEFA', color: '#151515', border: 'none' }} onClick={() => { setSelectedGender('Women'); setActiveView('shop'); }}>Shop Now</button>
              </div>
            </div>

            {/* Shop by Category Strip */}
            <div className="container" style={{ marginTop: '4rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400', textAlign: 'center', marginBottom: '2rem' }}>Shop by Category</h2>
              <div className="categories-strip-container">
                <div className="category-card-small" onClick={() => { setSelectedGender('Women'); setSelectedCategory('Tops'); setActiveView('shop'); }}>
                  <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" alt="Sweaters" className="category-card-small-img" />
                  <span className="category-card-small-title">Women's Sweaters</span>
                </div>
                <div className="category-card-small" onClick={() => { setSelectedGender('Women'); setSelectedCategory('Bottoms'); setActiveView('shop'); }}>
                  <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop" alt="Bottoms" className="category-card-small-img" />
                  <span className="category-card-small-title">Women's Bottoms</span>
                </div>
                <div className="category-card-small" onClick={() => { setSelectedGender('Women'); setSelectedCategory('Accessories'); setActiveView('shop'); }}>
                  <img src="https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&auto=format&fit=crop" alt="Boots" className="category-card-small-img" />
                  <span className="category-card-small-title">Women's Boots</span>
                </div>
                <div className="category-card-small" onClick={() => { setSelectedGender('Men'); setSelectedCategory(''); setActiveView('shop'); }}>
                  <img src="https://images.unsplash.com/photo-1618335829737-2228915674e0?w=600&auto=format&fit=crop" alt="Best Sellers" className="category-card-small-img" />
                  <span className="category-card-small-title">Men's Best Sellers</span>
                </div>
              </div>
            </div>

            {/* Mid Stacked Promos */}
            <div className="container mid-banners-grid">
              <div className="mid-banner-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop')` }} onClick={() => { setSelectedCategory('New Arrivals'); setActiveView('shop'); }}>
                <div className="mid-banner-card-overlay"></div>
                <div className="mid-banner-card-content">
                  <h3 className="mid-banner-title">New Arrivals</h3>
                  <span className="mid-banner-action">Shop The Latest</span>
                </div>
              </div>
              <div className="mid-banner-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop')` }} onClick={() => { setSelectedCategory(''); setActiveView('shop'); }}>
                <div className="mid-banner-card-overlay"></div>
                <div className="mid-banner-card-content">
                  <h3 className="mid-banner-title">Best Sellers</h3>
                  <span className="mid-banner-action">Shop Favorites</span>
                </div>
              </div>
              <div className="mid-banner-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=600&auto=format&fit=crop')` }} onClick={() => { setSelectedCategory('Outerwear'); setActiveView('shop'); }}>
                <div className="mid-banner-card-overlay"></div>
                <div className="mid-banner-card-content">
                  <h3 className="mid-banner-title">The Holiday Outfit</h3>
                  <span className="mid-banner-action">View The Collection</span>
                </div>
              </div>
            </div>

            {/* Green Mission Callout */}
            <div className="mission-green-banner">
              <h2 className="mission-green-title">Who's on a Mission To Clean Up the Industry?</h2>
              <p className="mission-green-desc">We partner with the best, ethical factories around the world. Source only the finest materials. And share those stories with you—down to the true cost of every product.</p>
              <button className="btn-pill outlined" style={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => setActiveView('about')}>Learn More</button>
            </div>

            {/* Everlane Favorites Strip */}
            <div className="container trending-section" style={{ margin: '4rem auto' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400', marginBottom: '2rem', textAlign: 'center' }}>V-stitch Favorites</h2>
              {loading ? (
                <div className="stitch-loader-container"><div className="stitch-loader"></div></div>
              ) : (
                <div className="products-grid">
                  {products.slice(0, 5).map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onClick={(item) => {
                        setActiveProductId(item._id);
                        setActiveView('product-detail');
                      }}
                      onQuickAdd={handleAddToCart}
                      isFavorite={favorites.includes(p._id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Split Testimonial row */}
            <div className="container editorial-testimonial">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop" alt="Portrait" className="testimonial-portrait-img" />
              <div className="testimonial-editorial-content">
                <div className="testimonial-stars"><i className="ri-star-fill"></i><i className="ri-star-fill"></i><i className="ri-star-fill"></i><i className="ri-star-fill"></i><i className="ri-star-fill"></i></div>
                <blockquote className="testimonial-quote-large">"Love this shirt! It fits perfectly and the fabric is extremely nice to touch. Definitely worth it."</blockquote>
                <div className="testimonial-author-desc">— Darrell S., Verified Customer</div>
              </div>
            </div>

            {/* Holiday Gift Picks Row */}
            <div className="container" style={{ margin: '4rem auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="mid-banner-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&auto=format&fit=crop')`, height: '400px' }} onClick={() => setActiveView('shop')}>
                <div className="mid-banner-card-overlay"></div>
                <div className="mid-banner-card-content">
                  <h3 className="mid-banner-title">Our Holiday Gift Picks</h3>
                  <span className="mid-banner-action">Shop Gifts</span>
                </div>
              </div>
              <div className="mid-banner-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop')`, height: '400px' }} onClick={() => setActiveView('shop')}>
                <div className="mid-banner-card-overlay"></div>
                <div className="mid-banner-card-content">
                  <h3 className="mid-banner-title">Cleaner Denim</h3>
                  <span className="mid-banner-action">Explore Denim</span>
                </div>
              </div>
            </div>

            {/* Everlane On You Social Gallery */}
            <div className="container" style={{ margin: '4rem auto' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '400', textAlign: 'center', marginBottom: '1rem' }}>V-stitch On You</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2.5rem' }}>Share your outfit styled with #VstitchOnYou for a chance to be featured.</p>
              <div className="on-you-grid">
                <div className="on-you-item" onClick={() => setActiveView('shop')}>
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop" alt="customer" className="on-you-img" />
                  <div className="on-you-hover-overlay"><i className="ri-instagram-line"></i></div>
                </div>
                <div className="on-you-item" onClick={() => setActiveView('shop')}>
                  <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&auto=format&fit=crop" alt="customer" className="on-you-img" />
                  <div className="on-you-hover-overlay"><i className="ri-instagram-line"></i></div>
                </div>
                <div className="on-you-item" onClick={() => setActiveView('shop')}>
                  <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop" alt="customer" className="on-you-img" />
                  <div className="on-you-hover-overlay"><i className="ri-instagram-line"></i></div>
                </div>
                <div className="on-you-item" onClick={() => setActiveView('shop')}>
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop" alt="customer" className="on-you-img" />
                  <div className="on-you-hover-overlay"><i className="ri-instagram-line"></i></div>
                </div>
              </div>
            </div>

            {/* Sustainability values banner */}
            <div className="sustainability-values-strip">
              <div className="container values-flex-container">
                <div className="value-box-card">
                  <div className="value-box-icon"><i className="ri-leaf-line"></i></div>
                  <h4 className="value-box-title">Carbon Commitment</h4>
                  <p className="value-box-desc">We target net-zero carbon emissions by 2050 using eco-materials and clean supply chains.</p>
                </div>
                <div className="value-box-card">
                  <div className="value-box-icon"><i className="ri-seedling-line"></i></div>
                  <h4 className="value-box-title">Environmental Initiatives</h4>
                  <p className="value-box-desc">We strive for organic cotton weaves and recycled synthetics to clean up our footprint.</p>
                </div>
                <div className="value-box-card">
                  <div className="value-box-icon"><i className="ri-building-2-line"></i></div>
                  <h4 className="value-box-title">Better Factories</h4>
                  <p className="value-box-desc">We audit each supplier facility regularly for safety, fair wages, and worker empowerment.</p>
                </div>
              </div>
            </div>
          </motion.main>
        )}

        {/* --- Shop View --- */}
        {activeView === 'shop' && (
          <motion.main
            key="view-shop"
            className="container"
            style={{ margin: '3rem auto' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '400', marginBottom: '2.5rem' }}>
              {selectedGender ? `${selectedGender}'s Apparel` : 'All Apparel'} {selectedCategory ? `— ${selectedCategory}` : ''}
            </h1>

            {/* Click catcher for dropdowns */}
            {activeFilterDropdown && (
              <div
                onClick={() => setActiveFilterDropdown(null)}
                style={{ position: 'fixed', inset: 0, zIndex: 9, background: 'transparent' }}
              />
            )}

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
              {/* Category Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'category' ? null : 'category')}
                  style={{ padding: '10px 18px', border: '1px solid var(--color-border)', backgroundColor: '#ffffff', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Category{selectedCategory ? `: ${selectedCategory}` : ''} <i className="ri-arrow-down-s-line"></i>
                </button>
                {activeFilterDropdown === 'category' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', padding: '15px', minWidth: '180px', zIndex: 10 }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {['Accessories', 'Outerwear', 'Tops', 'Bottoms'].map((cat) => (
                        <li
                          key={cat}
                          style={{ cursor: 'pointer', fontSize: '0.85rem', color: selectedCategory === cat ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: selectedCategory === cat ? '700' : '400', textDecoration: selectedCategory === cat ? 'underline' : 'none' }}
                          onClick={() => {
                            setSelectedCategory(selectedCategory === cat ? '' : cat);
                            setActiveFilterDropdown(null);
                          }}
                        >
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Gender Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'gender' ? null : 'gender')}
                  style={{ padding: '10px 18px', border: '1px solid var(--color-border)', backgroundColor: '#ffffff', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Gender{selectedGender ? `: ${selectedGender}` : ''} <i className="ri-arrow-down-s-line"></i>
                </button>
                {activeFilterDropdown === 'gender' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', padding: '15px', minWidth: '180px', zIndex: 10 }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {['Men', 'Women', 'Unisex'].map((gen) => (
                        <li
                          key={gen}
                          style={{ cursor: 'pointer', fontSize: '0.85rem', color: selectedGender === gen ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: selectedGender === gen ? '700' : '400', textDecoration: selectedGender === gen ? 'underline' : 'none' }}
                          onClick={() => {
                            setSelectedGender(selectedGender === gen ? '' : gen);
                            setActiveFilterDropdown(null);
                          }}
                        >
                          {gen}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Color Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'color' ? null : 'color')}
                  style={{ padding: '10px 18px', border: '1px solid var(--color-border)', backgroundColor: '#ffffff', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Color{selectedColor ? `: ${selectedColor}` : ''} <i className="ri-arrow-down-s-line"></i>
                </button>
                {activeFilterDropdown === 'color' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', padding: '15px', minWidth: '220px', zIndex: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { name: 'Black', hex: '#151515' },
                        { name: 'Blue', hex: '#4682b4' },
                        { name: 'Brown', hex: '#8b5a2b' },
                        { name: 'Grey', hex: '#8c8c8c' },
                        { name: 'White', hex: '#ffffff' },
                        { name: 'Charcoal', hex: '#333333' }
                      ].map((col) => (
                        <div
                          key={col.name}
                          onClick={() => {
                            setSelectedColor(selectedColor === col.name ? '' : col.name);
                            setActiveFilterDropdown(null);
                          }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: col.hex,
                              border: selectedColor === col.name ? '2.5px solid var(--color-text-primary)' : '1px solid #ddd',
                              display: 'block'
                            }}
                          />
                          <span style={{ fontSize: '0.7rem', color: selectedColor === col.name ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: selectedColor === col.name ? '700' : '400' }}>{col.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Size Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'size' ? null : 'size')}
                  style={{ padding: '10px 18px', border: '1px solid var(--color-border)', backgroundColor: '#ffffff', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Size{selectedSize ? `: ${selectedSize}` : ''} <i className="ri-arrow-down-s-line"></i>
                </button>
                {activeFilterDropdown === 'size' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', padding: '15px', minWidth: '220px', zIndex: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {['XS', 'S', 'M', 'L', 'XL', '26', '27', '30', '32'].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => {
                            setSelectedSize(selectedSize === sz ? '' : sz);
                            setActiveFilterDropdown(null);
                          }}
                          style={{
                            padding: '8px 0',
                            border: selectedSize === sz ? '1px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                            backgroundColor: selectedSize === sz ? 'var(--color-text-primary)' : 'transparent',
                            color: selectedSize === sz ? '#ffffff' : 'var(--color-text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedGender || selectedColor || selectedSize || searchQuery) && (
                <button
                  onClick={() => { setSelectedCategory(''); setSelectedGender(''); setSelectedColor(''); setSelectedSize(''); setSearchQuery(''); }}
                  style={{ background: 'none', border: '1px solid var(--color-accent-red)', color: 'var(--color-accent-red)', padding: '10px 18px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.05em' }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Showing <strong>{products.length}</strong> items</span>
                <select
                  className="form-select"
                  style={{ width: '180px', padding: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              {loading ? (
                <div className="stitch-loader-container"><div className="stitch-loader"></div></div>
              ) : products.length === 0 ? (
                <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>No apparel found. Try clearing filters.</div>
              ) : (
                <div className="products-grid">
                  {products.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onClick={(item) => {
                        setActiveProductId(item._id);
                        setActiveView('product-detail');
                      }}
                      onQuickAdd={handleAddToCart}
                      isFavorite={favorites.includes(p._id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.main>
        )}

        {/* --- Product Detail View --- */}
        {activeView === 'product-detail' && activeProductId && (
          <motion.div key="view-pdp">
            <ProductDetailView
              productId={activeProductId}
              onBack={() => setActiveView('home')}
              onAddToCart={handleAddToCart}
              onProductClick={(id) => setActiveProductId(id)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          </motion.div>
        )}

        {/* --- Checkout View --- */}
        {activeView === 'checkout' && (
          <motion.main
            key="view-checkout"
            className="container checkout-page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="checkout-layout">
              {/* Left Shipping/Payment Pane */}
              <div className="checkout-form-pane">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
                  {checkoutStep === 1 ? 'Shipping Address' : 'Payment Method'}
                </h2>

                <form onSubmit={handlePlaceOrder}>
                  {checkoutStep === 1 ? (
                    <>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="michael@ymail.com"
                          value={shippingForm.email}
                          onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        />
                        {checkoutErrors.email && <div className="form-error-msg">{checkoutErrors.email}</div>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={shippingForm.firstName}
                            onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                          />
                          {checkoutErrors.firstName && <div className="form-error-msg">{checkoutErrors.firstName}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={shippingForm.lastName}
                            onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                          />
                          {checkoutErrors.lastName && <div className="form-error-msg">{checkoutErrors.lastName}</div>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Street Address</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="123 Fashion Row"
                          value={shippingForm.shippingAddress}
                          onChange={(e) => setShippingForm({ ...shippingForm, shippingAddress: e.target.value })}
                        />
                        {checkoutErrors.shippingAddress && <div className="form-error-msg">{checkoutErrors.shippingAddress}</div>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            className="form-input"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          />
                          {checkoutErrors.city && <div className="form-error-msg">{checkoutErrors.city}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Postal Code</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="10001"
                            value={shippingForm.postalCode}
                            onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                          />
                          {checkoutErrors.postalCode && <div className="form-error-msg">{checkoutErrors.postalCode}</div>}
                        </div>
                      </div>

                      <button type="submit" className="btn-pill solid" style={{ width: '100%', marginTop: '1rem' }}>
                        Continue to Payment
                      </button>
                    </>
                  ) : (
                    <>
                      <>
                        {/* Payment Method Selector */}
                        <div className="payment-method-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('card'); setCheckoutErrors({}); }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px',
                              border: paymentMethod === 'card' ? '2px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                              backgroundColor: paymentMethod === 'card' ? 'rgba(0,0,0,0.02)' : 'transparent',
                              cursor: 'pointer',
                              borderRadius: '0px'
                            }}
                          >
                            <i className="ri-bank-card-line" style={{ fontSize: '1.25rem' }}></i>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('upi'); setCheckoutErrors({}); }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px',
                              border: paymentMethod === 'upi' ? '2px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                              backgroundColor: paymentMethod === 'upi' ? 'rgba(0,0,0,0.02)' : 'transparent',
                              cursor: 'pointer',
                              borderRadius: '0px'
                            }}
                          >
                            <i className="ri-qr-code-line" style={{ fontSize: '1.25rem' }}></i>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>UPI</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('cod'); setCheckoutErrors({}); }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px',
                              border: paymentMethod === 'cod' ? '2px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                              backgroundColor: paymentMethod === 'cod' ? 'rgba(0,0,0,0.02)' : 'transparent',
                              cursor: 'pointer',
                              borderRadius: '0px'
                            }}
                          >
                            <i className="ri-truck-line" style={{ fontSize: '1.25rem' }}></i>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>On-Delivery</span>
                          </button>
                        </div>

                        {/* Card Form */}
                        {paymentMethod === 'card' && (
                          <>
                            <div className="form-group">
                              <label className="form-label">Card Holder Name</label>
                              <input
                                type="text"
                                className="form-input"
                                value={paymentForm.cardName}
                                onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                              />
                              {checkoutErrors.cardName && <div className="form-error-msg">{checkoutErrors.cardName}</div>}
                            </div>

                            <div className="form-group">
                              <label className="form-label">Card Number</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="4242 4242 4242 4242"
                                value={paymentForm.cardNumber}
                                onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                              />
                              {checkoutErrors.cardNumber && <div className="form-error-msg">{checkoutErrors.cardNumber}</div>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <div className="form-group">
                                <label className="form-label">Expiration Date</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="MM/YY"
                                  value={paymentForm.cardExpiry}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, cardExpiry: e.target.value })}
                                />
                                {checkoutErrors.cardExpiry && <div className="form-error-msg">{checkoutErrors.cardExpiry}</div>}
                              </div>
                              <div className="form-group">
                                <label className="form-label">Security Code (CVV)</label>
                                <input
                                  type="password"
                                  className="form-input"
                                  placeholder="123"
                                  value={paymentForm.cardCvv}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, cardCvv: e.target.value })}
                                />
                                {checkoutErrors.cardCvv && <div className="form-error-msg">{checkoutErrors.cardCvv}</div>}
                              </div>
                            </div>
                          </>
                        )}

                        {/* UPI Form */}
                        {paymentMethod === 'upi' && (
                          <div className="form-group">
                            <label className="form-label">UPI ID</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="username@bank"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                            {checkoutErrors.upiId && <div className="form-error-msg">{checkoutErrors.upiId}</div>}
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', display: 'block' }}>
                              A payment request will be sent to this virtual payment address.
                            </span>
                          </div>
                        )}

                        {/* Cash on Delivery Info */}
                        {paymentMethod === 'cod' && (
                          <div
                            style={{
                              padding: '1.5rem',
                              border: '1px solid var(--color-border)',
                              backgroundColor: 'var(--color-bg-subtle)',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'center'
                            }}
                          >
                            <i className="ri-checkbox-circle-line" style={{ fontSize: '1.5rem', color: '#2b3a2a' }}></i>
                            <div style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--color-text-secondary)' }}>
                              <strong>Cash on Delivery (COD) / Pay on Delivery:</strong> No advance payment required. You can pay using Cash, Cards, or UPI directly to the delivery executive when your package arrives.
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                          <button type="button" className="btn-pill outlined" style={{ flex: 1 }} onClick={() => setCheckoutStep(1)}>
                            Back
                          </button>
                          <button type="submit" className="btn-pill solid" style={{ flex: 2 }}>
                            {paymentMethod === 'cod' ? 'Confirm Order' : 'Pay Now'}
                          </button>
                        </div>
                      </>
                    </>
                  )}
                </form>
              </div>

              {/* Right Summary Pane */}
              <div className="checkout-summary-box" style={{ borderRadius: '0px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '1.5rem' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                  {cart.map((item) => (
                    <div key={item.productId} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={item.image} alt={item.title} style={{ width: '50px', aspectRatio: '3/4', objectFit: 'cover' }} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Color: {item.color} • Size: {item.size} • Qty: {item.quantity}</div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>${cart.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Total Due</span>
                  <span>${cart.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.main>
        )}

        {/* --- Success View --- */}
        {activeView === 'success' && createdOrder && (
          <motion.div
            key="view-success"
            className="container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ margin: '4rem auto', maxWidth: '600px', textAlign: 'center' }}
          >
            <div className="success-card" style={{ borderRadius: '0px' }}>
              <div className="success-icon-box" style={{ borderRadius: '50%' }}><i className="ri-checkbox-circle-line"></i></div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '8px', fontWeight: '400' }}>Order Confirmed</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>We've received your request and started building your package.</p>

              <div className="receipt-sheet" style={{ borderRadius: '0px' }}>
                <div className="receipt-row">
                  <span>Order Reference:</span>
                  <strong>{createdOrder._id}</strong>
                </div>
                <div className="receipt-row">
                  <span>Amount Paid:</span>
                  <strong>${createdOrder.totalPrice}</strong>
                </div>
              </div>

              <button className="btn-pill solid" onClick={() => setActiveView('home')}>Continue Shopping</button>
            </div>
          </motion.div>
        )}

        {/* --- Account View --- */}
        {activeView === 'account' && user && (
          <motion.main
            key="view-account"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AccountView
              API_BASE={API_BASE}
              user={user}
              token={token}
              onUserUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }}
              addToast={addToast}
              setActiveView={setActiveView}
            />
          </motion.main>
        )}

        {/* --- Stores View (Page 1) --- */}
        {activeView === 'stores' && (
          <motion.main
            key="view-stores"
            className="container stores-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="stores-header-title">Stores</h1>
            <p className="stores-subtitle">Find one of our 11 stores nearest you.</p>
            <div className="stores-grid">
              {stores.map((store) => (
                <div className="store-card" key={store.name}>
                  <img src={store.img} alt={store.name} className="store-card-img" />
                  <div className="store-card-content">
                    <span className="store-card-city">{store.city}</span>
                    <h3 className="store-card-name">{store.name}</h3>
                    <p className="store-card-desc">{store.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.main>
        )}

        {/* --- Everworld Stories View (Page 8) --- */}
        {activeView === 'everworld' && (
          <motion.main
            key="view-everworld"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="everworld-hero">
              <div className="container">
                <h1 className="everworld-logo-large">everworld</h1>
                <p className="everworld-tagline">We're on a mission to clean up a dirty industry. These are the people, stories, and ideas that will help us get there.</p>
              </div>
            </div>

            <div className="container">
              <h2 className="everworld-section-title">The Latest</h2>
              <div className="everworld-grid">
                <div className="everworld-card" onClick={() => setActiveView('blog-post')}>
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop" alt="whites" className="everworld-card-img" />
                  <span className="everworld-card-cat">Style</span>
                  <h3 className="everworld-card-title">How To Style Winter Whites</h3>
                  <p className="everworld-card-desc">Redefine your cold-weather dressing with clean textures and monochrome tones.</p>
                </div>
                <div className="everworld-card" onClick={() => setActiveView('about')}>
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop" alt="glossy" className="everworld-card-img" />
                  <span className="everworld-card-cat">Transparency</span>
                  <h3 className="everworld-card-title">We Won A Glossy Award</h3>
                  <p className="everworld-card-desc">Everlane has been recognized for outstanding leadership in sustainable supply chain initiatives.</p>
                </div>
                <div className="everworld-card" onClick={() => setActiveView('shop')}>
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop" alt="coordinate" className="everworld-card-img" />
                  <span className="everworld-card-cat">Community</span>
                  <h3 className="everworld-card-title">Coordinate Your Style</h3>
                  <p className="everworld-card-desc">Explore matching organic outfits for families, partners, and self-expression.</p>
                </div>
              </div>

              {/* Giant numbers row values */}
              <div className="values-giant-row">
                <div className="value-giant-item">
                  <div className="value-giant-num">01</div>
                  <h3 className="value-giant-title">Keep it Clean</h3>
                  <p className="value-giant-desc">Aiming for 100% recycled synthetics and organic fibers across the entirety of our catalog lists.</p>
                </div>
                <div className="value-giant-item">
                  <div className="value-giant-num">02</div>
                  <h3 className="value-giant-title">Do Right by People</h3>
                  <p className="value-giant-desc">Sourcing exclusively from certified facilities that secure fair wages, safe hours, and benefits.</p>
                </div>
                <div className="value-giant-item">
                  <div className="value-giant-num">03</div>
                  <h3 className="value-giant-title">Keep It Classic</h3>
                  <p className="value-giant-desc">Designed to outlast trends. Built with sturdy seams, quality wool, and timeless structures.</p>
                </div>
              </div>

              {/* Progress targets */}
              <h2 className="everworld-section-title" style={{ textAlign: 'center', marginTop: '2rem' }}>Our Progress Status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', margin: '0 auto 6rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>
                    <span>Recycled Materials Usage</span>
                    <span>88%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e5e5e5', width: '100%' }}>
                    <div style={{ height: '100%', backgroundColor: '#2b3a2a', width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>
                    <span>Ethically Audited Factories</span>
                    <span>100%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e5e5e5', width: '100%' }}>
                    <div style={{ height: '100%', backgroundColor: '#2b3a2a', width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>
                    <span>Organic Cotton Sourcing</span>
                    <span>75%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e5e5e5', width: '100%' }}>
                    <div style={{ height: '100%', backgroundColor: '#2b3a2a', width: '75%' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </motion.main>
        )}

        {/* --- Blog Post Detail Page (Page 9) --- */}
        {activeView === 'blog-post' && (
          <motion.main
            key="view-blog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="container">
              <div className="blog-header-box">
                <span className="blog-cat-tag">Style</span>
                <h1 className="blog-main-title">How To Style Winter Whites</h1>
                <div className="blog-meta-line">Published July 2026 • 6 min read • Written by Everlane Editorial Team</div>
              </div>

              <div className="blog-hero-image-frame">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop" alt="whitedecor" className="blog-hero-img" />
              </div>

              <article className="blog-body-text">
                <p>In a season dominated by dark hues, redefine your winter wardrobe with the timeless elegance of winter whites. Whether top-to-toe white outfits, tonal mixing-and-matching, or a key white piece, give your style a breath of fresh air with this list of winter essentials.</p>

                <h3>1. Monochromatic Magic</h3>
                <p>Styling whites together is an instant indicator of clean, elevated taste. Try pairing a white organic cotton mock-neck turtleneck with our wool flannel trousers. The slight variance in cream and charcoal-whites creates a satisfying, dimensional palette.</p>

                <h3>2. Textures and Layers</h3>
                <p>To avoid flat styling, mix textures. A fuzzy cloud-like alpaca cardigan layered over a clean cotton ribbed tee provides instant interest and cozy warmth. Add structured leather flat shoes or western boots to anchor the soft textures.</p>

                <h3>3. Accentuate with Neutrals</h3>
                <p>If full-body white is too stark, blend in beige, camel, and tan tones. A camel suede saddle crossbody or a light newsboy cap provides a gentle contrast that keeps the aesthetic soft and warm.</p>
              </article>

              {/* The White Whites Edit Catalog */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4rem', marginBottom: '6rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400', textAlign: 'center', marginBottom: '2.5rem' }}>The White Whites Edit</h2>
                {loading ? (
                  <div className="stitch-loader-container"><div className="stitch-loader"></div></div>
                ) : (
                  <div className="products-grid">
                    {products.slice(0, 4).map(p => (
                      <ProductCard
                        key={p._id}
                        product={p}
                        onClick={(item) => {
                          setActiveProductId(item._id);
                          setActiveView('product-detail');
                        }}
                        onQuickAdd={handleAddToCart}
                        isFavorite={favorites.includes(p._id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.main>
        )}

        {/* --- About Us Page (Page 10) --- */}
        {activeView === 'about' && (
          <motion.main
            key="view-about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="about-hero-banner"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop')` }}
            >
              <div className="about-hero-overlay"></div>
              <div className="about-hero-content">
                <h1 className="about-hero-title">We believe we can all make a difference.</h1>
                <p className="about-hero-sub">Our Mission: Exceptional Quality. Ethical Factories. Radical Transparency.</p>
              </div>
            </div>

            <div className="container">
              <div className="about-content-row">
                <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop" alt="Ethical" className="about-img-frame" />
                <div className="about-text-pane">
                  <h2>Our Ethical Approach</h2>
                  <p>We spend months finding the best factories around the world—the same ones that produce your favorite designer labels. We visit them often, and build strong personal relationships with the owners.</p>
                  <p>Each factory is audited to evaluate factors like fair wages, reasonable hours, and clean environments. Our goal is a score of 90 or above for every single partner facility.</p>
                </div>
              </div>

              <div className="about-content-row" style={{ direction: 'rtl' }}>
                <img src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop" alt="Material" className="about-img-frame" style={{ direction: 'ltr' }} />
                <div className="about-text-pane" style={{ direction: 'ltr' }}>
                  <h2>Designed to Last</h2>
                  <p>At V-stitch, we’re not big on trends. We want you to wear our pieces for years, even decades, to come. That’s why we source the finest materials and factory partners for our timeless products—like Grade-A cashmere, Italian leather, and Peruvian Pima cotton.</p>
                  <p>We test every thread and button to ensure you won't have to replace them anytime soon.</p>
                </div>
              </div>

              <div className="about-content-row">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop" alt="Transparent" className="about-img-frame" />
                <div className="about-text-pane">
                  <h2>Radically Transparent</h2>
                  <p>We believe our customers have a right to know what their products cost to make. For every item we sell, we reveal the true cost of materials, labor, duties, and transport.</p>
                  <p>By bypassing traditional retail markup practices, we offer premium quality garments at a fraction of standard designer prices.</p>
                </div>
              </div>
            </div>
          </motion.main>
        )}

      </AnimatePresence>

      {/* Footer Newsletter subscription on all page views except success */}
      {activeView !== 'success' && (
        <footer className="newsletter-footer-box" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: '#151515', color: '#ffffff' }}>
          <div className="container">
            {/* Newsletter form */}
            <div className="newsletter-subscribe-section">
              <h2 className="newsletter-title" style={{ color: '#ffffff' }}>Subscribe To Our Newsletter</h2>
              <p className="newsletter-desc" style={{ color: '#8c8c8c' }}>
                Subscribe to get the latest announcements, deals, and collections sent directly to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-input-group">
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="newsletter-email-input"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{ borderRadius: '0px' }}
                />
                <button type="submit" className="newsletter-submit-btn" style={{ borderRadius: '0px', backgroundColor: '#ffffff', color: '#151515' }}>Subscribe Now</button>
              </form>
            </div>

            {/* Footer Navigation Columns grid */}
            <div className="footer-nav-grid" style={{ paddingTop: '3rem', borderTop: '1px solid #2a2a2a' }}>
              <div className="footer-logo-desc">
                <div className="logo" style={{ color: '#ffffff', fontFamily: 'var(--font-sans)', fontWeight: '800', letterSpacing: '0.25em' }}>
                  V-STITCH
                </div>
                <p className="footer-brand-desc" style={{ color: '#8c8c8c' }}>
                  Ethically sourced wardrobe staples designed to last. Radically transparent pricing.
                </p>
              </div>

              <div className={`footer-column ${expandedFooterCols['account'] ? 'expanded' : ''}`}>
                <h4 
                  style={{ color: '#ffffff' }}
                  className="footer-toggle-title"
                  onClick={() => toggleFooterCol('account')}
                >
                  <span>Account</span>
                  <i className={`ri-arrow-down-s-line footer-chevron ${expandedFooterCols['account'] ? 'rotated' : ''}`}></i>
                </h4>
                <ul className="footer-links-list">
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); if (user) handleLogout(); else setIsAuthModalOpen(true); }}>{user ? 'Log Out' : 'Sign In'}</a></li>
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); setIsAuthModalOpen(true); }}>Create Account</a></li>
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); setActiveView('shop'); }}>My Favorites</a></li>
                </ul>
              </div>

              <div className={`footer-column ${expandedFooterCols['about'] ? 'expanded' : ''}`}>
                <h4 
                  style={{ color: '#ffffff' }}
                  className="footer-toggle-title"
                  onClick={() => toggleFooterCol('about')}
                >
                  <span>About Us</span>
                  <i className={`ri-arrow-down-s-line footer-chevron ${expandedFooterCols['about'] ? 'rotated' : ''}`}></i>
                </h4>
                <ul className="footer-links-list">
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); setActiveView('about'); }}>Our Mission</a></li>
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); setActiveView('about'); }}>Our Factories</a></li>
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); setActiveView('everworld'); }}>Everworld Stories</a></li>
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); setActiveView('stores'); }}>Our Stores</a></li>
                </ul>
              </div>

              <div className={`footer-column ${expandedFooterCols['support'] ? 'expanded' : ''}`}>
                <h4 
                  style={{ color: '#ffffff' }}
                  className="footer-toggle-title"
                  onClick={() => toggleFooterCol('support')}
                >
                  <span>Support</span>
                  <i className={`ri-arrow-down-s-line footer-chevron ${expandedFooterCols['support'] ? 'rotated' : ''}`}></i>
                </h4>
                <ul className="footer-links-list">
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); alert('Please refer to details at our stores.'); }}>Help Center</a></li>
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); }}>Shipping & Returns</a></li>
                  <li><a href="#" className="footer-link-anchor" style={{ color: '#8c8c8c' }} onClick={(e) => { e.preventDefault(); }}>Contact Support</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom-bar" style={{ borderTop: '1px solid #2a2a2a' }}>
              <span style={{ color: '#8c8c8c' }}>Copyright &copy; 2026 V-STITCH . All Rights Reserved.</span>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1.1rem', color: '#8c8c8c' }}>
                <a href="#" aria-label="Facebook"><i className="ri-facebook-fill"></i></a>
                <a href="#" aria-label="Instagram"><i className="ri-instagram-line"></i></a>
                <a href="#" aria-label="Twitter"><i className="ri-twitter-x-line"></i></a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
