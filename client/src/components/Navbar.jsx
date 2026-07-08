import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  cartCount, 
  onOpenCart, 
  searchQuery, 
  setSearchQuery, 
  user, 
  onOpenAuth, 
  onLogout,
  onCheckoutDirect,
  wishlistCount,
  selectedCategory,
  setSelectedCategory,
  selectedGender,
  setSelectedGender
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeMegamenu, setActiveMegamenu] = useState(null); // null, 'women', 'men'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [animateCart, setAnimateCart] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCount) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 800);
      return () => clearTimeout(timer);
    }
    setPrevCartCount(cartCount);
  }, [cartCount, prevCartCount]);

  const handleNavClick = (view) => {
    setActiveView(view);
    setActiveMegamenu(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (activeView !== 'shop') {
      setActiveView('shop');
    }
  };

  // Everlane Megamenu content definitions
  const megamenuContent = {
    women: {
      highlights: ['Shop All New Arrivals', 'The Gift Guide', 'New Sweaters & Tops', 'New Bottoms', 'Best-Sellers', 'Under $100'],
      featured: ['The Holiday Outfit Edit', 'Giftable Sweaters', 'Uniform & Capsule', 'The Performance Chino Shop', 'Top Rated Women\'s Clothing'],
      promo1: { title: 'The Holiday Outfit Edit', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop' },
      promo2: { title: 'Giftable Sweaters', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop' }
    },
    men: {
      highlights: ['Shop All New Arrivals', 'Gift Guides', 'New Outerwear', 'New Denim', 'Best-Sellers', 'Under $100'],
      featured: ['The Fleece & Puffer Edit', 'Giftable Sweaters & Knits', 'Everyday Uniform', 'The Performance Chino Shop', 'Top Rated Men\'s Clothing'],
      promo1: { title: 'The Holiday Outfit Edit', img: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=600&auto=format&fit=crop' },
      promo2: { title: 'Giftable Sweaters', img: 'https://images.unsplash.com/photo-1618335829737-2228915674e0?w=800&auto=format&fit=crop' }
    }
  };

  // Render contextual sub-navigation
  const renderSubNavbar = () => {
    if (activeView === 'shop') {
      return (
        <div className="sub-navbar">
          <div className="container sub-nav-container">
            {['All Items', 'Holiday Gifting', 'New Arrivals', 'Outerwear', 'Tops', 'Bottoms', 'Accessories', 'Sale'].map((cat) => {
              const displayCat = cat === 'All Items' ? '' : cat;
              const isActive = selectedCategory === displayCat || (cat === 'All Items' && !selectedCategory);
              return (
                <span 
                  key={cat} 
                  className={`sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(displayCat);
                    setActiveView('shop');
                  }}
                >
                  {cat}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    const brandViews = ['stores', 'everworld', 'blog-post', 'about'];
    if (brandViews.includes(activeView)) {
      return (
        <div className="sub-navbar">
          <div className="container sub-nav-container">
            <span className={`sub-nav-link ${activeView === 'about' ? 'active' : ''}`} onClick={() => handleNavClick('about')}>About</span>
            <span className={`sub-nav-link ${activeView === 'stores' ? 'active' : ''}`} onClick={() => handleNavClick('stores')}>Stores</span>
            <span className={`sub-nav-link ${activeView === 'everworld' || activeView === 'blog-post' ? 'active' : ''}`} onClick={() => handleNavClick('everworld')}>Everworld Stories</span>
            <span className="sub-nav-link" onClick={() => handleNavClick('about')}>Factories</span>
            <span className="sub-nav-link" onClick={() => handleNavClick('about')}>Environmental Initiatives</span>
            <span className="sub-nav-link" onClick={() => handleNavClick('about')}>Our Carbon Commitment</span>
            <span className="sub-nav-link" onClick={() => handleNavClick('about')}>Annual Impact Report</span>
            <span className="sub-nav-link" onClick={() => handleNavClick('about')}>Cleaner Fashion</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <header style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 100 }}>
      {/* Top Promotion Announcement banner */}
      <div className="announcement-bar">
        Get early access on launches and offers. <strong style={{ color: '#ffffff', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleNavClick('everworld')}>Sign Up For Texts →</strong>
      </div>

      {/* Main Header Row */}
      <div className="navbar-header" onMouseLeave={() => setActiveMegamenu(null)}>
        <div className="container nav-container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', alignItems: 'center', height: '70px' }}>
          
          {/* Hamburger button (visible on mobile only) */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <i className="ri-menu-line"></i>
          </button>

          {/* Left Primary Navigation Links */}
          <nav className="desktop-nav">
            <ul className="nav-links" style={{ gap: '1.5rem', marginBottom: 0 }}>
              <li 
                className={`nav-link ${activeView === 'shop' && selectedGender === 'Women' ? 'active' : ''}`}
                onMouseEnter={() => setActiveMegamenu('women')}
                onClick={() => {
                  setSelectedGender('Women');
                  setSelectedCategory('');
                  handleNavClick('shop');
                }}
                style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}
              >
                Women
              </li>
              <li 
                className={`nav-link ${activeView === 'shop' && selectedGender === 'Men' ? 'active' : ''}`}
                onMouseEnter={() => setActiveMegamenu('men')}
                onClick={() => {
                  setSelectedGender('Men');
                  setSelectedCategory('');
                  handleNavClick('shop');
                }}
                style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}
              >
                Men
              </li>
              <li 
                className={`nav-link ${activeView === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
                style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}
              >
                About
              </li>
              <li 
                className={`nav-link ${activeView === 'everworld' || activeView === 'blog-post' ? 'active' : ''}`}
                onClick={() => handleNavClick('everworld')}
                style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}
              >
                Everworld Stories
              </li>
            </ul>
          </nav>

          {/* Center Logo centered in viewport */}
          <div 
            className="logo" 
            onClick={() => {
              setSelectedGender('');
              setSelectedCategory('');
              handleNavClick('home');
            }}
            style={{ 
              justifySelf: 'center', 
              fontFamily: 'var(--font-sans)', 
              fontWeight: '800', 
              fontSize: '1.6rem', 
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontStyle: 'normal',
              color: 'var(--color-text-primary)'
            }}
          >
            V-STITCH
          </div>

          {/* Right Action Icons & Search */}
          <div className="nav-actions" style={{ justifySelf: 'end', gap: '1rem' }}>
            
            {/* Minimalist Search box */}
            <div className="nav-search-bar" style={{ borderRadius: '0px', border: 'none', borderBottom: '1px solid var(--color-border)', width: '180px', padding: '4px 0' }}>
              <i className="ri-search-line" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}></i>
              <input
                type="text"
                placeholder="Search..."
                className="nav-search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ paddingLeft: '4px', fontSize: '0.8rem' }}
              />
            </div>

            {/* Profile Menus */}
            {user ? (
              <div className="user-menu-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button 
                  className="nav-action-btn" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Account Settings"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt="Avatar" 
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }} 
                    />
                  ) : (
                    <i className="ri-user-line" style={{ fontSize: '1.15rem' }}></i>
                  )}
                </button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="drawer-backdrop" style={{ background: 'none', zIndex: 100 }} onClick={() => setShowUserMenu(false)} />
                      <motion.div 
                        className="user-popover"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{ right: 0, top: '40px', position: 'absolute', background: '#ffffff', border: '1px solid var(--color-border)', padding: '15px', minWidth: '160px', zIndex: 101 }}
                      >
                        <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', color: 'var(--color-text-primary)' }}>{user.username}</div>
                        <button 
                          onClick={() => {
                            setActiveView('account');
                            setShowUserMenu(false);
                          }}
                          className="user-popover-btn"
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 0', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}
                        >
                          <i className="ri-user-settings-line"></i> My Account
                        </button>
                        <button 
                          onClick={() => {
                            onLogout();
                            setShowUserMenu(false);
                          }}
                          className="user-popover-btn"
                          style={{ background: 'none', border: 'none', color: 'var(--color-accent-red)', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 0', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <i className="ri-logout-box-r-line"></i> Log Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                className="nav-action-btn" 
                onClick={onOpenAuth}
                aria-label="Sign In"
                style={{ fontSize: '1.15rem' }}
              >
                <i className="ri-user-line"></i>
              </button>
            )}

            {/* Wishlist Hearts */}
            <button 
              className="nav-action-btn"
              onClick={() => handleNavClick('shop')}
              aria-label="Wishlist"
              style={{ fontSize: '1.15rem' }}
            >
              <i className="ri-heart-line"></i>
              {wishlistCount > 0 && (
                <span className="nav-cart-badge" style={{ backgroundColor: 'var(--color-accent-red)', width: '14px', height: '14px', fontSize: '0.6rem' }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Bag Button with add to bag bounce/shake indication style */}
            <motion.button 
              className="nav-action-btn" 
              onClick={onOpenCart} 
              aria-label="Bag items"
              style={{ fontSize: '1.15rem', position: 'relative' }}
              animate={animateCart ? { 
                scale: [1, 1.4, 0.9, 1.2, 1],
                rotate: [0, -12, 12, -12, 0]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              <i className="ri-shopping-bag-2-line" style={{ transition: 'color 0.3s ease', color: animateCart ? '#87CEFA' : 'inherit' }}></i>
              {cartCount > 0 && (
                <span className="nav-cart-badge" style={{ backgroundColor: animateCart ? '#87CEFA' : 'var(--color-text-primary)', color: animateCart ? 'var(--color-text-primary)' : '#ffffff', transition: 'background-color 0.3s ease, color 0.3s ease', width: '14px', height: '14px', fontSize: '0.6rem' }}>
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Hover Megamenu Dropdowns */}
        <AnimatePresence>
          {activeMegamenu && (
            <motion.div 
              className="megamenu-panel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '2rem', width: '100%' }}>
                
                {/* Column 1: Highlights */}
                <div className="megamenu-column">
                  <h4>Highlights</h4>
                  <ul>
                    {megamenuContent[activeMegamenu].highlights.map((item) => (
                      <li key={item} onClick={() => {
                        setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men');
                        setSelectedCategory(item.includes('Sweaters') || item.includes('Tops') ? 'Tops' : item.includes('Bottoms') || item.includes('Denim') ? 'Bottoms' : item.includes('Outerwear') ? 'Outerwear' : '');
                        handleNavClick('shop');
                      }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Featured Shops */}
                <div className="megamenu-column">
                  <h4>Featured Shops</h4>
                  <ul>
                    {megamenuContent[activeMegamenu].featured.map((item) => (
                      <li key={item} onClick={() => {
                        setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men');
                        handleNavClick('shop');
                      }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Apparel Categories */}
                <div className="megamenu-column">
                  <h4>Apparel</h4>
                  <ul>
                    <li onClick={() => { setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men'); setSelectedCategory('Tops'); handleNavClick('shop'); }}>Tops & Sweaters</li>
                    <li onClick={() => { setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men'); setSelectedCategory('Bottoms'); handleNavClick('shop'); }}>Pants & Jeans</li>
                    <li onClick={() => { setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men'); setSelectedCategory('Outerwear'); handleNavClick('shop'); }}>Outerwear</li>
                    <li onClick={() => { setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men'); setSelectedCategory('Accessories'); handleNavClick('shop'); }}>Shoes & Bags</li>
                  </ul>
                </div>

                {/* Column 4: Image Promotions row */}
                <div className="megamenu-promo-card">
                  <div className="megamenu-promo-item" onClick={() => { setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men'); handleNavClick('shop'); }}>
                    <img src={megamenuContent[activeMegamenu].promo1.img} alt="Promo" className="megamenu-promo-img" />
                    <span className="megamenu-promo-label">{megamenuContent[activeMegamenu].promo1.title}</span>
                  </div>
                  <div className="megamenu-promo-item" onClick={() => { setSelectedGender(activeMegamenu === 'women' ? 'Women' : 'Men'); handleNavClick('shop'); }}>
                    <img src={megamenuContent[activeMegamenu].promo2.img} alt="Promo" className="megamenu-promo-img" />
                    <span className="megamenu-promo-label">{megamenuContent[activeMegamenu].promo2.title}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Secondary Dynamic Navigation Strip */}
      {renderSubNavbar()}

      {/* Mobile Drawer menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <div className="drawer-backdrop" style={{ zIndex: 1000 }} onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div 
              className="mobile-nav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#ffffff', zIndex: 1001, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', padding: '20px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <span style={{ fontWeight: '800', letterSpacing: '0.1em', fontSize: '1rem', textTransform: 'uppercase' }}>V-STITCH</span>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 0 }}>
                <li 
                  onClick={() => { setSelectedGender('Women'); setSelectedCategory(''); handleNavClick('shop'); setIsMobileMenuOpen(false); }}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Women <i className="ri-arrow-right-s-line"></i>
                </li>
                <li 
                  onClick={() => { setSelectedGender('Men'); setSelectedCategory(''); handleNavClick('shop'); setIsMobileMenuOpen(false); }}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Men <i className="ri-arrow-right-s-line"></i>
                </li>
                <li 
                  onClick={() => { handleNavClick('about'); setIsMobileMenuOpen(false); }}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  About <i className="ri-arrow-right-s-line"></i>
                </li>
                <li 
                  onClick={() => { handleNavClick('everworld'); setIsMobileMenuOpen(false); }}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Everworld Stories <i className="ri-arrow-right-s-line"></i>
                </li>
                <li 
                  onClick={() => { handleNavClick('stores'); setIsMobileMenuOpen(false); }}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Our Stores <i className="ri-arrow-right-s-line"></i>
                </li>
                
                <li style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0' }}></li>
                
                {user ? (
                  <>
                    <li 
                      onClick={() => { handleNavClick('account'); setIsMobileMenuOpen(false); }}
                      style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {user.profilePic ? (
                        <img 
                          src={user.profilePic} 
                          alt="Avatar" 
                          style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <i className="ri-user-settings-line"></i>
                      )} My Account
                    </li>
                    <li 
                      onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                      style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <i className="ri-logout-box-r-line"></i> Log Out
                    </li>
                  </>
                ) : (
                  <li 
                    onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                    style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="ri-user-line"></i> Sign In / Register
                  </li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
